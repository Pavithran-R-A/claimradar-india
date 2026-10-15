import { describe, expect, it, vi } from 'vitest';
import { createProviderRouter } from '../../src/ai/router.js';
import { BoundedFallbackProvider } from '../../src/ai/providers/bounded-fallback.js';
import type { AIExtractionResult, AIProvider } from '../../src/ai/types.js';

const outcome = (errorCategory: AIExtractionResult['errorCategory']): AIExtractionResult => ({
  extraction: null,
  rawOutput: null,
  provider: 'fake',
  model: 'fake',
  inputTokens: null,
  outputTokens: null,
  durationMs: 1,
  error: errorCategory === 'none' ? null : 'safe synthetic error',
  errorCategory,
});

function stub(name: string, result: AIExtractionResult): AIProvider {
  return { name, isAvailable: () => true, extract: vi.fn(async () => result) };
}

describe('licensed NVIDIA fallback safety', () => {
  it('does not enable NVIDIA simply because the developer key is configured', () => {
    const env = {
      AI_PROVIDER: 'openrouter',
      OPENROUTER_API_KEY: 'test-free-key',
      NVIDIA_API_KEY: 'test-trial-key',
    };
    expect(createProviderRouter(env).name).toBe('openrouter');
    expect(() => createProviderRouter({ ...env, AI_PROVIDER: 'openrouter+nvidia' })).toThrow(
      /NVIDIA_LICENSE_GUARD/,
    );
    expect(() =>
      createProviderRouter({ ...env, AI_PROVIDER: 'nvidia', NVIDIA_PRODUCTION_AUTHORIZED: true }),
    ).toThrow(/FREE_ONLY_PROVIDER_GUARD/);
  });

  it('rejects unapproved endpoints, models, credentials and budgets', () => {
    const env = {
      AI_PROVIDER: 'openrouter+nvidia',
      OPENROUTER_API_KEY: 'test-free-key',
      NVIDIA_API_KEY: 'test-licensed-key',
      NVIDIA_PRODUCTION_AUTHORIZED: true,
    };
    expect(() =>
      createProviderRouter({ ...env, NVIDIA_BASE_URL: 'https://malicious.example' }),
    ).toThrow(/NVIDIA_ENDPOINT_GUARD/);
    expect(() => createProviderRouter({ ...env, NVIDIA_MODEL: 'unknown-model' })).toThrow(
      /NVIDIA_MODEL_GUARD/,
    );
    expect(() => createProviderRouter({ ...env, NVIDIA_FALLBACK_LIMIT: 20 })).toThrow(
      /NVIDIA_FALLBACK_BUDGET_GUARD/,
    );
    expect(() => createProviderRouter({ ...env, NVIDIA_API_KEY: '' })).toThrow(/NVIDIA_KEY_GUARD/);
    expect(createProviderRouter(env).name).toBe('openrouter+nvidia');
  });

  it('never falls back after successful, auth or invalid-output responses', async () => {
    for (const category of ['none', 'auth', 'invalid_output'] as const) {
      const first = stub('primary', outcome(category));
      const second = stub('licensed', outcome('none'));
      const provider = new BoundedFallbackProvider(first, second, 1);
      expect((await provider.extract('fake', 'fake')).errorCategory).toBe(category);
      expect(second.extract).not.toHaveBeenCalled();
    }
  });

  it('uses at most one licensed fallback per run after transient failures', async () => {
    const first = stub('primary', outcome('rate_limit'));
    const second = stub('licensed', outcome('none'));
    const provider = new BoundedFallbackProvider(first, second, 1);
    expect((await provider.extract('fake', 'fake')).errorCategory).toBe('none');
    expect((await provider.extract('fake', 'fake')).errorCategory).toBe('rate_limit');
    expect(second.extract).toHaveBeenCalledTimes(1);
  });

  it('reserves fallback slots before awaiting under concurrent requests', async () => {
    const first = stub('primary', outcome('timeout'));
    const second = stub('licensed', outcome('none'));
    const provider = new BoundedFallbackProvider(first, second, 1);
    await Promise.all([provider.extract('a', 'a'), provider.extract('b', 'b')]);
    expect(second.extract).toHaveBeenCalledTimes(1);
  });

  it('rejects unsafe or missing fallback budgets', () => {
    const first = stub('primary', outcome('timeout'));
    expect(() => new BoundedFallbackProvider(first, first, 0)).toThrow(
      /NVIDIA_FALLBACK_BUDGET_GUARD/,
    );
    expect(() => new BoundedFallbackProvider(first, first, 3)).toThrow(
      /NVIDIA_FALLBACK_BUDGET_GUARD/,
    );
  });
});
