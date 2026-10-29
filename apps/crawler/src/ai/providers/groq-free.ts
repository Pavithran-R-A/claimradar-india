import { extractionSchema } from '@claimradar/claim-schema';
import { ClaimableStatus, ProceduralStatus } from '@claimradar/shared-types';
import type { AIExtractionResult, AIProvider } from '../types.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
export const ALLOWED_GROQ_FREE_MODEL = 'openai/gpt-oss-120b';

export const GROQ_SOURCE_MAX_UTF8_BYTES = 6_000;

const encoder = new TextEncoder();

function utf8ByteLength(value: string): number {
  return encoder.encode(value).length;
}

function utf8Prefix(value: string, maxBytes: number): string {
  let bytes = 0;
  let result = '';
  for (const character of value) {
    const next = utf8ByteLength(character);
    if (bytes + next > maxBytes) break;
    result += character;
    bytes += next;
  }
  return result;
}

function utf8Suffix(value: string, maxBytes: number): string {
  let bytes = 0;
  const characters: string[] = [];
  for (const character of Array.from(value).reverse()) {
    const next = utf8ByteLength(character);
    if (bytes + next > maxBytes) break;
    characters.push(character);
    bytes += next;
  }
  return characters.reverse().join('');
}

/**
 * Groq's free-tier limits and multilingual PDF text are measured in tokens
 * and UTF-8 bytes, not JavaScript UTF-16 character counts. Select a small,
 * deterministic *verbatim* source window. The full original remains stored
 * for source-backed validation and human editorial review; omitted text
 * must never be treated as proof that no recovery notice exists.
 */
export function boundGroqSourceText(content: string): string {
  if (utf8ByteLength(content) <= GROQ_SOURCE_MAX_UTF8_BYTES) return content;

  const prefix = utf8Prefix(content, 3_000);
  const suffix = utf8Suffix(content, 1_100);
  const highlights: string[] = [];
  let remaining = 1_100;
  let lastEnd = 0;
  const cues =
    /refund|claim|deadline|investor|creditor|eligib|submit|application|portal|recover|payment|दावा|आवेदन|நிதி|உரிமை/giu;
  for (const match of content.matchAll(cues)) {
    const position = match.index;
    if (position < prefix.length + 140 || position > content.length - suffix.length - 140) {
      continue;
    }
    const start = Math.max(prefix.length, position - 110);
    const end = Math.min(content.length - suffix.length, position + 190);
    if (start <= lastEnd || end <= start) continue;
    const excerpt = content.slice(start, end);
    const segment = utf8Prefix(excerpt, Math.min(remaining, 520));
    if (utf8ByteLength(segment) < 30) break;
    highlights.push(segment);
    remaining -= utf8ByteLength(segment);
    lastEnd = end;
    if (remaining < 60 || highlights.length >= 4) break;
  }

  const separator =
    '\n[Omitted source context — verify any evidence against the complete source]\n';
  const bounded = [prefix, ...highlights, suffix].join(separator);
  // Leave a hard, provider-agnostic byte budget even if the markers change.
  return utf8Prefix(bounded, GROQ_SOURCE_MAX_UTF8_BYTES);
}

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
            { role: 'user', content: boundGroqSourceText(content) },
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
