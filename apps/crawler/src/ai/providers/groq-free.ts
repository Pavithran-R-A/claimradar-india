import { extractionSchema } from '@claimradar/claim-schema';
import { ClaimableStatus, ProceduralStatus } from '@claimradar/shared-types';
import type { AIExtractionResult, AIProvider } from '../types.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const ALLOWED_GROQ_FREE_MODEL = 'openai/gpt-oss-120b';

/**
 * Opt-in Groq free-plan extraction. The router requires an explicit, verified
 * free-plan opt-in and never silently falls back from the OpenRouter provider.
 * Account free-tier limits, not the model name alone, determine billing.
 */
export class GroqFreeProvider implements AIProvider {
  readonly name = 'groq';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number = 60_000,
  ) {
    if (model !== ALLOWED_GROQ_FREE_MODEL) {
      throw new Error('GROQ_FREE_MODEL_GUARD: unapproved model refused');
    }
  }

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  async extract(content: string, prompt: string): Promise<AIExtractionResult> {
    const start = Date.now();
    const base: AIExtractionResult = {
      extraction: null,
      rawOutput: null,
      provider: this.name,
      model: this.model,
      inputTokens: null,
      outputTokens: null,
      durationMs: 0,
      error: null,
      errorCategory: 'none',
    };

    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          reasoning_effort: 'low',
          temperature: 0,
          max_completion_tokens: 4096,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content },
          ],
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        // Never read or persist untrusted upstream response details.
        const status = response.status;
        const errorCategory: AIExtractionResult['errorCategory'] = [401, 402, 403].includes(status)
          ? 'auth'
          : status === 429
            ? 'rate_limit'
            : [408, 504].includes(status)
              ? 'timeout'
              : 'provider_error';
        return {
          ...base,
          durationMs: Date.now() - start,
          error: `Groq HTTP ${status}`,
          errorCategory,
        };
      }

      const data = (await response.json()) as {
        choices?: Array<{ finish_reason?: string; message?: { content?: unknown } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const choice = data.choices?.[0];
      if (choice?.finish_reason === 'length' || choice?.finish_reason === 'error') {
        return {
          ...base,
          durationMs: Date.now() - start,
          error: 'Groq response incomplete',
          errorCategory: 'invalid_output',
        };
      }
      if (typeof choice?.message?.content !== 'string' || !choice.message.content.trim()) {
        return {
          ...base,
          durationMs: Date.now() - start,
          error: 'Groq response missing JSON content',
          errorCategory: 'invalid_output',
        };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(choice.message.content);
      } catch {
        return {
          ...base,
          durationMs: Date.now() - start,
          error: 'Groq returned invalid JSON',
          errorCategory: 'invalid_output',
        };
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const fields = parsed as Record<string, unknown>;
        if (
          typeof fields['claimability_status'] === 'string' &&
          !Object.values(ClaimableStatus).includes(fields['claimability_status'] as ClaimableStatus)
        ) {
          fields['claimability_status'] = null;
        }
        if (
          typeof fields['procedural_status'] === 'string' &&
          !Object.values(ProceduralStatus).includes(fields['procedural_status'] as ProceduralStatus)
        ) {
          fields['procedural_status'] = null;
        }
      }

      const parsedExtraction = extractionSchema.safeParse(parsed);
      if (!parsedExtraction.success) {
        return {
          ...base,
          durationMs: Date.now() - start,
          error: 'Groq extraction schema mismatch',
          errorCategory: 'invalid_output',
        };
      }
      return {
        ...base,
        extraction: parsedExtraction.data,
        rawOutput: choice.message.content,
        inputTokens: data.usage?.prompt_tokens ?? null,
        outputTokens: data.usage?.completion_tokens ?? null,
        durationMs: Date.now() - start,
      };
    } catch (error) {
      const errorCategory: AIExtractionResult['errorCategory'] =
        error instanceof DOMException && error.name === 'TimeoutError'
          ? 'timeout'
          : 'provider_error';
      return {
        ...base,
        durationMs: Date.now() - start,
        error:
          errorCategory === 'timeout' ? 'Groq request timed out' : 'Groq network request failed',
        errorCategory,
      };
    }
  }
}
