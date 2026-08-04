/**
 * Deduplication strategies — each returns a DeduplicationMatch.
 *
 * Strategies are designed to be run by the orchestrator in order
 * from fastest (hash lookup) to slowest (title fingerprint).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeduplicationMatch {
  isDuplicate: boolean;
  strategy: string;
  matchedField?: string;
  existingId?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip common tracking query parameters from a URL and normalize.
 *
 * Normalization steps (in order):
 *  1. Lowercase
 *  2. Strip fragment (#…)
 *  3. Strip known tracking query params (utm_*, fbclid, gclid, mc_*, etc.)
 *  4. Normalize protocol: treat http and https as equivalent (store without protocol for comparison)
 *  5. Strip `www.` prefix
 *  6. Remove trailing slashes
 */
export function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim().toLowerCase();

  // Remove fragment
  const hashIdx = url.indexOf('#');
  if (hashIdx !== -1) {
    url = url.slice(0, hashIdx);
  }

  // Try to parse as URL; fall back to treating as path if it fails
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    // Not a valid absolute URL — just normalize the string directly
    url = url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');
    return url;
  }

  // Strip tracking query params
  const trackingPrefixes = [
    'utm_',
    'fbclid',
    'gclid',
    'mc_',
    '_ga',
    '_gl',
    'msclkid',
    'ref_',
    'icid',
  ];

  const cleanParams = new URLSearchParams();
  parsed.searchParams.sort();
  for (const [key, value] of parsed.searchParams) {
    const isTracking = trackingPrefixes.some((prefix) => key === prefix || key.startsWith(prefix));
    if (!isTracking) {
      cleanParams.append(key, value);
    }
  }

  // Rebuild host without www.
  const host = parsed.hostname.replace(/^www\./, '');
  const port = parsed.port ? `:${parsed.port}` : '';
  const path = parsed.pathname.replace(/\/+$/, '') || '/';
  const query = cleanParams.toString();

  return `${host}${port}${path}${query ? `?${query}` : ''}`;
}

/**
 * Normalize a title for fuzzy fingerprint comparison.
 *
 * Steps: lowercase, trim, collapse whitespace, strip punctuation.
 */
export function normalizeTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      // Strip punctuation (keep letters, digits, whitespace)
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      // Collapse multiple whitespace into a single space
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Build a "no-match" result for a given strategy.
 */
function noMatch(strategy: string): DeduplicationMatch {
  return { isDuplicate: false, strategy };
}

/**
 * Build a "match" result.
 */
function match(strategy: string, matchedField: string, existingId: string): DeduplicationMatch {
  return { isDuplicate: true, strategy, matchedField, existingId };
}

// ---------------------------------------------------------------------------
// Strategy 1 — Canonical URL match
// ---------------------------------------------------------------------------

/**
 * Exact URL comparison after normalization.
 */
export function matchByUrl(
  url: string,
  existingUrls: Array<{ id: string; canonical_url: string }>,
): DeduplicationMatch {
  const needle = normalizeUrl(url);
  if (!needle) return noMatch('canonical_url');

  for (const row of existingUrls) {
    if (normalizeUrl(row.canonical_url) === needle) {
      return match('canonical_url', 'canonical_url', row.id);
    }
  }

  return noMatch('canonical_url');
}

// ---------------------------------------------------------------------------
// Strategy 2 — Content hash match (SHA-256)
// ---------------------------------------------------------------------------

/**
 * SHA-256 hash comparison. The hash is expected to be pre-computed.
 */
export function matchByContentHash(
  hash: string,
  existingHashes: Array<{ id: string; content_hash: string }>,
): DeduplicationMatch {
  if (!hash) return noMatch('content_hash');

  const needle = hash.toLowerCase();
  for (const row of existingHashes) {
    if (row.content_hash.toLowerCase() === needle) {
      return match('content_hash', 'content_hash', row.id);
    }
  }

  return noMatch('content_hash');
}

// ---------------------------------------------------------------------------
// Strategy 3 — Source + identifier match
// ---------------------------------------------------------------------------

/**
 * Same source + same source_identifier means the same document from that source.
 */
export function matchBySourceIdentifier(
  sourceId: string,
  identifier: string,
  existing: Array<{
    id: string;
    source_id: string;
    source_identifier: string | null;
  }>,
): DeduplicationMatch {
  if (!sourceId || !identifier) return noMatch('source_identifier');

  for (const row of existing) {
    if (
      row.source_id === sourceId &&
      row.source_identifier !== null &&
      row.source_identifier === identifier
    ) {
      return match('source_identifier', 'source_identifier', row.id);
    }
  }

  return noMatch('source_identifier');
}

// ---------------------------------------------------------------------------
// Strategy 4 — Title + date fingerprint
// ---------------------------------------------------------------------------

/**
 * Normalized title + published date comparison.
 *
 * Both title and publishedAt must match for a duplicate to be declared.
 * Dates are compared at day granularity (YYYY-MM-DD prefix).
 */
export function matchByTitleDate(
  title: string,
  publishedAt: string | null,
  existing: Array<{
    id: string;
    title: string | null;
    published_at: string | null;
  }>,
): DeduplicationMatch {
  if (!title) return noMatch('title_date');

  const needleTitle = normalizeTitle(title);
  if (!needleTitle) return noMatch('title_date');

  // Normalize date to YYYY-MM-DD (first 10 chars of ISO string)
  const needleDate = publishedAt ? publishedAt.slice(0, 10) : null;

  for (const row of existing) {
    if (row.title === null) continue;

    const existingTitle = normalizeTitle(row.title);
    const existingDate = row.published_at ? row.published_at.slice(0, 10) : null;

    if (
      existingTitle === needleTitle &&
      needleDate !== null &&
      existingDate !== null &&
      existingDate === needleDate
    ) {
      return match('title_date', 'title+published_at', row.id);
    }
  }

  return noMatch('title_date');
}
