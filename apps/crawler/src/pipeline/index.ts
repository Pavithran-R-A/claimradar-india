/**
 * Main crawl pipeline orchestrator.
 *
 * Wires adapters → extraction → dedup → scoring → AI → validation → publication.
 */

import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { loadCrawlerEnv } from '../env.js';
import { getAdapter } from '../adapters/registry.js';
import type { CrawlContext } from '../adapters/types.js';
import type { SourceDefinition } from '@claimradar/source-registry';
import type { Source, ClaimableStatus } from '@claimradar/database';
import { checkDuplicate } from '../deduplication/index.js';
import type { ExistingDocument } from '../deduplication/index.js';
import { scoreDocument } from '../scoring/classifier.js';
import { AIExtractor } from '../ai/extraction.js';
import { createProviderRouter } from '../ai/router.js';
import { AIBudgetManager } from '../ai/budget.js';
import { CircuitBreaker } from '../ai/circuit-breaker.js';
import { verifyEvidence } from '../validation/evidence.js';
import { runAllValidators } from '../validation/runner.js';
import { computeClaimabilityScore } from '../validation/scorer.js';
import { decidePublication } from '../publication/policy.js';
import { extractionSchema } from '@claimradar/claim-schema';
import { DatabaseWriter, InMemoryDryRunWriter, type IDatabaseWriter } from './db-writer.js';
import { createLogger, type Logger } from '../observability/logger.js';
import {
  createEmptySummary,
  formatSummaryText,
  formatSummaryJson,
  type CrawlSummary,
} from '../observability/summary.js';
import { initSentry, captureError } from '../observability/sentry.js';
import { createAlertSink } from '../observability/alerts.js';
import { classifyError } from '../observability/failure-categories.js';

export class StagingPolicyViolationError extends Error {
  readonly violations: string[];
  constructor(violations: string[]) {
    super(
      `CRITICAL POLICY VIOLATION: Staging invariants violated (${violations.join(', ')}). Ingestion refused.`,
    );
    this.name = 'StagingPolicyViolationError';
    this.violations = violations;
  }
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PipelineOptions {
  dryRun: boolean;
  sourceFilter?: string;
  skipAI: boolean;
  storage?: IDatabaseWriter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a DB Source row to the SourceDefinition shape expected by adapters. */
const LEGACY_ADAPTER_ALIASES: Readonly<Record<string, string>> = {
  pib_rss_demo: 'rss-pib',
  pib_rss: 'rss-pib',
  'pib-rss': 'rss-pib',
  sebi_rss_demo: 'rss-sebi',
  sebi_rss: 'rss-sebi',
  'sebi-rss': 'rss-sebi',
  rbi_rss_demo: 'rss-rbi',
  rbi_rss: 'rss-rbi',
  'rbi-rss': 'rss-rbi',
  generic_rss: 'rss-generic',
  'generic-rss': 'rss-generic',
};

export function normalizeAdapterType(adapterName: string): string {
  const normalized = adapterName.trim().toLowerCase();
  return LEGACY_ADAPTER_ALIASES[normalized] ?? adapterName;
}

function toSourceDefinition(source: Source): SourceDefinition {
  const meta = source.metadata ?? {};
  const feedUrl = typeof meta['feedUrl'] === 'string' ? meta['feedUrl'] : undefined;
  const config =
    typeof meta['config'] === 'object' && meta['config'] !== null
      ? (meta['config'] as Record<string, unknown>)
      : undefined;

  return {
    id: source.id,
    name: source.name,
    domain: source.domain,
    sourceType: source.source_type as SourceDefinition['sourceType'],
    adapterType: normalizeAdapterType(source.adapter_name),
    baseUrl: source.base_url ?? '',
    trustLevel: source.trust_level,
    rateLimit: { requestsPerMinute: source.rate_limit_per_minute },
    ...(feedUrl !== undefined ? { feedUrl } : {}),
    ...(config !== undefined ? { config } : {}),
  };
}

/** Run promises with bounded concurrency. */
async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      await fn(items[current]!);
    }
  });
  await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// Per-source processing
// ---------------------------------------------------------------------------

interface SourceStats {
  discovered: number;
  fetched: number;
  unchanged: number;
  duplicates: number;
  candidates: number;
  errors: number;
}

