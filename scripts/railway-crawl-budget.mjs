/**
 * A few large official PDFs can make one of the seven source crawls exceed the
 * old 15-minute default. A 25-minute budget tolerates intermittent source
 * latency, while a hard ceiling prevents hung workers spanning cron ticks.
 *
 * Keep the 6-hour schedule and downstream acceptance gates unchanged.
 */
export const DEFAULT_CRAWL_TIMEOUT_MS = 25 * 60 * 1000;
export const MIN_CRAWL_TIMEOUT_MS = 15 * 60 * 1000;
export const MAX_CRAWL_TIMEOUT_MS = 30 * 60 * 1000;

export function resolveRailwayCrawlTimeoutMs(raw) {
  if (raw === undefined || raw === '') return DEFAULT_CRAWL_TIMEOUT_MS;
  const ms = Number(raw);
  if (
    !Number.isSafeInteger(ms) ||
    ms < MIN_CRAWL_TIMEOUT_MS ||
    ms > MAX_CRAWL_TIMEOUT_MS
  ) {
    throw new Error(
      'RAILWAY_SOAK_CRAWL_TIMEOUT_MS must be an integer between 900000 and 1800000',
    );
  }
  return ms;
}
