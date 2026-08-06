/**
 * Alert emission abstraction — credential-free by design.
 *
 * Alerts are emitted through a pluggable sink selected by `ALERT_SINK`:
 *   - 'log'  (default): structured JSON lines on stderr, safe to forward to
 *     any log collector without credentials.
 *   - 'none': suppress all alert emission.
 *
 * No sink here ever requires credentials; channels that would (email,
 * webhooks, pagers) are intentionally NOT implemented. When such a channel is
 * needed, it must run as a separate, externally-configured consumer of these
 * structured alert lines.
 *
 * Deduplication: repeated alerts with the same dedup key are suppressed
 * within `ALERT_DEDUP_WINDOW_MINUTES` (default 60) per process. This prevents
 * a failing source from flooding logs once per document within a single run.
 */

import type { FailureCategory } from './failure-categories.js';

export interface AlertEvent {
  /** Stable alert identity, e.g. 'source-health-failure'. */
  alertType: string;
  /** Severity for routing decisions. */
  severity: 'critical' | 'warning' | 'info';
  /** Human-readable one-line description. Never contains credentials or token-bearing URLs. */
  message: string;
  /** Failure category when the alert describes an error (see failure-categories.ts). */
  category?: FailureCategory;
  sourceId?: string;
  runId?: string;
  /** Extra structured context; values must be credential-free. */
  context?: Record<string, unknown>;
}

export interface AlertSink {
  emit(alert: AlertEvent): void;
  /** Number of alerts suppressed by deduplication since process start. */
  readonly suppressedCount: number;
}

export interface AlertSinkOptions {
  sink?: 'log' | 'none';
  dedupWindowMinutes?: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

export class LogAlertSink implements AlertSink {
  private lastEmitted = new Map<string, number>();
  private suppressed = 0;

  constructor(
    private dedupWindowMs: number,
    private now: () => number = Date.now,
  ) {}

  get suppressedCount(): number {
    return this.suppressed;
  }

  emit(alert: AlertEvent): void {
    const key = alertDedupKey(alert);
    const ts = this.now();
    const previous = this.lastEmitted.get(key);
    if (previous !== undefined && ts - previous < this.dedupWindowMs) {
      this.suppressed++;
      return;
    }
    this.lastEmitted.set(key, ts);
    console.error(
      JSON.stringify({
        type: 'alert',
        timestamp: new Date(ts).toISOString(),
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        ...(alert.category !== undefined ? { category: alert.category } : {}),
        ...(alert.sourceId !== undefined ? { sourceId: alert.sourceId } : {}),
        ...(alert.runId !== undefined ? { runId: alert.runId } : {}),
        ...(alert.context !== undefined ? { context: alert.context } : {}),
      }),
    );
  }
}

class NullAlertSink implements AlertSink {
  get suppressedCount(): number {
    return 0;
  }
  emit(): void {
    // intentionally empty — alerts suppressed by configuration
  }
}

/**
 * Dedup key: same alert type + source + category within the window is one alert.
 */
export function alertDedupKey(alert: AlertEvent): string {
  return [alert.alertType, alert.sourceId ?? '-', alert.category ?? '-'].join('|');
}

/**
 * Create the process-wide alert sink from environment configuration.
 */
export function createAlertSink(options?: AlertSinkOptions): AlertSink {
  const sinkType = options?.sink ?? (process.env.ALERT_SINK === 'none' ? 'none' : 'log');
  if (sinkType === 'none') return new NullAlertSink();

  const windowMinutes =
    options?.dedupWindowMinutes ??
    (Number.isFinite(Number(process.env.ALERT_DEDUP_WINDOW_MINUTES))
      ? Number(process.env.ALERT_DEDUP_WINDOW_MINUTES)
      : 60);

  const now = options?.now ?? Date.now;
  return new LogAlertSink(Math.max(0, windowMinutes) * 60_000, now);
}
