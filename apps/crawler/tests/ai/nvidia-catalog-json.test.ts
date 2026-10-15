import { afterEach, describe, expect, it, vi } from 'vitest';
import { NvidiaNimProvider } from '../../src/ai/providers/nvidia.js';
import { createProviderRouter } from '../../src/ai/router.js';

afterEach(() => vi.unstubAllGlobals());

const testModel = 'nvidia/nemotron-3.5-lightning-30b-a3b';
const provider = () => new NvidiaNimProvider('synthetic-test-only', testModel, 'https://integrate.api.nvidia.com');
const extraction = { is_relevant: false, evidence: [], confidence: 0.8 };

function response(body: unknown, status = 200) {
  const mock = vi.fn(async (_url: string, options: RequestInit) => {
    return new Response(JSON.stringify(body), { status });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

describe('NVIDIA catalog-verified JSON integration', () => {
  it('uses non-reasoning JSON mode and bounded output on the catalog model', async () => {
    const fetchMock = response({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(extraction) } }],
      usage: { prompt_tokens: 110, completion_tokens: 85 },
    });
    const result = await provider().extract('fictional-only', 'extract safely');
    expect(result.errorCategory).toBe('none');
    expect(result.extraction?.is_relevant).toBe(false);
    expect(result.inputTokens).toBe(110);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, request] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(request.body));
    expect(body.model).toBe(testModel);
    expect(body.stream).toBe(false);
    expect(body.chat_template_kwargs).toEqual({ enable_thinking: false });
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.max_tokens).toBeLessThanOrEqual(1536);
    expect(body.messages[1].content).toBe('fictional-only');
  });

  it('never treats a retired catalog model (410) as successful extraction', async () => {
    response({ error: { message: 'model is gone' } }, 410);
    const result = await provider().extract('fictional-only', 'extract safely');
    expect(result.extraction).toBeNull();
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).not.toContain('model is gone');
  });

  it('rejects an incomplete reasoning-length response even if JSON appears valid', async () => {
    response({ choices: [{ finish_reason: 'length', message: { content: JSON.stringify(extraction) } }] });
    const result = await provider().extract('fictional-only', 'extract safely');
    expect(result.extraction).toBeNull();
    expect(result.errorCategory).toBe('invalid_output');
  });

  it('treats a successful HTTP envelope containing a provider error as failure', async () => {
    response({ error: { message: 'do not persist this sensitive text' }, choices: [] });
    const result = await provider().extract('fictional-only', 'extract safely');
    expect(result.errorCategory).toBe('provider_error');
    expect(result.error).not.toContain('sensitive text');
  });

  it('rejects malformed JSON and output missing mandatory evidence fields', async () => {
    response({ choices: [{ message: { content: 'not JSON' } }] });
    expect((await provider().extract('fictional-only', 'extract safely')).errorCategory).toBe('invalid_output');
    response({ choices: [{ message: { content: JSON.stringify({ is_relevant: true, confidence: 0.9 }) } }] });
    expect((await provider().extract('fictional-only', 'extract safely')).errorCategory).toBe('invalid_output');
  });

  it('allows only the catalog-verified model after independent production authorization', () => {
    const config = {
      AI_PROVIDER: 'openrouter+nvidia',
      OPENROUTER_API_KEY: 'synthetic-openrouter',
      NVIDIA_API_KEY: 'synthetic-nvidia',
      NVIDIA_PRODUCTION_AUTHORIZED: true,
    };
    expect(createProviderRouter(config).name).toBe('openrouter+nvidia');
    expect(() => createProviderRouter({ ...config, NVIDIA_MODEL: 'meta/llama-3.1-8b-instruct' })).toThrow(
      /NVIDIA_MODEL_GUARD/,
    );
    expect(() => createProviderRouter({ ...config, NVIDIA_PRODUCTION_AUTHORIZED: false })).toThrow(
      /NVIDIA_LICENSE_GUARD/,
    );
  });
});
