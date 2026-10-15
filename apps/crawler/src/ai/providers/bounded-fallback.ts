import type { AIExtractionResult, AIProvider } from '../types.js';

/**
 * Primary free inference stays authoritative. A licensed secondary provider is
 * used only after a transient primary failure, and at most N times per process.
 * This is not a "free NVIDIA" route or a license substitute.
 */
export class BoundedFallbackProvider implements AIProvider {
  readonly name = 'openrouter+nvidia';
  private fallbackRequests = 0;

  constructor(
    private readonly primary: AIProvider,
    private readonly fallback: AIProvider,
    private readonly maxFallbackRequests: number,
  ) {
    if (!Number.isSafeInteger(maxFallbackRequests) || maxFallbackRequests < 1 || maxFallbackRequests > 2) {
      throw new Error('NVIDIA_FALLBACK_BUDGET_GUARD: limit must be 1 or 2');
    }
  }

  isAvailable(): boolean {
    return this.primary.isAvailable();
  }

  async extract(content: string, prompt: string): Promise<AIExtractionResult> {
    const result = await this.primary.extract(content, prompt);
    const retryable = ['rate_limit', 'timeout', 'provider_error'].includes(result.errorCategory);
    if (!retryable || !this.fallback.isAvailable() || this.fallbackRequests >= this.maxFallbackRequests) {
      return result;
    }

    // Increment synchronously before the network request to avoid concurrent
    // crawls exceeding this process's request allowance.
    this.fallbackRequests++;
    return this.fallback.extract(content, prompt);
  }
}
