import { describe, expect, it } from 'vitest';
import { createProviderRouter } from '../../src/ai/router.js';
import { OpenRouterProvider } from '../../src/ai/providers/openrouter.js';

describe('strictly free model policy', () => {
  it('selects only the current free router with an API key', () => {
    const provider = createProviderRouter({
      AI_PROVIDER: 'openrouter',
      OPENROUTER_API_KEY: 'test-value-never-used',
      OPENROUTER_MODEL: 'openrouter/free',
    });
    expect(provider.name).toBe('openrouter');
  });

  it('does not silently use a paid provider or fallback', () => {
    expect(() =>
      createProviderRouter({
        AI_PROVIDER: 'nvidia',
        NVIDIA_API_KEY: 'test-value-never-used',
      }),
    ).toThrow(/FREE_ONLY_PROVIDER_GUARD/);
    expect(() =>
      createProviderRouter({
        AI_PROVIDER: 'openrouter',
        OPENROUTER_MODEL: 'anthropic/claude-sonnet',
        OPENROUTER_API_KEY: 'test-value-never-used',
      }),
    ).toThrow(/FREE_ONLY_MODEL_GUARD/);
    expect(() => new OpenRouterProvider('test-value', 'openai/gpt-4o')).toThrow(
      /FREE_ONLY_MODEL_GUARD/,
    );
  });

  it('keeps AI disabled without a configured API key or when explicitly off', () => {
    expect(createProviderRouter({ AI_PROVIDER: 'none', NVIDIA_API_KEY: 'test-value' }).name).toBe(
      'noai',
    );
    expect(createProviderRouter({ AI_PROVIDER: 'openrouter' }).name).toBe('noai');
  });
});
