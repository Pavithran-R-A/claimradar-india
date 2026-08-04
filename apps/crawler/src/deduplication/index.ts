/**
 * Deduplication orchestrator.
 *
 * Runs the four deduplication strategies in order (fastest to slowest)
 * and returns a unified result.
 *
 * Design note from spec:
 * "A regulator publishes an order, PIB publishes a press release about the
 * same order, the company publishes its own notice — these should be
 * connectable to one claimable with multiple sources, not automatically
 * become three public claims."
 *
 * To support this, `crossSourceMatch` is set to `true` when the content hash
 * matches an existing document from a *different* source. The pipeline can
 * then link the new document to the same claimable rather than creating a
 * duplicate public claim.
 */

import {
  matchByContentHash,
  matchByUrl,
  matchBySourceIdentifier,
  matchByTitleDate,
  type DeduplicationMatch,
} from './strategies.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DeduplicationInput {
  url: string;
  contentHash: string;
  sourceId: string;
  sourceIdentifier?: string;
  title?: string;
  publishedAt?: string;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matchedStrategy: string | null;
  existingDocumentId: string | null;
  /** True when content hash matches an existing document from a different source. */
  crossSourceMatch: boolean;
}

/**
 * The shape of documents the orchestrator needs to compare against.
 * Typically fetched from the database before a crawl run.
 */
export interface ExistingDocument {
  id: string;
  source_id: string | null;
  canonical_url: string;
  content_hash: string;
  source_identifier: string | null;
  title: string | null;
  published_at: string | null;
}

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export {
  matchByContentHash,
  matchByUrl,
  matchBySourceIdentifier,
  matchByTitleDate,
  type DeduplicationMatch,
} from './strategies.js';

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Check an incoming document against existing documents for duplicates.
 *
 * Strategies are run in this order:
 *  1. Content hash (O(1) lookup) — same content
 *  2. Canonical URL (O(1) lookup) — same URL
 *  3. Source + identifier (if identifier provided) — same document from same source
 *  4. Title + date fingerprint — near-duplicates
 *
 * The first strategy that produces a match wins; remaining strategies are skipped.
 */
export function checkDuplicate(
  input: DeduplicationInput,
  existingDocuments: ExistingDocument[],
): DeduplicationResult {
  // Pre-build the lightweight arrays each strategy needs.
  const hashRows = existingDocuments.map((d) => ({
    id: d.id,
    content_hash: d.content_hash,
  }));
  const urlRows = existingDocuments.map((d) => ({
    id: d.id,
    canonical_url: d.canonical_url,
  }));
  const sourceRows = existingDocuments.map((d) => ({
    id: d.id,
    source_id: d.source_id ?? '',
    source_identifier: d.source_identifier,
  }));
  const titleRows = existingDocuments.map((d) => ({
    id: d.id,
    title: d.title,
    published_at: d.published_at,
  }));

  // Build a quick lookup from id → source_id for cross-source detection.
  const sourceById = new Map<string, string | null>();
  for (const doc of existingDocuments) {
    sourceById.set(doc.id, doc.source_id);
  }

  // Helper: convert a match result into a DeduplicationResult.
  const toResult = (m: DeduplicationMatch, crossSource: boolean): DeduplicationResult => ({
    isDuplicate: m.isDuplicate,
    matchedStrategy: m.isDuplicate ? m.strategy : null,
    existingDocumentId: m.isDuplicate && m.existingId ? m.existingId : null,
    crossSourceMatch: crossSource,
  });

  // -----------------------------------------------------------------------
  // 1. Content hash
  // -----------------------------------------------------------------------
  const hashMatch = matchByContentHash(input.contentHash, hashRows);
  if (hashMatch.isDuplicate && hashMatch.existingId) {
    const existingSourceId = sourceById.get(hashMatch.existingId) ?? null;
    const crossSource = existingSourceId !== null && existingSourceId !== input.sourceId;
    return toResult(hashMatch, crossSource);
  }

  // -----------------------------------------------------------------------
  // 2. Canonical URL
  // -----------------------------------------------------------------------
  const urlMatch = matchByUrl(input.url, urlRows);
  if (urlMatch.isDuplicate) {
    return toResult(urlMatch, false);
  }

  // -----------------------------------------------------------------------
  // 3. Source + identifier (only when an identifier is available)
  // -----------------------------------------------------------------------
  if (input.sourceIdentifier) {
    const srcMatch = matchBySourceIdentifier(input.sourceId, input.sourceIdentifier, sourceRows);
    if (srcMatch.isDuplicate) {
      return toResult(srcMatch, false);
    }
  }

  // -----------------------------------------------------------------------
  // 4. Title + date fingerprint
  // -----------------------------------------------------------------------
  if (input.title) {
    const titleMatch = matchByTitleDate(input.title, input.publishedAt ?? null, titleRows);
    if (titleMatch.isDuplicate) {
      return toResult(titleMatch, false);
    }
  }

  // No match found.
  return {
    isDuplicate: false,
    matchedStrategy: null,
    existingDocumentId: null,
    crossSourceMatch: false,
  };
}
