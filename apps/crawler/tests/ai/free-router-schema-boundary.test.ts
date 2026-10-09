import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenRouterProvider } from '../../src/ai/providers/openrouter.js';

afterEach(() => vi.unstubAllGlobals());

describe('free router schema boundary', () => {
  it('discards ungrounded free-form statuses but preserves strict evidence validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      is_relevant: false,
                      claimability_status: 'not applicable - prose',
                      procedural_status: 'unknown pending',
                      confidence: 0.4,
                      evidence: [],
                    }),
                  },
                },
              ],
            }),
            { status: 200 },
          ),
      ),
    );
    const provider = new OpenRouterProvider('dummy-token', 'openrouter/free');
    const outcome = await provider.extract('document', 'prompt');
    expect(outcome.errorCategory).toBe('none');
    expect(outcome.extraction?.claimability_status).toBeNull();
    expect(outcome.extraction?.procedural_status).toBeNull();
  });

  it('accepts an evidence-faithful null currency while still rejecting invented amounts', async () => {
    const mockFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    is_relevant: false,
                    official_amount: null,
                    amount_currency: null,
                    confidence: 0.6,
                    evidence: [],
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal('fetch', mockFetch);
    const provider = new OpenRouterProvider('dummy-token', 'openrouter/free');
    const outcome = await provider.extract('document without a currency', 'strict prompt');
    expect(outcome.errorCategory).toBe('none');
    expect(outcome.extraction?.official_amount).toBeNull();
    expect(outcome.extraction?.amount_currency).toBeNull();
  });

  it('still rejects malformed material fields instead of claiming extraction passed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      is_relevant: 'yes',
                      claimability_status: 'not-a-status',
                      confidence: 5,
                      evidence: [],
                    }),
                  },
                },
              ],
            }),
            { status: 200 },
          ),
      ),
    );
    const provider = new OpenRouterProvider('dummy-token', 'openrouter/free');
    const outcome = await provider.extract('document', 'prompt');
    expect(outcome.extraction).toBeNull();
    expect(outcome.errorCategory).toBe('invalid_output');
  });
});
