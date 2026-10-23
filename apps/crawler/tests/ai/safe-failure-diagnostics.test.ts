import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeProviderErrorMetadata } from '../../src/ai/safe-failure-diagnostics.js';
import { OpenRouterProvider } from '../../src/ai/providers/openrouter.js';

afterEach(() => vi.unstubAllGlobals());

describe('safe OpenRouter auth diagnostics', () => {
  it('keeps only numeric HTTP statuses and no upstream response text', () => {
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 401')).toEqual({
      safe_http_status: 401,
    });
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 402')).toEqual({
      safe_http_status: 402,
    });
    expect(
      safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 403 (access_denied)'),
    ).toEqual({ safe_http_status: 403 });
    expect(safeProviderErrorMetadata('other-provider', 'OpenRouter HTTP 402')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 402 leaked-key')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 200')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', 'OpenRouter HTTP 602')).toBeNull();
    expect(safeProviderErrorMetadata('openrouter', null)).toBeNull();
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
