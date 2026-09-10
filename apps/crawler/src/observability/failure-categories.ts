/**
 * Failure category classification for source-health and crawl errors.
 *
 * Maps free-form error messages / HTTP status codes to a stable, finite set of
 * categories so alerts, `source_health_events`, and `crawl_errors` can be
 * aggregated and deduplicated without string-matching at query time.
 *
 * Categories are deterministic and credential-free: classification never
 * inspects URLs with query strings, headers, or any secret material.
 */

export type FailureCategory =
  | 'DNS_ERROR'
  | 'TLS_ERROR'
  | 'TIMEOUT'
  | 'CONNECTION_ERROR'
  | 'HTTP_4XX'
  | 'HTTP_5XX'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'UNKNOWN';

interface PatternRule {
  category: FailureCategory;
  pattern: RegExp;
}

/** Ordered rules — first match wins. Patterns match lower-cased messages. */
const RULES: PatternRule[] = [
  {
    category: 'DNS_ERROR',
    pattern: /enotfound|eai_again|dns|getaddrinfo|name.?resolution|no such host|domain.?not.?found/,
  },
  {
    category: 'TLS_ERROR',
    pattern: /tls|ssl|certificate|unable_to_verify_leaf|self.?signed|err_tls|handshake|depth_zero/,
  },
  {
    category: 'TIMEOUT',
    pattern: /timeout|timed out|etimedout|deadline|headers_timeout|body_timeout|und_err_timeout/,
  },
  {
    category: 'RATE_LIMITED',
    pattern: /rate.?limit|too many requests|\b429\b|retry[- ]after|throttl/,
  },
  {
    category: 'CONNECTION_ERROR',
    pattern:
      /econnreset|econnrefused|econnaborted|socket hang up|network|und_err_connect|fetch failed/,
  },
  {
    category: 'PARSE_ERROR',
    pattern:
      /parse|invalid (xml|rss|json|feed)|malformed|unexpected token|not valid (xml|rss|json)/,
  },
  {
    category: 'DATABASE_ERROR',
    pattern:
      /database|postgres|relation .* does not exist|deadlock|serialization|supabase|23505|42p01/,
  },
  {
    category: 'AI_PROVIDER_ERROR',
    pattern: /ai provider|openrouter|nvidia|llm|completion|model.*(unavailable|overloaded)/,
  },
  {
    category: 'CONFIGURATION_ERROR',
    pattern: /no feed url|not configured|missing (env|config)|invalid env|unsupported adapter/,
  },
];

/**
 * Classify an error message (and optional HTTP status code) into a category.
 */
export function classifyError(message?: string | null, statusCode?: number): FailureCategory {
  if (statusCode !== undefined && statusCode === 429) return 'RATE_LIMITED';
  if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) return 'HTTP_4XX';
  if (statusCode !== undefined && statusCode >= 500 && statusCode < 600) return 'HTTP_5XX';

  if (!message) return 'UNKNOWN';
  const lower = message.toLowerCase();

  // Explicit HTTP status embedded in a message. Do not treat arbitrary
  // three-digit values such as the HTTPS port (":443") as a status code.
  const statusMatch =
    /\b(?:http\s*|status(?:\s*code)?\s*[:=]?\s*|response(?:\s+status(?:\s*code)?)?\s*[:=]?\s*|(?:returned|received|got)\s+)([45]\d{2})\b/.exec(
      lower,
    );
  if (statusMatch) {
    const code = Number(statusMatch[1]);
    if (code === 429) return 'RATE_LIMITED';
    if (code >= 400 && code < 500) return 'HTTP_4XX';
    if (code >= 500) return 'HTTP_5XX';
  }

  for (const rule of RULES) {
    if (rule.pattern.test(lower)) return rule.category;
  }
  return 'UNKNOWN';
}

/** All categories, for dashboards and exhaustive switches. */
export const FAILURE_CATEGORIES: readonly FailureCategory[] = [
  'DNS_ERROR',
  'TLS_ERROR',
  'TIMEOUT',
  'CONNECTION_ERROR',
  'HTTP_4XX',
  'HTTP_5XX',
  'PARSE_ERROR',
  'RATE_LIMITED',
  'DATABASE_ERROR',
  'AI_PROVIDER_ERROR',
  'CONFIGURATION_ERROR',
  'UNKNOWN',
];