async function processSource(params: {
  source: Source;
  db: IDatabaseWriter;
  runId: string;
  logger: Logger;
  summary: CrawlSummary;
  env: ReturnType<typeof loadCrawlerEnv>;
  options: PipelineOptions;
  aiExtractor: AIExtractor | null;
  crawlRunSourceId: string | null;
  alertSink: ReturnType<typeof createAlertSink>;
}): Promise<void> {
  const { source, db, runId, logger, summary, env, options, aiExtractor, crawlRunSourceId } =
    params;
  const alertSink = params.alertSink;
  const stats: SourceStats = {
    discovered: 0,
    fetched: 0,
    unchanged: 0,
    duplicates: 0,
    candidates: 0,
    errors: 0,
  };
  let firstDocumentError: string | null = null;

  try {
    const sourceDef = toSourceDefinition(source);
    const adapter = getAdapter(sourceDef);

    const context: CrawlContext = {
      runId,
      dryRun: options.dryRun,
      userAgent: env.CRAWLER_USER_AGENT,
      timeoutMs: env.CRAWLER_REQUEST_TIMEOUT_MS,
      ...(env.CRAWLER_CONTACT_EMAIL !== undefined
        ? { contactEmail: env.CRAWLER_CONTACT_EMAIL }
        : {}),
    };

    // 1. Discover documents
    const discovered = await adapter.discover(context);
    stats.discovered = discovered.length;
    summary.documentsDiscovered += stats.discovered;
    logger.info('discover', `Discovered ${stats.discovered} documents`, { sourceId: source.id });

    // 2. Pre-load existing docs for dedup
    const existingDocs: ExistingDocument[] = await db.getSourceDocumentsForDedup(source.id);

    // 3. Process each discovered document
    for (const doc of discovered) {
      try {
        // Fetch
        const fetched = await adapter.fetchDocument(doc, context);
        stats.fetched++;
        summary.documentsFetched++;

        // 304 Not Modified
        if (fetched.metadata['wasCached'] === true && fetched.content.length === 0) {
          stats.unchanged++;
          summary.documentsUnchanged++;
          continue;
        }

        // Dedup check
        const dedupInput = {
          url: doc.url,
          contentHash: fetched.contentHash,
          sourceId: source.id,
          ...(doc.sourceIdentifier !== undefined ? { sourceIdentifier: doc.sourceIdentifier } : {}),
          ...(doc.title !== undefined ? { title: doc.title } : {}),
          ...(doc.publishedAt !== undefined ? { publishedAt: doc.publishedAt } : {}),
        };
        const dedupResult = checkDuplicate(dedupInput, existingDocs);
        if (dedupResult.isDuplicate) {
          stats.duplicates++;
          summary.documentsDuplicate++;
          logger.debug('dedup', `Duplicate skipped: ${doc.url}`, {
            sourceId: source.id,
            strategy: dedupResult.matchedStrategy,
          });
          continue;
        }

        // Insert source_document
        const rawText =
          typeof fetched.content === 'string' ? fetched.content : fetched.content.toString('utf-8');

        const sourceDocId = await db.insertSourceDocument({
          source_id: source.id,
          canonical_url: doc.url,
          source_identifier: doc.sourceIdentifier ?? null,
          title: doc.title ?? null,
          published_at: doc.publishedAt ?? null,
          content_hash: fetched.contentHash,
          etag: fetched.etag,
          last_modified: fetched.lastModified,
          mime_type: fetched.contentType ?? null,
          language: 'en',
          raw_text: rawText,
          extraction_status: 'pending',
          raw_storage_path: null,
          metadata: fetched.metadata,
        });

        if (!sourceDocId) {
          // DB-level duplicate (conflict on insert)
          stats.duplicates++;
          summary.documentsDuplicate++;
          continue;
        }

        // Keyword scoring
        const scoringResult = scoreDocument({
          text: rawText,
          source: source.name,
          ...(doc.title !== undefined ? { title: doc.title } : {}),
        });

        if (!scoringResult.isCandidate) {
          logger.debug('scoring', `Not a candidate: ${doc.url}`, {
            sourceId: source.id,
            score: scoringResult.score,
          });
          continue;
        }

        // Create candidate_document
        const candidateId = await db.insertCandidateDocument({
          crawl_run_id: runId,
          source_document_id: sourceDocId,
          keyword_score: scoringResult.score,
          ai_extraction_status: 'pending',
          ai_provider: null,
          ai_model: null,
          ai_prompt_version: null,
          ai_schema_version: null,
          ai_raw_output: null,
          ai_extracted_data: null,
          ai_confidence: null,
          ai_duration_ms: null,
          ai_token_count: null,
          ai_error_category: null,
          ai_retry_count: 0,
          second_pass_status: 'not_started',
          second_pass_output: null,
          validation_status: 'pending',
          publication_decision: 'pending',
        });
        stats.candidates++;
        summary.candidatesCreated++;

        // AI extraction
        if (options.skipAI || !aiExtractor) {
          summary.recordsQueued++;
          await db.updateCandidateDocument(candidateId, {
            ai_extraction_status: 'deferred',
            publication_decision: 'human_review',
          });
          continue;
        }

        // Run AI extraction
        const aiResult = await aiExtractor.extract(rawText, 1);
        summary.aiCallsUsed++;

        if (aiResult.errorCategory !== 'none' || !aiResult.extraction) {
          summary.aiCallsFailed++;
          logger.warn('ai', `AI extraction failed: ${aiResult.error}`, {
            sourceId: source.id,
            documentId: sourceDocId,
            errorCategory: aiResult.errorCategory,
          });
          if (!options.dryRun) {
            await db.updateCandidateDocument(candidateId, {
              ai_extraction_status: 'failed',
              ai_error_category: aiResult.errorCategory,
              ai_provider: aiResult.provider,
              ai_model: aiResult.model,
              ai_duration_ms: aiResult.durationMs,
            });
            await db.insertAiRun({
              candidate_document_id: candidateId,
              pass_number: 1,
              provider: aiResult.provider,
              model: aiResult.model,
              prompt_version: null,
              schema_version: null,
              input_tokens: aiResult.inputTokens,
              output_tokens: aiResult.outputTokens,
              duration_ms: aiResult.durationMs,
              result_status: aiResult.errorCategory,
              error_category: aiResult.errorCategory,
              raw_output: null,
              structured_output: null,
            });
          }
          continue;
        }

        // Validate extraction with Zod
        const parseResult = extractionSchema.safeParse(aiResult.extraction);
        if (!parseResult.success) {
          logger.warn('ai', 'AI extraction failed Zod validation', {
            sourceId: source.id,
            documentId: sourceDocId,
          });
          if (!options.dryRun) {
            await db.updateCandidateDocument(candidateId, {
              ai_extraction_status: 'invalid_output',
              ai_provider: aiResult.provider,
              ai_model: aiResult.model,
            });
          }
          continue;
        }

        let extraction = parseResult.data;

        // Not relevant → skip
        if (!extraction.is_relevant) {
          if (!options.dryRun) {
            await db.updateCandidateDocument(candidateId, {
              ai_extraction_status: 'completed',
              ai_provider: aiResult.provider,
              ai_model: aiResult.model,
              ai_confidence: extraction.confidence,
              ai_duration_ms: aiResult.durationMs,
              ai_extracted_data: extraction as unknown as Record<string, unknown>,
              publication_decision: 'not_relevant',
            });
          }
          continue;
        }

        // Second-pass extraction: attempt if confidence is low and budget allows
        if (extraction.confidence < 0.7 && aiExtractor) {
          const pass2Result = await aiExtractor.extract(rawText, 2);
          summary.aiCallsUsed++;

          if (pass2Result.extraction && pass2Result.extraction.confidence > extraction.confidence) {
            // Use pass2 result — re-validate with Zod
            const pass2Parse = extractionSchema.safeParse(pass2Result.extraction);
            if (pass2Parse.success && pass2Parse.data.is_relevant) {
              // Replace extraction with higher-confidence pass2 result
              extraction = pass2Parse.data;

              if (!options.dryRun) {
                await db.insertAiRun({
                  candidate_document_id: candidateId,
                  pass_number: 2,
                  provider: pass2Result.provider,
                  model: pass2Result.model,
                  prompt_version: null,
                  schema_version: null,
                  input_tokens: pass2Result.inputTokens,
                  output_tokens: pass2Result.outputTokens,
                  duration_ms: pass2Result.durationMs,
                  result_status: 'success',
                  error_category: null,
                  raw_output: pass2Result.rawOutput ? { raw: pass2Result.rawOutput } : null,
                  structured_output: pass2Result.extraction as unknown as Record<string, unknown>,
                });
                await db.updateCandidateDocument(candidateId, {
                  second_pass_status: 'completed',
                  second_pass_output: pass2Result.extraction as unknown as Record<string, unknown>,
                });
              }
            }
          } else if (!options.dryRun) {
            // Pass 2 didn't improve or failed — record as failed
            await db.updateCandidateDocument(candidateId, {
              second_pass_status: pass2Result.extraction ? 'completed' : 'failed',
              second_pass_output: pass2Result.extraction
                ? (pass2Result.extraction as unknown as Record<string, unknown>)
                : null,
            });
          }
        }

        // Evidence verification
        const evidenceResult = verifyEvidence(extraction, rawText);

        // Run validators
        const validationResults = runAllValidators({
          extraction,
          sourceText: rawText,
          sourceDomain: source.domain,
          trustLevel: source.trust_level,
          documentDate: doc.publishedAt ?? null,
          evidenceVerification: evidenceResult,
        });

        // Compute claimability score
        const claimabilityScore = computeClaimabilityScore({
          validationResults,
          aiConfidence: extraction.confidence,
          sourceTrustLevel: source.trust_level,
          evidenceCount: evidenceResult.results.length,
          evidenceVerified: evidenceResult.allVerified,
        });

        // Publication decision
        const pubDecision = decidePublication({
          extraction,
          validationResults,
          claimabilityScore,
          sourceDomain: source.domain,
          trustLevel: source.trust_level,
          featureFlags: { AUTO_VERIFY_CLAIMABLES: env.AUTO_VERIFY_CLAIMABLES },
        });

        // Update candidate record and audit events in DB
        if (!options.dryRun) {
          await db.updateCandidateDocument(candidateId, {
            ai_extraction_status: 'completed',
            ai_provider: aiResult.provider,
            ai_model: aiResult.model,
            ai_confidence: extraction.confidence,
            ai_duration_ms: aiResult.durationMs,
            ai_token_count: (aiResult.inputTokens ?? 0) + (aiResult.outputTokens ?? 0),
            ai_extracted_data: extraction as unknown as Record<string, unknown>,
            validation_status: validationResults.overallDecision,
            publication_decision: pubDecision.action,
          });

          // Persist AI run
          await db.insertAiRun({
            candidate_document_id: candidateId,
            pass_number: 1,
            provider: aiResult.provider,
            model: aiResult.model,
            prompt_version: null,
            schema_version: null,
            input_tokens: aiResult.inputTokens,
            output_tokens: aiResult.outputTokens,
            duration_ms: aiResult.durationMs,
            result_status: 'success',
            error_category: null,
            raw_output: aiResult.rawOutput ? { raw: aiResult.rawOutput } : null,
            structured_output: extraction as unknown as Record<string, unknown>,
          });

          // Persist validation results
          for (const vr of validationResults.results) {
            await db.insertValidationResult({
              candidate_document_id: candidateId,
              validator_name: vr.name,
              passed: vr.passed,
              details: vr.details,
            });
          }

          // Persist publication event
          await db.insertPublicationEvent({
            claimable_id: null,
            candidate_document_id: candidateId,
            action: pubDecision.action,
            previous_status: null,
            new_status: pubDecision.status as unknown as ClaimableStatus | null,
            actor_type: 'pipeline',
            actor_id: null,
            reason: pubDecision.reasons.join('; '),
          });
        }

        // Update summary counters (runs in both dry-run and live modes)
        switch (pubDecision.action) {
          case 'auto_publish':
            summary.recordsPublished++;
            break;
          case 'human_review':
            summary.recordsQueued++;
            break;
          case 'reject':
            summary.recordsRejected++;
            break;
        }

        logger.info('candidate', `Candidate processed: ${doc.url}`, {
          sourceId: source.id,
          candidateId,
          score: claimabilityScore,
          decision: pubDecision.action,
        });
      } catch (docError) {
        const errMsg = docError instanceof Error ? docError.message : 'unknown';
        const isExpectedLimitation =
          source.id === 'pib-rss' && (errMsg.includes('HTTP 403') || errMsg.includes('403'));

        if (isExpectedLimitation) {
          summary.expectedLimitationCount++;
        } else {
          summary.unexpectedErrorCount++;
        }
        summary.errorCount++;
        stats.errors++;
        firstDocumentError ??= errMsg;
        logger.error('document', `Document processing failed: ${doc.url}`, {
          sourceId: source.id,
          error: errMsg,
          isExpectedLimitation,
        });
        if (!options.dryRun) {
          await db.insertCrawlError(runId, {
            source_id: source.id,
            error_type: 'document_error',
            error_message: docError instanceof Error ? docError.message : 'unknown',
            url: doc.url,
          });
        }
      }
    }

    // Per-document failures make the source incomplete.
    if (stats.errors > 0) {
      summary.sourcesFailed++;
      const errorMessage = firstDocumentError ?? 'Document processing failed';
      const category = classifyError(errorMessage);
      if (crawlRunSourceId && !options.dryRun) {
        await db.updateCrawlRunSource(crawlRunSourceId, {
          status: 'failed',
          documents_found: stats.discovered,
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        });
      }
      summary.perSource.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        ...stats,
      });
      alertSink.emit({
        alertType: 'crawl-source-failure',
        severity: 'warning',
        message: `Source ${source.name} had document failures`,
        category,
        sourceId: source.id,
        runId,
      });
      logger.warn('source', `Source completed with document failures: ${source.name}`, {
        sourceId: source.id,
        error: errorMessage,
        errorCode: category,
        ...stats,
      });
    } else {
      if (crawlRunSourceId && !options.dryRun) {
        await db.updateCrawlRunSource(crawlRunSourceId, {
          status: 'completed',
          documents_found: stats.discovered,
          completed_at: new Date().toISOString(),
        });
      }
      summary.sourcesSucceeded++;
      summary.perSource.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'succeeded',
        ...stats,
      });
      logger.info('source', `Source completed: ${source.name}`, {
        sourceId: source.id,
        ...stats,
      });
    }
  } catch (sourceError) {
    summary.sourcesFailed++;
    summary.errorCount++;
    stats.errors++;
    const errorMessage = sourceError instanceof Error ? sourceError.message : 'unknown';
    const category = classifyError(errorMessage);
    summary.perSource.push({
      sourceId: source.id,
      sourceName: source.name,
      status: 'failed',
      ...stats,
    });
    logger.error('source', `Source failed: ${source.name}`, {
      sourceId: source.id,
      error: errorMessage,
      errorCode: category,
    });
    alertSink.emit({
      alertType: 'crawl-source-failure',
      severity: 'warning',
      message: `Source ${source.name} failed during crawl`,
      category,
      sourceId: source.id,
      runId,
    });
    if (crawlRunSourceId && !options.dryRun) {
      await db.updateCrawlRunSource(crawlRunSourceId, {
        status: 'failed',
        error_message: sourceError instanceof Error ? sourceError.message : 'unknown',
        completed_at: new Date().toISOString(),
      });
    }
    if (!options.dryRun) {
      await db.insertCrawlError(runId, {
        source_id: source.id,
        error_type: 'source_error',
        error_message: sourceError instanceof Error ? sourceError.message : 'unknown',
      });
    }
    if (sourceError instanceof Error) {
      captureError(sourceError, { sourceId: source.id, stage: 'source' });
    }
  }
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function runPipeline(options: PipelineOptions): Promise<CrawlSummary> {
  const env = loadCrawlerEnv({ dryRun: options.dryRun });
  const runId = randomUUID();
  const logger = createLogger(runId);
  const summary = createEmptySummary(runId);
  const alertSink = createAlertSink({
    sink: env.ALERT_SINK,
    dedupWindowMinutes: env.ALERT_DEDUP_WINDOW_MINUTES,
  });

  // Sentry (optional)
  await initSentry(env.SENTRY_DSN);

  // Policy guard audit — staging must never auto-verify, bill, or notify customers.
  const guardViolations: string[] = [];
  if (env.AUTO_VERIFY_CLAIMABLES) guardViolations.push('AUTO_VERIFY_CLAIMABLES=true');
  if (env.ENABLE_BILLING) guardViolations.push('ENABLE_BILLING=true');
  if (env.NOTIFY_CUSTOMERS_ENABLED) guardViolations.push('NOTIFY_CUSTOMERS_ENABLED=true');

  logger.info('pipeline', 'Pipeline started', {
    dryRun: options.dryRun,
    skipAI: options.skipAI,
    guards: {
      APP_ENV: env.APP_ENV,
      AUTO_VERIFY_CLAIMABLES: env.AUTO_VERIFY_CLAIMABLES,
      ENABLE_BILLING: env.ENABLE_BILLING,
      NOTIFY_CUSTOMERS_ENABLED: env.NOTIFY_CUSTOMERS_ENABLED,
      LIVE_ADAPTERS_ENABLED: env.LIVE_ADAPTERS_ENABLED,
    },
  });

  // Populate effective policy guards snapshot
  summary.effectivePolicyGuards = {
    APP_ENV: env.APP_ENV,
    AUTO_VERIFY_CLAIMABLES: env.AUTO_VERIFY_CLAIMABLES,
    ENABLE_BILLING: env.ENABLE_BILLING,
    NOTIFY_CUSTOMERS_ENABLED: env.NOTIFY_CUSTOMERS_ENABLED,
    LIVE_ADAPTERS_ENABLED: env.LIVE_ADAPTERS_ENABLED,
  };

  if (guardViolations.length > 0) {
    const violationMessage = `Policy guard violation: ${guardViolations.join(', ')}`;
    alertSink.emit({
      alertType: 'policy-guard-violation',
      severity: 'critical',
      message: violationMessage,
      runId,
    });
    logger.error('pipeline', violationMessage);
    // Fail closed: throw typed error so ingestion is refused and process exits non-zero
    throw new StagingPolicyViolationError(guardViolations);
  }

  // Database / Storage Adapter
  const db: IDatabaseWriter =
    options.storage ?? (options.dryRun ? new InMemoryDryRunWriter() : new DatabaseWriter());

  // Create crawl_runs record
  let crawlRunId: string | null = null;
  if (!options.dryRun) {
    try {
      crawlRunId = await db.createCrawlRun('running', runId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Database error creating crawl_run';
      logger.error('pipeline', msg, { errorCode: 'DATABASE_ERROR' });
      alertSink.emit({
        alertType: 'database-failure',
        severity: 'critical',
        message: 'Failed to create crawl_runs record — database unavailable',
        category: 'DATABASE_ERROR',
        runId,
      });
      captureError(err instanceof Error ? err : new Error(msg), {
        stage: 'pipeline',
        operation: 'createCrawlRun',
      });
      summary.errorCount++;
      return summary;
    }
  }

  // AI setup
  let aiExtractor: AIExtractor | null = null;
  if (!options.skipAI) {
    const provider = createProviderRouter({
      AI_PROVIDER: env.AI_PROVIDER,
      OPENROUTER_MODEL: env.OPENROUTER_MODEL,
      NVIDIA_MODEL: env.NVIDIA_MODEL,
      ...(env.OPENROUTER_API_KEY !== undefined
        ? { OPENROUTER_API_KEY: env.OPENROUTER_API_KEY }
        : {}),
      ...(env.NVIDIA_API_KEY !== undefined ? { NVIDIA_API_KEY: env.NVIDIA_API_KEY } : {}),
      ...(env.NVIDIA_BASE_URL !== undefined ? { NVIDIA_BASE_URL: env.NVIDIA_BASE_URL } : {}),
    });

    if (provider.isAvailable() && provider.name !== 'noai') {
      const budget = new AIBudgetManager(
        env.AI_DAILY_REQUEST_BUDGET,
        env.AI_SECOND_PASS_RESERVE,
        env.AI_MAX_ATTEMPTS_PER_DOCUMENT,
      );
      const circuitBreaker = new CircuitBreaker();
      aiExtractor = new AIExtractor(provider, budget, circuitBreaker);
    }
  }

  // Get sources
  let sources: Source[];
  try {
    sources = await db.getEnabledSources();
  } catch (err) {
    if (options.dryRun) {
      const { initialSources } = await import('@claimradar/source-registry');
      sources = initialSources.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        base_url: s.baseUrl,
        source_type: s.sourceType,
        adapter_name: s.adapterType,
        trust_level: s.trustLevel,
        enabled: true,
        fetch_frequency_hours: 24,
        rate_limit_per_minute: s.rateLimit.requestsPerMinute,
        robots_checked_at: null,
        terms_checked_at: null,
        last_run_at: null,
        last_success_at: null,
        failure_count: 0,
        metadata: s.feedUrl ? { feedUrl: s.feedUrl } : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } else {
      const msg = err instanceof Error ? err.message : 'Failed to fetch sources from database';
      logger.error('pipeline', msg, { errorCode: 'DATABASE_ERROR' });
      alertSink.emit({
        alertType: 'database-failure',
        severity: 'critical',
        message: 'Failed to fetch enabled sources — database unavailable',
        category: 'DATABASE_ERROR',
        runId,
      });
      captureError(err instanceof Error ? err : new Error(msg), {
        stage: 'pipeline',
        operation: 'getEnabledSources',
      });
      summary.errorCount++;
      return summary;
    }
  }

  // Apply source filter (id, adapter_name, or name substring)
  if (options.sourceFilter) {
    const filter = options.sourceFilter.toLowerCase();
    const normalizedFilter = normalizeAdapterType(filter);
    sources = sources.filter(
      (s) =>
        s.id === options.sourceFilter ||
        normalizeAdapterType(s.adapter_name) === normalizedFilter ||
        s.name.toLowerCase().includes(filter),
    );
  }

  summary.sourcesAttempted = sources.length;

  // Process sources with bounded concurrency
  await runWithConcurrency(sources, env.CRAWLER_CONCURRENCY, async (source) => {
    let crawlRunSourceId: string | null = null;
    if (crawlRunId && !options.dryRun) {
      crawlRunSourceId = await db.createCrawlRunSource(crawlRunId, source.id, 'running');
    }

    await processSource({
      source,
      db,
      runId: crawlRunId ?? runId,
      logger,
      summary,
      env,
      options,
      aiExtractor,
      crawlRunSourceId,
      alertSink,
    });
  });

  // Finalise
  summary.completedAt = new Date();
  summary.durationMs = summary.completedAt.getTime() - summary.startedAt.getTime();

  if (crawlRunId && !options.dryRun) {
    await db.updateCrawlRun(crawlRunId, {
      status: summary.errorCount > 0 ? 'completed_with_errors' : 'completed',
      completed_at: summary.completedAt.toISOString(),
      sources_attempted: summary.sourcesAttempted,
      sources_succeeded: summary.sourcesSucceeded,
      documents_discovered: summary.documentsDiscovered,
      candidates_created: summary.candidatesCreated,
      ai_budget_used: summary.aiCallsUsed,
    });
  }

  // Print summary
  logger.info('pipeline', 'Pipeline completed', { durationMs: summary.durationMs });
  console.log(formatSummaryText(summary));
  console.log(formatSummaryJson(summary));

  // Persist machine-readable summary for CI artifacts / job summaries.
  if (env.CRAWLER_SUMMARY_FILE !== undefined && env.CRAWLER_SUMMARY_FILE !== '') {
    try {
      const targetPath = path.isAbsolute(env.CRAWLER_SUMMARY_FILE)
        ? env.CRAWLER_SUMMARY_FILE
        : path.resolve(process.cwd(), env.CRAWLER_SUMMARY_FILE);
      writeFileSync(targetPath, formatSummaryJson(summary), 'utf-8');
      logger.info('pipeline', `Summary written to ${targetPath}`);
    } catch (err) {
      logger.warn('pipeline', `Failed to write summary file: ${env.CRAWLER_SUMMARY_FILE}`, {
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  // Alert on degraded runs (deduplicated within the alert window).
  if (summary.sourcesFailed > 0) {
    alertSink.emit({
      alertType: 'crawl-completed-with-failures',
      severity: summary.sourcesSucceeded === 0 ? 'critical' : 'warning',
      message: `Crawl finished with ${summary.sourcesFailed}/${summary.sourcesAttempted} failed sources`,
      runId,
      context: { errorCount: summary.errorCount, aiCallsFailed: summary.aiCallsFailed },
    });
  }
  if (summary.aiCallsFailed > 0 && summary.sourcesFailed === 0) {
    alertSink.emit({
      alertType: 'ai-provider-degraded',
      severity: 'warning',
      message: `Crawl finished with ${summary.aiCallsFailed} failed AI call(s)`,
      category: 'AI_PROVIDER_ERROR',
      runId,
    });
  }

  return summary;
}
