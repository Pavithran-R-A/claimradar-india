import type { AIExtractionResult, AIProvider } from './types.js';
import type { AIBudgetManager } from './budget.js';
import type { CircuitBreaker } from './circuit-breaker.js';
import { buildExtractionPrompt } from './prompts.js';
import { LEGAL_SAFETY } from '@claimradar/shared-types';

export class AIExtractor {
  constructor(
    private provider: AIProvider,
    private budget: AIBudgetManager,
    private circuitBreaker: CircuitBreaker,
  ) {}

  async extract(documentText: string, passNumber: 1 | 2): Promise<AIExtractionResult> {
    // Check circuit breaker BEFORE reserving budget: when the circuit is open
    // no provider call can happen, so a budget slot must not be consumed.
    if (!this.circuitBreaker.canAttempt()) {
      return {
        extraction: null,
        rawOutput: null,
        provider: this.provider.name,
        model: '',
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        error: 'Circuit breaker open — provider temporarily unavailable',
        errorCategory: 'provider_error',
      };
    }

    // Atomically check and reserve budget slot
    const reserved = this.budget.tryReserve(passNumber);
    if (!reserved) {
      return {
        extraction: null,
        rawOutput: null,
        provider: this.provider.name,
        model: '',
        inputTokens: null,
        outputTokens: null,
        durationMs: 0,
        error: 'Budget exhausted',
        errorCategory: 'budget_exceeded',
      };
    }

    // Build prompt
    const prompt = buildExtractionPrompt(passNumber, documentText);

    // Call provider
    const result = await this.provider.extract(documentText, prompt);

    // Handle error cases
    if (result.errorCategory !== 'none') {
      this.circuitBreaker.recordFailure();
      return result;
    }

    // Success path
    this.circuitBreaker.recordSuccess();

    // If provider returned null extraction (deferred)
    if (!result.extraction) {
      return result;
    }

    // Cap confidence at LEGAL_SAFETY.MAX_CONFIDENCE
    const cappedConfidence = Math.min(result.extraction.confidence, LEGAL_SAFETY.MAX_CONFIDENCE);
    result.extraction.confidence = cappedConfidence;

    // Reject extractions with zero evidence when document is relevant
    if (result.extraction.is_relevant && result.extraction.evidence.length === 0) {
      return {
        ...result,
        extraction: null,
        error: 'Relevant document extracted with zero evidence — rejected',
        errorCategory: 'invalid_output',
      };
    }

    // If is_relevant is false, mark for skipping
    if (!result.extraction.is_relevant) {
      return result;
    }

    return result;
  }
}
