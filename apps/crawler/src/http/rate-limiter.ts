import type { RateLimitConfig } from './types.js';

interface BucketState {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets = new Map<string, BucketState>();

  async acquire(domain: string, config: RateLimitConfig): Promise<void> {
    const now = Date.now();
    const refillRatePerMs = config.requestsPerMinute / (60 * 1000);

    let bucket = this.buckets.get(domain);
    if (!bucket) {
      bucket = { tokens: config.requestsPerMinute, lastRefill: now };
      this.buckets.set(domain, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(config.requestsPerMinute, bucket.tokens + elapsed * refillRatePerMs);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return;
    }

    // Calculate wait time until next token is available
    const deficit = 1 - bucket.tokens;
    const waitMs = Math.ceil(deficit / refillRatePerMs);

    await sleep(waitMs);

    // After waiting, refill and consume
    const afterWait = Date.now();
    const refillElapsed = afterWait - bucket.lastRefill;
    bucket.tokens = Math.min(
      config.requestsPerMinute,
      bucket.tokens + refillElapsed * refillRatePerMs,
    );
    bucket.lastRefill = afterWait;
    bucket.tokens = Math.max(0, bucket.tokens - 1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
