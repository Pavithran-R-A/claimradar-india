import { describe, expect, it } from 'vitest';
import {
  freeBacklogFailureState,
  shouldHaltFreeBacklog,
} from '../../src/ai/free-backlog-policy.js';

describe('free OpenRouter backlog failure policy', () => {
  it.each(['rate_limit', 'auth', 'budget_exceeded', 'no_provider'] as const)(
    'halts immediately for %s to respect free account limits',
    (error) => expect(shouldHaltFreeBacklog(error)).toBe(true),
  );

  it.each(['timeout', 'provider_error', 'invalid_output'] as const)(
    'allows the next distinct candidate after %s',
    (error) => expect(shouldHaltFreeBacklog(error)).toBe(false),
  );
});

describe('free AI backlog fairness and retry accounting', () => {
  it.each(['timeout', 'rate_limit', 'provider_error', 'auth'] as const)(
    'counts a real failed request for %s and allows one deferred retry',
    (error) => {
      expect(freeBacklogFailureState(error, 0)).toEqual({
        ai_extraction_status: 'deferred',
        ai_retry_count: 1,
      });
    },
  );

  it('stops giving the same failing candidate unlimited future cron slots', () => {
    const afterFirst = freeBacklogFailureState('timeout', 0);
    const afterSecond = freeBacklogFailureState('timeout', afterFirst.ai_retry_count);
    expect(afterSecond).toEqual({
      ai_extraction_status: 'failed',
      ai_retry_count: 2,
    });
  });

  it.each(['budget_exceeded', 'no_provider'] as const)(
    'does not charge the candidate a retry when %s prevented any API request',
    (error) => {
      expect(freeBacklogFailureState(error, 0)).toEqual({
        ai_extraction_status: 'deferred',
        ai_retry_count: 0,
      });
    },
  );

  it('keeps invalid responses reviewable without calling them deferred', () => {
    expect(freeBacklogFailureState('invalid_output', 0)).toEqual({
      ai_extraction_status: 'failed',
      ai_retry_count: 1,
    });
  });

  it('handles legacy invalid retry counters without negative retries', () => {
    expect(freeBacklogFailureState('timeout', Number.NaN).ai_retry_count).toBe(1);
    expect(freeBacklogFailureState('timeout', -1).ai_retry_count).toBe(1);
  });
});
