type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold: number = 3,
    private cooldownMs: number = 60_000,
  ) {}

  canAttempt(): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'half-open') return true;
    // state === 'open' → check if cooldown has elapsed
    if (Date.now() - this.lastFailureTime >= this.cooldownMs) {
      this.state = 'half-open';
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    if (this.state === 'half-open') {
      this.state = 'closed';
    }
    this.failureCount = 0;
  }

  recordFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.state === 'half-open' || this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
