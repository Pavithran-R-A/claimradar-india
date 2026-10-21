import type { AIExtractionResult } from './types.js';

type AIError = AIExtractionResult['errorCategory'];

/**
 * Never bypass the free account's authentication, allowance or local budget.
 * A transient timeout/provider failure should not starve other documents:
 * the caller already caps each invocation at two candidates and uses
 * OpenRouter's free router exclusively.
 */
export function shouldHaltFreeBacklog(error: AIError): boolean {
  return (
    error === 'rate_limit' ||
    error === 'auth' ||
    error === 'budget_exceeded' ||
    error === 'no_provider'
  );
}

/**
 * Every actual free-router request must advance the retry count, including
 * timeouts and temporary provider failures. Otherwise the highest-ranked
 * failed candidate can consume every future cron batch, starving newer work.
 *
 * Local budget exhaustion/no provider did NOT send a remote request. Keep those
 * deferred without spending the retry allowance. At two real failed attempts
 * human/CLI reprocessing is required; nothing is approved or published.
 */
export function freeBacklogFailureState(
  error: AIError,
  previousRetryCount: number,
): { ai_extraction_status: 'deferred' | 'failed'; ai_retry_count: number } {
  const prior =
    Number.isSafeInteger(previousRetryCount) && previousRetryCount >= 0 ? previousRetryCount : 0;
  const sentRequest = error !== 'budget_exceeded' && error !== 'no_provider';
  const ai_retry_count = sentRequest ? Math.min(2, prior + 1) : prior;
  const transient = [
    'timeout',
    'rate_limit',
    'provider_error',
    'auth',
    'budget_exceeded',
    'no_provider',
  ].includes(error);
  return {
    ai_extraction_status: transient && ai_retry_count < 2 ? 'deferred' : 'failed',
    ai_retry_count,
  };
}

/**
 * Give scarce free-router extraction slots to non-IBBI notices first.
 * This is a scheduling preference ONLY. Corporate-creditor notices remain
 * available after other classes are exhausted; nothing is rejected, verified,
 * published, or excluded from mandatory editorial review here.
 *
 * Preserve the database order (score then freshness) within each group.
 */
export function prioritizeConsumerBacklog<
  T extends { source: { adapter_name: string } | null },
>(contexts: T[]): T[] {
  const consumer: T[] = [];
  const creditor: T[] = [];
  for (const context of contexts) {
    if (context.source?.adapter_name === 'ibbi-public-announcement') {
      creditor.push(context);
    } else {
      consumer.push(context);
    }
  }
  return [...consumer, ...creditor];
}
