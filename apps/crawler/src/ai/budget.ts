import type { BudgetState } from './types.js';

export class AIBudgetManager {
  private totalUsed = 0;
  private secondPassUsed = 0;

  constructor(
    private dailyLimit: number = 40,
    private secondPassReserve: number = 10,
    private maxAttemptsPerDocument: number = 2,
  ) {}

  canProcess(): boolean {
    return this.totalUsed < this.dailyLimit - this.secondPassReserve;
  }

  canSecondPass(): boolean {
    return this.secondPassUsed < this.secondPassReserve;
  }

  /**
   * Atomically checks budget availability and reserves a slot.
   * Returns true if the reservation succeeded, false if budget is exhausted.
   * This avoids race conditions where canProcess() and recordUsage() are
   * called separately under concurrent access.
   */
  tryReserve(pass: 1 | 2): boolean {
    if (pass === 1) {
      if (!this.canProcess()) return false;
      this.totalUsed += 1;
      return true;
    }
    if (!this.canSecondPass()) return false;
    this.totalUsed += 1;
    this.secondPassUsed += 1;
    return true;
  }

  recordUsage(count: number, pass: 1 | 2): void {
    this.totalUsed += count;
    if (pass === 2) {
      this.secondPassUsed += count;
    }
  }

  getState(): BudgetState {
    return {
      totalUsed: this.totalUsed,
      dailyLimit: this.dailyLimit,
      secondPassReserve: this.secondPassReserve,
      secondPassUsed: this.secondPassUsed,
      remaining: this.remaining(),
      canProcess: this.canProcess(),
      canSecondPass: this.canSecondPass(),
    };
  }

  remaining(): number {
    return Math.max(0, this.dailyLimit - this.totalUsed);
  }

  reset(): void {
    this.totalUsed = 0;
    this.secondPassUsed = 0;
  }

  getMaxAttemptsPerDocument(): number {
    return this.maxAttemptsPerDocument;
  }
}
