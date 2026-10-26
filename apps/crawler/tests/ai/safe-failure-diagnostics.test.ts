import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeProviderErrorMetadata } from '../../src/ai/safe-failure-diagnostics.js';
import { OpenRouterProvider } from '../../src/ai/providers/openrouter.js';
import { ALLOWED_GROQ_FREE_MODEL, GroqFreeProvider } from '../../src/ai/providers/groq-free.js';

afterEach(() => vi.unstubAllGlobals());

describe('safe OpenRouter auth diagnostics', () => {
  it('keeps only numeric HTTP statuses and no upstream response text', () => {
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 401')).toEqual({
      safe_http_status: 401,
    });
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 402')).toEqual({
      safe_http_status: 402,
    });
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 403 (access_denied)')).toEqual({
      safe_http_status: 403,
    });
    expect(safeProviderErrorMetadata('other-provider', 'OpenRouter HTTP 402')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 402 leaked-key')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 200')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 602')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', null)).toBeNull();
  });

  it('records strict Groq HTTP statuses but never upstream response text', async () => {
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 400')).toEqual({ safe_http_status: 400 });
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 413')).toEqual({ safe_http_status: 413 });
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 429')).toEqual({ safe_http_status: 429 });
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 503')).toEqual({ safe_http_status: 503 });
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 200')).toBeNull();
    expect(safeProviderErrorMetadata('groq', 'Groq HTTP 413 secret-token')).toBeNull();
    expect(safeProviderErrorMetadata('groq', 'OpenRouter HTTP 413')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'Groq HTTP 413')).toBeNull();
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ error: { message: 'sensitive message' } }), { status: 413 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const result = await new GroqFreeProvider('dummy-key', ALLOWED_GROQ_FREE_MODEL).extract(
      'source text',
      'prompt',
    );
    expect(result.errorCategory).toBe('provider_error');
    expect(safeProviderErrorMetadata(result.provider, result.error)).toEqual({
      safe_http_status: 413,
    });
    expect(result.error).not.toContain('sensitive');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sanitizes network exceptions without leaking request credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Authorization: Bearer should-never-be-logged');
      }),
    );
    const result = await new OpenRouterProvider('example-key', 'openrouter/free').extract(
      'source text',
      'prompt',
    );
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).toBe('OpenRouter network request failed');
    expect(result.error).not.toContain('Bearer');
  });

  it('preserves the free-provider auth halt behavior without retrying', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: { code: 402 } }), { status: 402 })),
    );
    const result = await new OpenRouterProvider('example-key', 'openrouter/free').extract(
      'source text',
      'prompt',
    );
    expect(result.errorCategory).toBe('auth');
    expect(safeProviderErrorMetadata(result.provider, result.error)).toEqual({
      safe_http_status: 402,
    });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});
