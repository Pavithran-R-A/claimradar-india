import type { Extraction } from '@claimradar/claim-schema';

export interface AIProvider {
  name: string;
  extract(content: string, prompt: string): Promise<AIExtractionResult>;
  isAvailable(): boolean;
}

export interface AIExtractionResult {
  extraction: Extraction | null;
  rawOutput: string | null;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
  error: string | null;
  errorCategory:
    | 'none'
    | 'rate_limit'
    | 'timeout'
    | 'auth'
    | 'budget_exceeded'
    | 'provider_error'
    | 'invalid_output'
    | 'no_provider';
}

export interface BudgetState {
  totalUsed: number;
  dailyLimit: number;
  secondPassReserve: number;
  secondPassUsed: number;
  remaining: number;
  canProcess: boolean;
  canSecondPass: boolean;
}
