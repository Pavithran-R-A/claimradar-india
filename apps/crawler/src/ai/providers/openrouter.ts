import { extractionSchema } from '@claimradar/claim-schema';
import { ClaimableStatus, ProceduralStatus } from '@claimradar/shared-types';
import type { AIExtractionResult, AIProvider } from '../types.js';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/** Persist only safe, bounded routing metadata, never upstream messages. */
function safeRoutedModel(value: unknown, fallback: string): string {
  if (
    typeof value !== 'string' ||
    value.length > 128 ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_./:-]*$/.test(value) ||
    !value.includes('/')
  ) {
    return fallback;
  }
  return value;
}

// Only stable metadata is retained. Raw upstream messages can contain source text.
function safeFailure(
  status: number,
  input: unknown,
): Pick<AIExtractionResult, 'error' | 'errorCategory'> {
  const obj = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const e =
    obj.error && typeof obj.error === 'object' ? (obj.error as Record<string, unknown>) : {};
  const m =
    e.metadata && typeof e.metadata === 'object' ? (e.metadata as Record<string, unknown>) : {};
  const t = m.error_type;
  const type = typeof t === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(t) ? t : null;
  const code = typeof e.code === 'number' && e.code >= 400 && e.code <= 599 ? e.code : status;
  const errorCategory: AIExtractionResult['errorCategory'] =
    code === 429 || type === 'rate_limit_exceeded'
      ? 'rate_limit'
      : [401, 402, 403].includes(code) || type === 'authentication'
        ? 'auth'
        : [408, 504].includes(code) || type === 'timeout'
          ? 'timeout'
          : 'provider_error';
  return { error: `OpenRouter HTTP ${code}${type ? ` (${type})` : ''}`, errorCategory };
}

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';

  constructor(
    private apiKey: string,
    private model: string,
    private timeoutMs: number = 60_000,
  ) {
    if (this.model !== 'openrouter/free') {
      throw new Error('FREE_ONLY_MODEL_GUARD: refusing any non-free OpenRouter model');
    }
  }

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  async extract(content: string, prompt: string): Promise<AIExtractionResult> {
    const start = Date.now();
    const baseResult: AIExtractionResult = {
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
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          provider: {
            // Do not silently route structured extraction through an endpoint
            // that ignores the requested response format.
            require_parameters: true,
          },
          response_format: { type: 'json_object' },
          temperature: 0,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content },
          ],
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        let errorBody: unknown = null;
        try {
          errorBody = await response.json();
        } catch {
          /* No unsafe raw logging. */
        }
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          ...safeFailure(response.status, errorBody),
        };
      }

      const data = (await response.json()) as {
        model?: unknown;
        error?: unknown;
        choices?: Array<{
          message?: { content?: string };
          error?: unknown;
          finish_reason?: string;
        }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const routedModel = safeRoutedModel(data.model, this.model);
      const embeddedError = data.error ?? data.choices?.[0]?.error;
      if (embeddedError || data.choices?.[0]?.finish_reason === 'error') {
        return {
          ...baseResult,
          model: routedModel,
          durationMs: Date.now() - start,
          ...safeFailure(200, { error: embeddedError }),
        };
      }

      // A truncated finish is not valid claim evidence, even if its JSON parses.
      if (data.choices?.[0]?.finish_reason === 'length') {
        return {
          ...baseResult,
          model: routedModel,
          durationMs: Date.now() - start,
          error: 'OpenRouter response truncated',
          errorCategory: 'invalid_output',
        };
      }

      const rawOutput = data.choices?.[0]?.message?.content ?? null;
      const inputTokens = data.usage?.prompt_tokens ?? null;
      const outputTokens = data.usage?.completion_tokens ?? null;

      if (!rawOutput) {
        return {
          ...baseResult,
          model: routedModel,
          durationMs: Date.now() - start,
          error: 'Empty response from provider',
          errorCategory: 'provider_error',
        };
      }

      const parsed = this.parseJsonFromContent(rawOutput);
      if (!parsed) {
        return {
          ...baseResult,
          model: routedModel,
          rawOutput,
          durationMs: Date.now() - start,
          inputTokens,
          outputTokens,
          error: 'Failed to parse JSON from AI output',
          errorCategory: 'invalid_output',
        };
      }

      // Free router models sometimes put prose into enum fields. Discard only
      // unsupported status values rather than inventing a normalized status:
      // all substantive extraction/evidence fields stay under strict validation.
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
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

      const validation = extractionSchema.safeParse(parsed);
      if (!validation.success) {
        return {
          ...baseResult,
          model: routedModel,
          rawOutput,
          durationMs: Date.now() - start,
          inputTokens,
          outputTokens,
          error: `Schema validation failed: ${validation.error.message}`,
          errorCategory: 'invalid_output',
        };
      }

      return {
        extraction: validation.data,
        rawOutput,
        provider: this.name,
        model: routedModel,
        inputTokens,
        outputTokens,
        durationMs: Date.now() - start,
        error: null,
        errorCategory: 'none',
      };
    } catch (err) {
      const errorCategory =
        err instanceof DOMException && err.name === 'TimeoutError' ? 'timeout' : 'provider_error';
      // Fetch exceptions can include request headers or response fragments.
      // Never retain their original text in telemetry or database records.
      const error =
        errorCategory === 'timeout' ? 'OpenRouter request timed out' : 'OpenRouter network request failed';
      return { ...baseResult, durationMs: Date.now() - start, error, errorCategory };
    }
  }

  private parseJsonFromContent(content: string): unknown {
    // Try direct parse first
    try {
      return JSON.parse(content);
    } catch {
      /* continue */
    }
    // Try extracting JSON from markdown code block
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        /* continue */
      }
    }
    // Try finding first { ... } in content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        /* continue */
      }
    }
    return null;
  }
}
