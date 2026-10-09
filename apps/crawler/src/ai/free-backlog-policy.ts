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
