import type { DiscoveredDocument } from '../adapters/types.js';
import type { SourceDocumentDedupItem } from './db-writer.js';

/**
 * Only the official IBBI PDF adapter supports persisted conditional requests.
 * The listing title must match the retained record; changed deadlines/titles
 * trigger an unconditional fetch even if a server reuses an old validator.
 * Other sources continue their existing full-body verification behavior.
 */
export function withIbbiConditionalHeaders(
  document: DiscoveredDocument,
  adapterType: string,
  sourceId: string,
  existing: SourceDocumentDedupItem[],
): DiscoveredDocument {
  if (
    adapterType !== 'ibbi-public-announcement' ||
    !/\.pdf(?:\?.*)?$/i.test(document.url) ||
    !document.title
  ) {
    return document;
  }

  const previous = existing.find(
    (row) =>
      row.source_id === sourceId &&
      row.canonical_url === document.url &&
      row.title === document.title,
  );
  if (!previous) return document;

  // Reject header injection / invalid metadata rather than propagating
  // arbitrary persisted strings into an outbound HTTP request.
  const safe = (value: string | null | undefined): string | undefined =>
    value && value.length <= 512 && !/[\r\n]/.test(value) ? value : undefined;
  const etag = safe(previous.etag);
  const lastModified = safe(previous.last_modified);
  if (!etag && !lastModified) return document;

  return {
    ...document,
    conditionalHeaders: {
      ...(etag ? { etag } : {}),
      ...(lastModified ? { lastModified } : {}),
    },
  };
}
