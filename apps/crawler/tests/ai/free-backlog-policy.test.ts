import { describe, expect, it } from 'vitest';
import { shouldHaltFreeBacklog } from '../../src/ai/free-backlog-policy.js';

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
