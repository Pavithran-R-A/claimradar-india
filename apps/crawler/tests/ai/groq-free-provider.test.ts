import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProviderRouter } from '../../src/ai/router.js';
import { GroqFreeProvider, ALLOWED_GROQ_FREE_MODEL } from '../../src/ai/providers/groq-free.js';

afterEach(() => vi.unstubAllGlobals());

const setup = (response: unknown, status = 200) => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(response), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('explicit Groq free-plan provider', () => {
  it('remains unavailable by default and refuses any unapproved model or paid fallback', () => {
    expect(() => createProviderRouter({ AI_PROVIDER: 'groq' })).toThrow(/GROQ_FREE_PLAN_GUARD/);
    expect(() =>
      createProviderRouter({
        AI_PROVIDER: 'groq',
        GROQ_FREE_PLAN_CONFIRMED: true,
      }),
    ).toThrow(/GROQ_KEY_GUARD/);
    expect(() =>
      createProviderRouter({
        AI_PROVIDER: 'groq',
        GROQ_FREE_PLAN_CONFIRMED: true,
        GROQ_API_KEY: 'dummy',
        GROQ_MODEL: 'not-approved/paid-model',
      }),
    ).toThrow(/GROQ_FREE_MODEL_GUARD/);
    expect(() => new GroqFreeProvider('dummy', 'not-approved/paid-model')).toThrow(
      /GROQ_FREE_MODEL_GUARD/,
    );
    expect(createProviderRouter({ AI_PROVIDER: 'openrouter' }).name).toBe('noai');
  });

  it('selects the pinned model only with explicit free-plan confirmation', () => {
    const provider = createProviderRouter({
      AI_PROVIDER: 'groq',
      GROQ_FREE_PLAN_CONFIRMED: true,
      GROQ_API_KEY: 'dummy',
      GROQ_MODEL: ALLOWED_GROQ_FREE_MODEL,
    });
    expect(provider.name).toBe('groq');
    expect(provider.isAvailable()).toBe(true);
  });

  it('sends bounded no-reasoning JSON mode and validates the same extraction schema', async () => {
    const fetchMock = setup({
      choices: [
        {
          finish_reason: 'stop',
          message: { content: '{"is_relevant":false,"confidence":0.5,"evidence":[]}' },
        },
      ],
      usage: { prompt_tokens: 25, completion_tokens: 30 },
    });
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      'source',
      'prompt',
    );
    expect(result.errorCategory).toBe('none');
    expect(result.extraction?.is_relevant).toBe(false);
    expect(result.inputTokens).toBe(25);
    expect(result.outputTokens).toBe(30);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(request.body as string) as Record<string, unknown>;
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(body.model).toBe(ALLOWED_GROQ_FREE_MODEL);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.reasoning_effort).toBe('none');
    expect(body.max_completion_tokens).toBe(4096);
  });

  it.each([
    [401, 'auth'],
    [402, 'auth'],
    [403, 'auth'],
    [429, 'rate_limit'],
    [503, 'provider_error'],
  ] as const)('does not retry HTTP %s and records only safe status', async (status, category) => {
    const fetchMock = setup(
      { error: { message: 'authorization secret must never be logged' } },
      status,
    );
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      'source',
      'prompt',
    );
    expect(result.errorCategory).toBe(category);
    expect(result.error).toBe(`Groq HTTP ${status}`);
    expect(result.error).not.toContain('secret');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects truncated, malformed or invented AI output', async () => {
    setup({
      choices: [
        {
          finish_reason: 'length',
          message: { content: '{"is_relevant":false,"confidence":0.5,"evidence":[]}' },
        },
      ],
    });
    expect(
      (await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract('source', 'prompt'))
        .errorCategory,
    ).toBe('invalid_output');
    setup({ choices: [{ finish_reason: 'stop', message: { content: 'not json' } }] });
    expect(
      (await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract('source', 'prompt'))
        .errorCategory,
    ).toBe('invalid_output');
    setup({
      choices: [
        {
          finish_reason: 'stop',
          message: { content: '{"is_relevant":"yes","confidence":5,"evidence":[]}' },
        },
      ],
    });
    expect(
      (await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract('source', 'prompt'))
        .errorCategory,
    ).toBe('invalid_output');
  });

  it('scrubs network exceptions instead of storing secrets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Bearer secret-token');
      }),
    );
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      'source',
      'prompt',
    );
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).toBe('Groq network request failed');
  });
});
