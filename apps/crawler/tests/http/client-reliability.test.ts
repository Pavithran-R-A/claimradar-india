import { describe, expect, it } from 'vitest';
import { classifyError } from '../../src/observability/failure-categories.js';
import { isRetryableFetchError } from '../../src/http/client.js';
import { retry } from '../../src/http/retry.js';
import { FetchError } from '../../src/http/types.js';

describe('HTTP client reliability policy', () => {
  it('recovers when a timeout is followed by a successful response', async () => {
    let attempts = 0;
    const result = await retry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw new FetchError('headers timed out', 'timeout', 'https://example.com');
        }
        return 'success';
      },
      { maxRetries: 3, baseDelay: 1, maxDelay: 5, shouldRetry: isRetryableFetchError },
    );

    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('preserves the timeout after the bounded retry budget is exhausted', async () => {
    let attempts = 0;
    const timeout = new FetchError('connection timed out', 'timeout', 'https://example.com');

    await expect(
      retry(
        async () => {
          attempts += 1;
          throw timeout;
        },
        { maxRetries: 2, baseDelay: 1, maxDelay: 5, shouldRetry: isRetryableFetchError },
      ),
    ).rejects.toBe(timeout);
    expect(attempts).toBe(3);
  });

  it('retries a timeout and network error, but not an HTTP response error', () => {
    expect(
      isRetryableFetchError(new FetchError('timed out', 'timeout', 'https://example.com')),
    ).toBe(true);
    expect(
      isRetryableFetchError(
        new FetchError('connection reset', 'network_error', 'https://example.com'),
      ),
    ).toBe(true);
    expect(
      isRetryableFetchError(new FetchError('HTTP 403', 'http_error', 'https://example.com', 403)),
    ).toBe(false);
  });

  it('does not retry DNS failures as HTTP response failures', () => {
    const error = new FetchError(
      'getaddrinfo ENOTFOUND source.example.gov.in',
      'network_error',
      'https://source.example.gov.in',
    );
    expect(isRetryableFetchError(error)).toBe(true);
  });

  it('keeps DNS, timeout, and network failures distinct from HTTP failures', () => {
    expect(classifyError('getaddrinfo ENOTFOUND source.example.gov.in')).toBe('DNS_ERROR');
    expect(classifyError('Connect Timeout Error at source.example.gov.in:443')).toBe('TIMEOUT');
    expect(classifyError('fetch failed: ECONNRESET')).toBe('CONNECTION_ERROR');
    expect(classifyError('HTTP 403 Forbidden')).toBe('HTTP_4XX');
    expect(classifyError('HTTP 404 Not Found')).toBe('HTTP_4XX');
    expect(classifyError('HTTP 500 Internal Server Error')).toBe('HTTP_5XX');
  });
});
