import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterProvider } from '../../src/ai/providers/openrouter.js';

afterEach(() => vi.unstubAllGlobals());

function mockResponse(body: unknown, status: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

describe('OpenRouter free-only failure classification', () => {
  const run = () => new OpenRouterProvider('test-key', 'openrouter/free').extract('source', 'prompt');

  it('preserves invalid-request diagnostics without exposing upstream text', async () => {
    mockResponse(
      {
        error: {
          code: 400,
          message: 'Source/private data must not appear in telemetry',
          metadata: { error_type: 'invalid_request' },
        },
      },
      400,
    );
    const result = await run();
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).toBe('OpenRouter HTTP 400 (invalid_request)');
    expect(result.error).not.toContain('Source/private');
    expect(result.extraction).toBeNull();
  });

  it('handles provider failures inside an HTTP 200 response', async () => {
    mockResponse(
      { error: { code: 429, metadata: { error_type: 'rate_limit_exceeded' } } },
      200,
    );
    const result = await run();
    expect(result.errorCategory).toBe('rate_limit');
    expect(result.error).toBe('OpenRouter HTTP 429 (rate_limit_exceeded)');
    expect(result.extraction).toBeNull();
  });

  it('treats exhausted free-account credits as a stop condition', async () => {
    mockResponse({ error: { code: 402, message: 'Insufficient credits' } }, 402);
    const result = await run();
    expect(result.errorCategory).toBe('auth');
    expect(result.error).toBe('OpenRouter HTTP 402');
  });

  it('marks timeout and overload separately', async () => {
    mockResponse({ error: { code: 408, metadata: { error_type: 'timeout' } } }, 408);
    expect((await run()).errorCategory).toBe('timeout');

    mockResponse({ error: { code: 503, metadata: { error_type: 'provider_overloaded' } } }, 503);
    expect((await run()).errorCategory).toBe('provider_error');
  });

  it('handles an error recorded on a choice and guards malformed metadata', async () => {
    mockResponse(
      {
        choices: [
          {
            finish_reason: 'error',
            error: {
              code: 502,
              metadata: { error_type: 'sensitive token: should not be logged' },
            },
          },
        ],
      },
      200,
    );
    const result = await run();
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).toBe('OpenRouter HTTP 502');
    expect(result.error).not.toContain('sensitive token');
  });

  it('does not change accepted free-model JSON extraction', async () => {
    mockResponse(
      {
        choices: [
          {
            message: {
              content: JSON.stringify({ is_relevant: false, confidence: 0.5, evidence: [] }),
            },
          },
        ],
      },
      200,
    );
    const result = await run();
    expect(result.errorCategory).toBe('none');
    expect(result.extraction?.is_relevant).toBe(false);
  });
});
