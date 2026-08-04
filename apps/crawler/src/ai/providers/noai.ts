import type { AIExtractionResult, AIProvider } from '../types.js';

export class NoAiProvider implements AIProvider {
  readonly name = 'noai';

  isAvailable(): boolean {
    return true;
  }

  async extract(_content: string, _prompt: string): Promise<AIExtractionResult> {
    return {
      extraction: null,
      rawOutput: null,
      provider: this.name,
      model: 'none',
      inputTokens: null,
      outputTokens: null,
      durationMs: 0,
      error: 'no AI provider configured',
      errorCategory: 'no_provider',
    };
  }
}
