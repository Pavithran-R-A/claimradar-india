import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProviderRouter } from '../../src/ai/router.js';
import {
  GroqFreeProvider,
  ALLOWED_GROQ_FREE_MODEL,
  GROQ_SOURCE_MAX_UTF8_BYTES,
  GROQ_MAX_INPUT_UTF8_BYTES,
  GROQ_MAX_COMPLETION_TOKENS,
  GROQ_REQUEST_OVERHEAD_UTF8_BYTES,
  boundGroqSourceText,
} from '../../src/ai/providers/groq-free.js';

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
    expect(body.reasoning_effort).toBe('low');
    expect(body.max_completion_tokens).toBe(GROQ_MAX_COMPLETION_TOKENS);
  });

  it.each([
    [401, 'auth'],
    [402, 'auth'],
    [403, 'auth'],
    [413, 'provider_error'],
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

  it('preserves short source text exactly, including Unicode legal evidence', () => {
    const original = 'உரிமை கோரல் மற்றும் दावा refund deadline: 2026-11-13';
    expect(boundGroqSourceText(original)).toBe(original);
  });

  it('bounds multilingual PDF text by UTF-8 bytes while retaining verbatim cues and tail', () => {
    const original =
      'HEADER-' +
      'அறிக்கை விண்ணப்பம் ₹'.repeat(450) +
      ' Official investor refund deadline 13 November 2026 at the claims portal. ' +
      'அறிவிப்பு தொகை ₹'.repeat(450) +
      '-SOURCE-END';
    const bounded = boundGroqSourceText(original);
    expect(new TextEncoder().encode(bounded).length).toBeLessThanOrEqual(
      GROQ_SOURCE_MAX_UTF8_BYTES,
    );
    expect(bounded).toContain('HEADER-');
    expect(bounded).toContain('investor refund deadline');
    expect(bounded).toContain('-SOURCE-END');
    expect(bounded).toContain('Omitted source context');
    expect(bounded).not.toBe(original);
  });

  it('never sends a large raw PDF directly to Groq, without making a second request', async () => {
    const fetchMock = setup({
      choices: [
        {
          finish_reason: 'stop',
          message: { content: '{"is_relevant":false,"confidence":0.5,"evidence":[]}' },
        },
      ],
    });
    const raw = 'अधिसूचना दावा'.repeat(6_000) + ' SOURCE-ENDING';
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      raw,
      'fixed prompt',
    );
    expect(result.errorCategory).toBe('none');
    const [, request] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(request.body as string) as {
      messages: Array<{ role: string; content: string }>;
    };
    const bounded = payload.messages.find((message) => message.role === 'user')?.content;
    expect(new TextEncoder().encode(bounded ?? '').length).toBeLessThanOrEqual(
      GROQ_SOURCE_MAX_UTF8_BYTES,
    );
    expect(bounded).toContain('SOURCE-ENDING');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bounds combined UTF-8 input and reserved output below the free TPM allowance', async () => {
    const fetchMock = setup({
      choices: [
        {
          finish_reason: 'stop',
          message: { content: '{"is_relevant":false,"confidence":0.5,"evidence":[]}' },
        },
      ],
    });
    const source = 'தமிழ் दावा refund notice '.repeat(5_000) + ' SOURCE-ENDING';
    const prompt = 'Required legal evidence rules and JSON schema. '.repeat(80);
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      source,
      prompt,
    );
    expect(result.errorCategory).toBe('none');
    const [, request] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(request.body as string) as {
      messages: Array<{ role: string; content: string }>;
      max_completion_tokens: number;
    };
    const messageContents = body.messages.map((message) => message.content).join('');
    const inputBytes = new TextEncoder().encode(messageContents).length;
    const boundedInputBytes = inputBytes + GROQ_REQUEST_OVERHEAD_UTF8_BYTES;
    expect(boundedInputBytes).toBeLessThanOrEqual(GROQ_MAX_INPUT_UTF8_BYTES);
    expect(boundedInputBytes + body.max_completion_tokens).toBeLessThan(8_000);
    expect(body.messages[1]?.content).toContain('SOURCE-ENDING');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refuses an oversized system prompt locally without contacting Groq', async () => {
    const fetchMock = setup({ choices: [] });
    const result = await new GroqFreeProvider('dummy', ALLOWED_GROQ_FREE_MODEL).extract(
      'source',
      'X'.repeat(GROQ_MAX_INPUT_UTF8_BYTES),
    );
    expect(result.errorCategory).toBe('invalid_output');
    expect(result.error).toBe('Groq prompt exceeds safe free-tier request budget');
    expect(fetchMock).not.toHaveBeenCalled();
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
