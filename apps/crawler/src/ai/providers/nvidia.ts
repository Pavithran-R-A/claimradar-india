import { extractionSchema } from '@claimradar/claim-schema';
import type { AIExtractionResult, AIProvider } from '../types.js';

export class NvidiaNimProvider implements AIProvider {
  readonly name = 'nvidia';

  constructor(
    private apiKey: string,
    private model: string,
    private baseUrl: string,
    private timeoutMs: number = 30_000,
  ) {}

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

    const endpoint = `${this.baseUrl}/v1/chat/completions`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content },
          ],
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (response.status === 429) {
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          error: 'Rate limit exceeded',
          errorCategory: 'rate_limit',
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          error: 'Authentication failed',
          errorCategory: 'auth',
        };
      }
      if (response.status >= 500) {
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          error: `Provider error: ${response.status}`,
          errorCategory: 'provider_error',
        };
      }
      if (!response.ok) {
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          error: `HTTP ${response.status}`,
          errorCategory: 'provider_error',
        };
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const rawOutput = data.choices?.[0]?.message?.content ?? null;
      const inputTokens = data.usage?.prompt_tokens ?? null;
      const outputTokens = data.usage?.completion_tokens ?? null;

      if (!rawOutput) {
        return {
          ...baseResult,
          durationMs: Date.now() - start,
          error: 'Empty response from provider',
          errorCategory: 'provider_error',
        };
      }

      const parsed = this.parseJsonFromContent(rawOutput);
      if (!parsed) {
        return {
          ...baseResult,
          rawOutput,
          durationMs: Date.now() - start,
          inputTokens,
          outputTokens,
          error: 'Failed to parse JSON from AI output',
          errorCategory: 'invalid_output',
        };
      }

      const validation = extractionSchema.safeParse(parsed);
      if (!validation.success) {
        return {
          ...baseResult,
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
        model: this.model,
        inputTokens,
        outputTokens,
        durationMs: Date.now() - start,
        error: null,
        errorCategory: 'none',
      };
    } catch (err) {
      const errorCategory =
        err instanceof DOMException && err.name === 'TimeoutError' ? 'timeout' : 'provider_error';
      return { ...baseResult, durationMs: Date.now() - start, error: String(err), errorCategory };
    }
  }

  private parseJsonFromContent(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch {
      /* continue */
    }
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        /* continue */
      }
    }
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
