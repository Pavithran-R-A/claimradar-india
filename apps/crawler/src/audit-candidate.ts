/**
 * Read-only staging audit. No AI calls and no INSERT/UPDATE/DELETE/RPC calls.
 *
 * pnpm --filter @claimradar/crawler audit:candidate --candidate=<uuid>
 */
import { createAdminClient } from '@claimradar/database';
import { auditStoredCandidate } from './validation/read-only-candidate-audit.js';

// Generated DB select projections are incomplete for these source tables.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function main() {
  if (process.env.APP_ENV !== 'staging') {
    throw new Error('Read-only candidate audit requires APP_ENV=staging');
  }

  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const valueArg = args.find((arg) => arg.startsWith('--candidate='));
  const index = args.indexOf('--candidate');
  const candidateId = valueArg
    ? valueArg.slice('--candidate='.length)
    : index >= 0
      ? args[index + 1]
      : undefined;
  if (
    !candidateId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId)
  ) {
    throw new Error('Usage: audit:candidate --candidate=<uuid>');
  }

  const db: AnyClient = createAdminClient();
  const { data: candidate, error: candidateError } = await db
    .from('candidate_documents')
    .select('id, source_document_id, ai_extracted_data, validation_status, publication_decision')
    .eq('id', candidateId)
    .single();
  if (candidateError || !candidate) throw new Error('Candidate not found or unreadable');

  const { data: document, error: documentError } = await db
    .from('source_documents')
    .select('id, source_id, raw_text, published_at')
    .eq('id', candidate.source_document_id)
    .single();
  if (documentError || !document) throw new Error('Preserved source document unavailable');

  const { data: source, error: sourceError } = await db
    .from('sources')
    .select('domain, trust_level')
    .eq('id', document.source_id)
    .single();
  if (sourceError || !source) throw new Error('Source trust metadata unavailable');

  const report = auditStoredCandidate({
    candidateId: candidate.id,
    historicalValidation: candidate.validation_status,
    historicalPublication: candidate.publication_decision,
    extraction: candidate.ai_extracted_data,
    sourceText: document.raw_text ?? '',
    sourceDomain: source.domain,
    sourceTrustLevel: source.trust_level,
    documentDate: document.published_at,
  });
  // The report deliberately excludes raw source, quotations, secrets and PII.
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Read-only candidate audit failed');
  process.exitCode = 1;
});
