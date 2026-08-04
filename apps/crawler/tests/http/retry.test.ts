import { describe, it, expect, vi, afterEach } from 'vitest';
import { retry } from '../../src/http/retry.js';

describe('Retry Logic', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retry(fn, { baseDelay: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('fail 1')).mockResolvedValue('success');

    const result = await retry(fn, { maxRetries: 3, baseDelay: 1, maxDelay: 5 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(retry(fn, { maxRetries: 2, baseDelay: 1, maxDelay: 5 })).rejects.toThrow(
      'always fails',
    );
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should respect Retry-After header', async () => {
    const errorWithRetryAfter = Object.assign(new Error('rate limited'), {
      headers: { 'retry-after': '0' }, // 0 seconds = no wait
    });

    const fn = vi.fn().mockRejectedValueOnce(errorWithRetryAfter).mockResolvedValue('success');

    const result = await retry(fn, { maxRetries: 3, baseDelay: 1, maxDelay: 5 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));

    await expect(
      retry(fn, {
        maxRetries: 3,
        baseDelay: 1,
        shouldRetry: () => false,
      }),
    ).rejects.toThrow('non-retryable');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should apply exponential backoff and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retry(fn, { maxRetries: 3, baseDelay: 1, maxDelay: 5 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
