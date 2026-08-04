import { runPipeline } from './pipeline/index.js';
import { loadCrawlerEnv } from './env.js';
import { createAdminClient } from '@claimradar/database';
import type { Source } from '@claimradar/database';
import type { SourceDefinition } from '@claimradar/source-registry';

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
      const summary = await runPipeline({ dryRun, skipAI: false });
      console.log(
        summary.errorCount > 0
          ? `Completed with ${summary.errorCount} errors`
          : 'Crawl completed successfully',
      );
      process.exit(summary.errorCount > 0 ? 1 : 0);
      break;
    }
    case 'source': {
      // Run single source: crawler source --source=pib-rss
      const sourceIdx = args.indexOf('--source');
      const sourceFilter = sourceIdx >= 0 ? args[sourceIdx + 1] : undefined;
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
      // Source health checks
      console.log('Running source health checks...');
      const env = loadCrawlerEnv();
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
          console.log(
            `${source.name}: ${health.ok ? 'OK' : 'FAIL'} (${health.latencyMs}ms)${health.error ? ' - ' + health.error : ''}`,
          );
        } catch (error) {
          console.log(
            `${source.name}: ERROR - ${error instanceof Error ? error.message : 'unknown'}`,
          );
        }
      }
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
    default:
      console.log('ClaimRadar Crawler');
      console.log('');
      console.log('Usage: crawler <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  daily              Run full crawl pipeline');
      console.log('  source --source=X  Run crawl for specific source');
      console.log('  health             Run source health checks');
      console.log('  reprocess --document=X  Reprocess a specific document');
      console.log('  retry-queued       Retry deferred AI extraction candidates');
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
