import { runPipeline } from './pipeline/index.js';
import { loadCrawlerEnv } from './env.js';
export { loadCrawlerEnv };
import { createAdminClient } from '@claimradar/database';
import type { Source } from '@claimradar/database';
import type { SourceDefinition } from '@claimradar/source-registry';
import type { IDatabaseWriter } from './pipeline/db-writer.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function main() {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs.filter((arg) => arg !== '--');
  const command = args[0];

  // Parse --dry-run flag
  const dryRun = args.includes('--dry-run');

  switch (command) {
    case 'daily': {
      // Full pipeline run
      const { isFatalCrawlSummary } = await import('./observability/summary.js');
      const summary = await runPipeline({ dryRun, skipAI: false });
      const fatal = isFatalCrawlSummary(summary);
      if (fatal) {
        console.error(
          `Crawl failed with ${summary.unexpectedErrorCount} unexpected errors and ${summary.sourcesFailed} failed sources`,
        );
        process.exit(1);
      } else {
        if (summary.expectedLimitationCount > 0) {
          console.warn(
            `Crawl completed with ${summary.expectedLimitationCount} expected source limitations (e.g. PIB detail 403s)`,
          );
        } else {
          console.log('Crawl completed successfully');
        }
        process.exit(0);
      }
      break;
    }
    case 'source': {
      // Run single source: crawler source --source=pib-rss or --source pib-rss
      const sourceArg = args.find((a) => a.startsWith('--source='));
      const sourceIdx = args.indexOf('--source');
      const sourceFilter = sourceArg
        ? sourceArg.split('=')[1]
        : sourceIdx >= 0 && sourceIdx + 1 < args.length
          ? args[sourceIdx + 1]
          : undefined;
      if (!sourceFilter) {
        console.error('Usage: crawler source --source=<source-id>');
        process.exit(1);
      }
      const summary = await runPipeline({ dryRun, sourceFilter, skipAI: false });
      console.log(
        summary.errorCount > 0
          ? `Completed with ${summary.errorCount} errors`
          : 'Crawl completed successfully',
      );
      break;
    }
    case 'health': {
      // Source health checks with failure categories, persisted health events,
      // and credential-free structured alerts. Exits 1 when any source fails.
      console.log('Running source health checks...');
      const env = loadCrawlerEnv();
      const { createAlertSink } = await import('./observability/alerts.js');
      const { classifyError } = await import('./observability/failure-categories.js');
      const alertSink = createAlertSink({
        sink: env.ALERT_SINK,
        dedupWindowMinutes: env.ALERT_DEDUP_WINDOW_MINUTES,
      });
      const supabase = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rawSources } = await (supabase as any)
        .from('sources')
        .select('*')
        .eq('enabled', true);
      if (!rawSources) {
        console.log('No enabled sources');
        break;
      }
      const sources = rawSources as Source[];

      const { getAdapter } = await import('./adapters/registry.js');
      const { DatabaseWriter } = await import('./pipeline/db-writer.js');
      const healthResults: Array<{
        sourceId: string;
        ok: boolean;
        latencyMs: number;
        category?: string;
      }> = [];
      let failures = 0;
      let writer: InstanceType<typeof DatabaseWriter> | null = null;
      try {
        writer = new DatabaseWriter();
      } catch {
        writer = null; // no credentials in this environment — events not persisted
      }

      for (const source of sources) {
        try {
          const feedUrl =
            typeof source.metadata?.['feedUrl'] === 'string'
              ? source.metadata['feedUrl']
              : undefined;
          const adapter = getAdapter({
            id: source.id,
            name: source.name,
            domain: source.domain,
            sourceType: source.source_type as SourceDefinition['sourceType'],
            adapterType: source.adapter_name,
            baseUrl: source.base_url ?? '',
            trustLevel: source.trust_level,
            rateLimit: { requestsPerMinute: source.rate_limit_per_minute },
            ...(feedUrl !== undefined ? { feedUrl } : {}),
          });
          const context = {
            runId: crypto.randomUUID(),
            dryRun: true,
            userAgent: env.CRAWLER_USER_AGENT,
            timeoutMs: env.CRAWLER_REQUEST_TIMEOUT_MS,
          };
          const health = await adapter.healthCheck(context);
          const category = health.ok
            ? undefined
            : classifyError(health.error ?? null, health.statusCode);
          console.log(
            `${source.name}: ${health.ok ? 'OK' : 'FAIL'} (${health.latencyMs}ms)` +
              `${health.ok ? '' : ` [${category ?? 'UNKNOWN'}]`}` +
              `${health.error ? ' - ' + health.error : ''}`,
          );
          healthResults.push({
            sourceId: source.id,
            ok: health.ok,
            latencyMs: health.latencyMs,
            ...(category !== undefined ? { category } : {}),
          });
          if (!health.ok) {
            failures++;
            alertSink.emit({
              alertType: 'source-health-failure',
              severity: 'warning',
              message: `Source health check failed for ${source.name}`,
              ...(category !== undefined ? { category } : {}),
              sourceId: source.id,
              context: { latencyMs: health.latencyMs },
            });
          }
          if (writer) {
            try {
              await writer.insertSourceHealthEvent({
                source_id: source.id,
                check_type: 'workflow-health',
                status: health.ok ? 'ok' : 'failed',
                details: {
                  latencyMs: health.latencyMs,
                  ...(category !== undefined ? { category } : {}),
                  ...(health.error !== undefined ? { error: health.error } : {}),
                },
              });
            } catch (persistError) {
              console.error(
                `Warning: could not persist source_health_event for ${source.name}: ` +
                  (persistError instanceof Error ? persistError.message : 'unknown'),
              );
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown';
          const category = classifyError(message);
          console.log(`${source.name}: ERROR [${category}] - ${message}`);
          failures++;
          healthResults.push({ sourceId: source.id, ok: false, latencyMs: 0, category });
          alertSink.emit({
            alertType: 'source-health-failure',
            severity: 'warning',
            message: `Source health check errored for ${source.name}`,
            category,
            sourceId: source.id,
          });
        }
      }

      const byCategory: Record<string, number> = {};
      for (const r of healthResults) {
        if (!r.ok && r.category) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      }
      // Sanitized machine-readable summary: counts and categories only, no URLs.
      console.log(
        JSON.stringify({
          type: 'source-health-summary',
          checkedAt: new Date().toISOString(),
          sourcesChecked: healthResults.length,
          ok: healthResults.length - failures,
          failed: failures,
          byCategory,
          suppressedDuplicateAlerts: alertSink.suppressedCount,
        }),
      );
      process.exit(failures > 0 ? 1 : 0);
      break;
    }
    case 'reprocess': {
      // Reprocess a specific document
      const docIdx = args.indexOf('--document');
      const documentId = docIdx >= 0 ? args[docIdx + 1] : undefined;
      if (!documentId) {
        console.error('Usage: crawler reprocess --document=<id>');
        process.exit(1);
      }
      console.log(`Reprocessing document: ${documentId}`);

      const rpEnv = loadCrawlerEnv();
      const rpSupabase: AnyClient = createAdminClient();

      // Fetch the source document
      const { data: sourceDoc, error: docError } = await rpSupabase
        .from('source_documents')
        .select('*, sources(*)')
        .eq('id', documentId)
        .single();

      if (docError || !sourceDoc) {
        console.error(`Document not found: ${documentId}`);
        process.exit(1);
      }

      if (!sourceDoc.raw_text) {
        console.error('Document has no raw_text to reprocess');
        process.exit(1);
      }

      const { AIExtractor } = await import('./ai/extraction.js');
      const { createProviderRouter } = await import('./ai/router.js');
      const { AIBudgetManager } = await import('./ai/budget.js');
      const { CircuitBreaker } = await import('./ai/circuit-breaker.js');
      const { verifyEvidence } = await import('./validation/evidence.js');
      const { runAllValidators } = await import('./validation/runner.js');
      const { computeClaimabilityScore } = await import('./validation/scorer.js');
      const { decidePublication } = await import('./publication/policy.js');
      const { DatabaseWriter } = await import('./pipeline/db-writer.js');

      const rpProvider = createProviderRouter({
        AI_PROVIDER: rpEnv.AI_PROVIDER,
        OPENROUTER_MODEL: rpEnv.OPENROUTER_MODEL,
        NVIDIA_MODEL: rpEnv.NVIDIA_MODEL,
        ...(rpEnv.OPENROUTER_API_KEY !== undefined
          ? { OPENROUTER_API_KEY: rpEnv.OPENROUTER_API_KEY }
          : {}),
        ...(rpEnv.NVIDIA_API_KEY !== undefined ? { NVIDIA_API_KEY: rpEnv.NVIDIA_API_KEY } : {}),
        ...(rpEnv.NVIDIA_BASE_URL !== undefined ? { NVIDIA_BASE_URL: rpEnv.NVIDIA_BASE_URL } : {}),
      });
      const rpBudget = new AIBudgetManager(
        rpEnv.AI_DAILY_REQUEST_BUDGET,
        rpEnv.AI_SECOND_PASS_RESERVE,
        rpEnv.AI_MAX_ATTEMPTS_PER_DOCUMENT,
      );
      const rpCircuitBreaker = new CircuitBreaker();
      const rpExtractor = new AIExtractor(rpProvider, rpBudget, rpCircuitBreaker);
      const rpDbWriter = new DatabaseWriter();

      // Find existing candidate document
      const { data: existingCandidate } = await rpSupabase
        .from('candidate_documents')
        .select('*')
        .eq('source_document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingCandidate) {
        console.error(
          'No candidate document found for this source document. Run the pipeline first.',
        );
        process.exit(1);
      }

      const rpResult = await rpExtractor.extract(sourceDoc.raw_text as string, 1);
      if (rpResult.extraction && rpResult.error === null) {
        const rpEvidence = verifyEvidence(rpResult.extraction, sourceDoc.raw_text as string);
        const rpSource = (sourceDoc.sources ?? {}) as Record<string, unknown>;
        const rpValidation = runAllValidators({
          extraction: rpResult.extraction,
          sourceText: sourceDoc.raw_text as string,
          sourceDomain: (rpSource['domain'] as string) ?? 'unknown',
          trustLevel: (rpSource['trust_level'] as string) ?? 'unverified',
          documentDate: sourceDoc.published_at as string | null,
          evidenceVerification: rpEvidence,
        });
        const rpScore = computeClaimabilityScore({
          validationResults: rpValidation,
          aiConfidence: rpResult.extraction.confidence,
          sourceTrustLevel: (rpSource['trust_level'] as string) ?? 'unverified',
          evidenceCount: rpResult.extraction.evidence.length,
          evidenceVerified: rpEvidence.allVerified,
        });
        const rpDecision = decidePublication({
          extraction: rpResult.extraction,
          validationResults: rpValidation,
          claimabilityScore: rpScore,
          sourceDomain: (rpSource['domain'] as string) ?? 'unknown',
          trustLevel: (rpSource['trust_level'] as string) ?? 'unverified',
          featureFlags: { AUTO_VERIFY_CLAIMABLES: rpEnv.AUTO_VERIFY_CLAIMABLES },
        });

        await rpDbWriter.updateCandidateDocument(existingCandidate.id as string, {
          ai_extraction_status: 'completed',
          ai_provider: rpResult.provider,
          ai_model: rpResult.model,
          ai_extracted_data: rpResult.extraction as unknown as Record<string, unknown>,
          ai_confidence: Math.round(rpResult.extraction.confidence * 100),
          validation_status: rpValidation.overallDecision === 'pass' ? 'passed' : 'failed',
          publication_decision: rpDecision.action,
        });
        await rpDbWriter.insertAiRun({
          candidate_document_id: existingCandidate.id as string,
          pass_number: 1,
          provider: rpResult.provider,
          model: rpResult.model,
          prompt_version: null,
          schema_version: null,
          input_tokens: rpResult.inputTokens,
          output_tokens: rpResult.outputTokens,
          duration_ms: rpResult.durationMs,
          result_status: 'success',
          error_category: null,
          raw_output: rpResult.rawOutput ? { raw: rpResult.rawOutput } : null,
          structured_output: rpResult.extraction as unknown as Record<string, unknown>,
        });
        console.log(`Reprocessed successfully. Decision: ${rpDecision.action}, Score: ${rpScore}`);
      } else {
        console.log(`AI extraction failed: ${rpResult.error ?? 'unknown error'}`);
        await rpDbWriter.updateCandidateDocument(existingCandidate.id as string, {
          ai_extraction_status: 'failed',
          ai_error_category: rpResult.errorCategory,
        });
      }
      break;
    }
    case 'retry-queued': {
      // Retry deferred candidates
      console.log('Retrying deferred candidates...');

      const rqEnv = loadCrawlerEnv();
      const rqSupabase: AnyClient = createAdminClient();

      const { data: deferred, error: defError } = await rqSupabase
        .from('candidate_documents')
        .select('*, source_documents(*)')
        .in('ai_extraction_status', ['deferred', 'failed'])
        .order('created_at', { ascending: true });

      if (defError || !deferred || deferred.length === 0) {
        console.log('No deferred candidates found.');
        break;
      }

      console.log(`Found ${deferred.length} deferred candidates`);

      const { AIExtractor: RqAIExtractor } = await import('./ai/extraction.js');
      const { createProviderRouter: rqCreateRouter } = await import('./ai/router.js');
      const { AIBudgetManager: RqBudget } = await import('./ai/budget.js');
      const { CircuitBreaker: RqCB } = await import('./ai/circuit-breaker.js');
      const { DatabaseWriter: RqDBWriter } = await import('./pipeline/db-writer.js');
      const { verifyEvidence: rqVerifyEvidence } = await import('./validation/evidence.js');
      const { runAllValidators: rqRunValidators } = await import('./validation/runner.js');
      const { computeClaimabilityScore: rqComputeScore } = await import('./validation/scorer.js');
      const { decidePublication: rqDecidePub } = await import('./publication/policy.js');

      const rqProvider = rqCreateRouter({
        AI_PROVIDER: rqEnv.AI_PROVIDER,
        OPENROUTER_MODEL: rqEnv.OPENROUTER_MODEL,
        NVIDIA_MODEL: rqEnv.NVIDIA_MODEL,
        ...(rqEnv.OPENROUTER_API_KEY !== undefined
          ? { OPENROUTER_API_KEY: rqEnv.OPENROUTER_API_KEY }
          : {}),
        ...(rqEnv.NVIDIA_API_KEY !== undefined ? { NVIDIA_API_KEY: rqEnv.NVIDIA_API_KEY } : {}),
        ...(rqEnv.NVIDIA_BASE_URL !== undefined ? { NVIDIA_BASE_URL: rqEnv.NVIDIA_BASE_URL } : {}),
      });
      const rqBudget = new RqBudget(
        rqEnv.AI_DAILY_REQUEST_BUDGET,
        rqEnv.AI_SECOND_PASS_RESERVE,
        rqEnv.AI_MAX_ATTEMPTS_PER_DOCUMENT,
      );
      const rqCircuitBreaker = new RqCB();
      const rqExtractor = new RqAIExtractor(rqProvider, rqBudget, rqCircuitBreaker);
      const rqDbWriter = new RqDBWriter();

      let processed = 0;
      let succeeded = 0;
      let rqFailed = 0;

      for (const candidate of deferred) {
        if (!rqBudget.canProcess()) {
          console.log(
            `Budget exhausted after processing ${processed} candidates. ${deferred.length - processed} remaining for next run.`,
          );
          break;
        }

        const rqSourceDoc = (candidate.source_documents ?? {}) as Record<string, unknown>;
        const rqRawText = rqSourceDoc['raw_text'] as string | undefined;
        if (!rqRawText) {
          rqFailed++;
          continue;
        }

        try {
          const rqResult = await rqExtractor.extract(rqRawText, 1);
          processed++;

          if (rqResult.extraction && rqResult.error === null) {
            const rqEvidenceResult = rqVerifyEvidence(rqResult.extraction, rqRawText);
            const rqSource = (rqSourceDoc['sources'] ?? {}) as Record<string, unknown>;
            const rqValidation = rqRunValidators({
              extraction: rqResult.extraction,
              sourceText: rqRawText,
              sourceDomain: (rqSource['domain'] as string) ?? 'unknown',
              trustLevel: (rqSource['trust_level'] as string) ?? 'unverified',
              documentDate: (rqSourceDoc['published_at'] as string) ?? null,
              evidenceVerification: rqEvidenceResult,
            });
            const rqScore = rqComputeScore({
              validationResults: rqValidation,
              aiConfidence: rqResult.extraction.confidence,
              sourceTrustLevel: (rqSource['trust_level'] as string) ?? 'unverified',
              evidenceCount: rqResult.extraction.evidence.length,
              evidenceVerified: rqEvidenceResult.allVerified,
            });
            const rqDecision = rqDecidePub({
              extraction: rqResult.extraction,
              validationResults: rqValidation,
              claimabilityScore: rqScore,
              sourceDomain: (rqSource['domain'] as string) ?? 'unknown',
              trustLevel: (rqSource['trust_level'] as string) ?? 'unverified',
              featureFlags: { AUTO_VERIFY_CLAIMABLES: rqEnv.AUTO_VERIFY_CLAIMABLES },
            });

            await rqDbWriter.updateCandidateDocument(candidate.id as string, {
              ai_extraction_status: 'completed',
              ai_provider: rqResult.provider,
              ai_model: rqResult.model,
              ai_extracted_data: rqResult.extraction as unknown as Record<string, unknown>,
              ai_confidence: Math.round(rqResult.extraction.confidence * 100),
              validation_status: rqValidation.overallDecision === 'pass' ? 'passed' : 'failed',
              publication_decision: rqDecision.action,
            });
            succeeded++;
          } else {
            await rqDbWriter.updateCandidateDocument(candidate.id as string, {
              ai_extraction_status: 'failed',
              ai_error_category: rqResult.errorCategory,
              ai_retry_count: ((candidate.ai_retry_count as number) ?? 0) + 1,
            });
            rqFailed++;
          }
        } catch (err) {
          console.error(
            `Error processing candidate ${candidate.id as string}:`,
            err instanceof Error ? err.message : 'unknown',
          );
          rqFailed++;
        }
      }

      console.log(
        `Retry complete: ${succeeded} succeeded, ${rqFailed} failed, ${deferred.length - processed} deferred (budget exhausted)`,
      );
      break;
    }
    case 'crawl-status': {
      // Missed-run detection: verifies a successful crawl run exists within the
      // expected window. Exits 1 when the last success is stale or missing.
      const { evaluateMissedRun } = await import('./observability/missed-run.js');
      const { createAlertSink } = await import('./observability/alerts.js');
      const csEnv = loadCrawlerEnv();
      const maxIdx = args.indexOf('--max-age-hours');
      const maxArg = args.find((a) => a.startsWith('--max-age-hours='));
      const maxAgeHours = maxArg
        ? Number(maxArg.split('=')[1])
        : maxIdx >= 0
          ? Number(args[maxIdx + 1])
          : 26;
      if (!Number.isFinite(maxAgeHours) || maxAgeHours <= 0) {
        console.error('Usage: crawler crawl-status [--max-age-hours <number>]');
        process.exit(1);
      }

      const csSupabase: AnyClient = createAdminClient();
      const { data: lastRun, error: lastRunError } = await csSupabase
        .from('crawl_runs')
        .select('started_at, status')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastRunError) {
        console.error(`Failed to query crawl_runs: ${lastRunError.message as string}`);
        process.exit(1);
      }
      const { data: lastSuccessRow } = await csSupabase
        .from('crawl_runs')
        .select('started_at')
        .in('status', ['completed', 'completed_with_errors'])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let environmentCreatedAt: string | null = null;
      let totalCrawlRuns: number | null = null;
      if (!lastSuccessRow) {
        const { count } = await csSupabase
          .from('crawl_runs')
          .select('*', { count: 'exact', head: true });
        totalCrawlRuns = count;

        const { data: earliestSource } = await csSupabase
          .from('sources')
          .select('created_at')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        environmentCreatedAt = (earliestSource?.created_at as string | undefined) ?? null;
      }

      const evaluation = evaluateMissedRun({
        lastRunAt: (lastRun?.started_at as string | undefined) ?? null,
        lastRunStatus: (lastRun?.status as string | undefined) ?? null,
        lastSuccessAt: (lastSuccessRow?.started_at as string | undefined) ?? null,
        totalCrawlRuns,
        maxAgeHours,
        environmentCreatedAt,
      });
      console.log(
        JSON.stringify(
          {
            type: 'crawl-status',
            verdict: evaluation.verdict,
            alert: evaluation.alert,
            lastRunAt: (lastRun?.started_at as string | undefined) ?? null,
            lastRunStatus: (lastRun?.status as string | undefined) ?? null,
            lastSuccessAt: (lastSuccessRow?.started_at as string | undefined) ?? null,
            ageHours: Number.isFinite(evaluation.ageHours) ? evaluation.ageHours : null,
            maxAgeHours,
            reason: evaluation.reason,
          },
          null,
          2,
        ),
      );
      if (evaluation.alert) {
        const alertSink = createAlertSink({
          sink: csEnv.ALERT_SINK,
          dedupWindowMinutes: csEnv.ALERT_DEDUP_WINDOW_MINUTES,
        });
        alertSink.emit({
          alertType: 'missed-crawl-run',
          severity: 'critical',
          message: evaluation.reason,
        });
        process.exit(1);
      }
      break;
    }
    case 'inventory-report': {
      const { generateInventoryReport, formatInventoryReport } =
        await import('./observability/inventory-report.js');
      const { DatabaseWriter } = await import('./pipeline/db-writer.js');
      const daysArg = args.find((a) => a.startsWith('--days='));
      const fromArg = args.find((a) => a.startsWith('--from='));
      const toArg = args.find((a) => a.startsWith('--to='));

      const daysIdx = args.indexOf('--days');
      const fromIdx = args.indexOf('--from');
      const toIdx = args.indexOf('--to');

      const days = daysArg
        ? parseInt(daysArg.split('=')[1]!, 10)
        : daysIdx >= 0
          ? parseInt(args[daysIdx + 1]!, 10)
          : undefined;
      const from = fromArg ? fromArg.split('=')[1] : fromIdx >= 0 ? args[fromIdx + 1] : undefined;
      const to = toArg ? toArg.split('=')[1] : toIdx >= 0 ? args[toIdx + 1] : undefined;

      let storage: IDatabaseWriter | undefined;
      try {
        storage = new DatabaseWriter();
      } catch {
        // Missing credentials, storage will be undefined and generateInventoryReport will report status cleanly
      }

      const report = await generateInventoryReport({
        days,
        from,
        to,
        storage,
      });
      console.log(formatInventoryReport(report));
      break;
    }
    case 'preflight': {
      console.log('=============================================================================');
      console.log('  CLAIMRADAR INDIA — CRAWLER INGESTION PREFLIGHT AUDIT');
      console.log('=============================================================================');

      const envArg = args.find((a) => a.startsWith('--environment='));
      const envIdx = args.indexOf('--environment');
      const environment = envArg
        ? envArg.split('=')[1]
        : envIdx >= 0
          ? args[envIdx + 1]
          : 'staging';

      console.log(`Target Environment:     ${environment}`);

      let env;
      try {
        env = loadCrawlerEnv({ allowMissingCredentials: true });
      } catch (err) {
        console.error('\n❌ PREFLIGHT FAILED: Environment validation error', err);
        process.exit(1);
      }

      // Policy Rule 1: AUTO_VERIFY_CLAIMABLES must be false
      console.log(
        `AUTO_VERIFY_CLAIMABLES:   ${env.AUTO_VERIFY_CLAIMABLES ? '❌ FAIL (Must be false)' : '✅ PASS (false)'}`,
      );

      // Policy Rule 2: ENABLE_BILLING must be false
      console.log(
        `ENABLE_BILLING:           ${env.ENABLE_BILLING ? '❌ FAIL (Must be false)' : '✅ PASS (false)'}`,
      );

      // Policy Rule 3: NOTIFY_CUSTOMERS_ENABLED must be false
      console.log(
        `NOTIFY_CUSTOMERS_ENABLED: ${env.NOTIFY_CUSTOMERS_ENABLED ? '❌ FAIL (Must be false)' : '✅ PASS (false)'}`,
      );

      // Environment & Credential Check
      const hasUrl = Boolean(env.SUPABASE_URL && !env.SUPABASE_URL.includes('dryrun.local'));
      const hasKey = Boolean(
        env.SUPABASE_SECRET_KEY && env.SUPABASE_SECRET_KEY !== 'dummy-dryrun-secret-key',
      );
      console.log(
        `SUPABASE_URL Declared:    ${hasUrl ? '✅ PASS' : '⚠️ SKIP_CREDENTIALS (Not set)'}`,
      );
      console.log(
        `SUPABASE_SECRET_KEY Set:  ${hasKey ? '✅ PASS' : '⚠️ SKIP_CREDENTIALS (Not set)'}`,
      );

      const expectedProjectRef = process.env.EXPECTED_STAGING_SUPABASE_PROJECT_REF?.trim();
      if (environment === 'staging' && expectedProjectRef) {
        const expectedUrl = `https://${expectedProjectRef}.supabase.co`;
        if (env.SUPABASE_URL !== expectedUrl) {
          console.error(
            `\nPREFLIGHT REFUSED: Supabase URL does not match expected staging project ${expectedProjectRef}.`,
          );
          process.exit(1);
        }
        console.log(`Staging Project Target:   PASS (${expectedProjectRef})`);
      }

      // Compliance Identity
      console.log(`Crawler Identity (UA):    ${env.CRAWLER_USER_AGENT}`);

      if (env.AUTO_VERIFY_CLAIMABLES || env.ENABLE_BILLING || env.NOTIFY_CUSTOMERS_ENABLED) {
        console.error(
          '\n❌ PREFLIGHT REFUSED: Policy violations detected (AUTO_VERIFY, BILLING, or NOTIFY_CUSTOMERS enabled).',
        );
        process.exit(1);
      }

      if (!hasUrl || !hasKey) {
        console.log('\n⚠️ PREFLIGHT NOTICE: Staging credentials not present in environment.');
        console.log('                    Live database ingestion is SKIPPED.');
        process.exit(0);
      }

      console.log('\n✅ PREFLIGHT PASSED: Ready for staging ingestion.');
      break;
    }
    default:
      console.log('ClaimRadar Crawler');
      console.log('');
      console.log('Usage: crawler <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  daily              Run full crawl pipeline');
      console.log('  source --source=X  Run crawl for specific source');
      console.log('  health             Run source health checks');
      console.log('  crawl-status       Missed-run detection (last successful crawl age)');
      console.log('  reprocess --document=X  Reprocess a specific document');
      console.log('  retry-queued       Retry deferred AI extraction candidates');
      console.log('  inventory-report   Print 30-day inventory validation metrics report');
      console.log('  preflight          Run ingestion preflight safety checks');
      console.log('');
      console.log('Options:');
      console.log('  --dry-run          Fetch and process without publishing');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Crawler failed:', error);
  process.exit(1);
});
