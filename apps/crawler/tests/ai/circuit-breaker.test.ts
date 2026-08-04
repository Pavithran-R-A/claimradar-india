import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker } from '../../src/ai/circuit-breaker.js';
import { AIBudgetManager } from '../../src/ai/budget.js';
import { AIExtractor } from '../../src/ai/extraction.js';
import type { AIProvider } from '../../src/ai/types.js';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start in closed state', () => {
    const cb = new CircuitBreaker(3, 60000);
    expect(cb.getState()).toBe('closed');
    expect(cb.canAttempt()).toBe(true);
  });

  it('should open after threshold failures', () => {
    const cb = new CircuitBreaker(3, 60000);

    cb.recordFailure();
    expect(cb.getState()).toBe('closed');

    cb.recordFailure();
    expect(cb.getState()).toBe('closed');

    cb.recordFailure();
    expect(cb.getState()).toBe('open');
  });

  it('should reject attempts when open (before cooldown)', () => {
    const cb = new CircuitBreaker(2, 60000);

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('open');
    expect(cb.canAttempt()).toBe(false);
  });

  it('should transition to half-open after cooldown', () => {
    const cb = new CircuitBreaker(2, 5000);

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('open');
    expect(cb.canAttempt()).toBe(false);

    // Advance past cooldown
    vi.advanceTimersByTime(6000);

    expect(cb.canAttempt()).toBe(true);
    expect(cb.getState()).toBe('half-open');
  });

  it('should close on successful attempt in half-open state', () => {
    const cb = new CircuitBreaker(2, 5000);

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('open');

    // Advance past cooldown
    vi.advanceTimersByTime(6000);
    expect(cb.canAttempt()).toBe(true);
    expect(cb.getState()).toBe('half-open');

    // Success in half-open closes the circuit
    cb.recordSuccess();
    expect(cb.getState()).toBe('closed');
  });

  it('should re-open on failure in half-open state', () => {
    const cb = new CircuitBreaker(2, 5000);

    cb.recordFailure();
    cb.recordFailure();

    // Advance past cooldown
    vi.advanceTimersByTime(6000);
    expect(cb.canAttempt()).toBe(true);
    expect(cb.getState()).toBe('half-open');

    // Failure in half-open - recordFailure sets state to open only if failureCount >= threshold
    // failureCount was 2, recordSuccess resets to 0, but recordFailure adds to existing
    cb.recordFailure();
    expect(cb.getState()).toBe('open');
  });

  it('should reset failure count on success', () => {
    const cb = new CircuitBreaker(3, 5000);

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('closed');

    cb.recordSuccess();

    // Now need 3 new failures to open
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('closed');

    cb.recordFailure();
    expect(cb.getState()).toBe('open');
  });
});

describe('AIExtractor — circuit breaker vs budget ordering', () => {
  function createMockProvider(): AIProvider {
    return {
      name: 'mock-provider',
      extract: vi.fn(),
      isAvailable: () => true,
    };
  }

  it('should return provider_error without consuming budget when circuit is open', async () => {
    const budget = new AIBudgetManager(40, 10, 2);
    const breaker = new CircuitBreaker(2, 60_000);
    const provider = createMockProvider();
    const extractor = new AIExtractor(provider, budget, breaker);

    // Open the circuit
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe('open');

    const remainingBefore = budget.remaining();
    const result = await extractor.extract('some document text', 1);

    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).toBe('Circuit breaker open — provider temporarily unavailable');
    expect(provider.extract).not.toHaveBeenCalled();

    // Budget must remain unconsumed
    expect(budget.remaining()).toBe(remainingBefore);
    expect(budget.getState().totalUsed).toBe(0);
    // A reservation must still succeed afterwards
    expect(budget.tryReserve(1)).toBe(true);
  });
});
