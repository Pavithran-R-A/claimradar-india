/**
 * Missed-run detection logic.
 *
 * Strategy: the Daily Crawl workflow records one `crawl_runs` row per run.
 * A run is "missed" when no crawl run with a terminal success status
 * (`completed` or `completed_with_errors`) started within the expected
 * window (schedule period + grace). The `source-health` workflow executes
 * this check on its own schedule so a broken/skipped daily schedule becomes
 * visible within at most one health-check interval.
 *
 * The pure evaluation here is database-agnostic; the CLI `crawl-status`
 * command fetches the latest run and delegates the verdict here.
 */

export interface MissedRunInput {
  /** Timestamp of the most recent crawl run start, or null if no run exists. */
  lastRunAt: Date | string | null;
  /** Status of the most recent crawl run, e.g. 'completed', 'running', 'failed'. */
  lastRunStatus?: string | null;
  /** Timestamp of the most recent successful run, or null if none exists. */
  lastSuccessAt: Date | string | null;
  /** Maximum acceptable age of the last successful run, in hours. */
  maxAgeHours: number;
  /** Reference time (defaults to now). */
  now?: Date;
}

export type MissedRunVerdict = 'ok' | 'stale' | 'never_ran';

export interface MissedRunEvaluation {
  verdict: MissedRunVerdict;
  /** Age of the last successful run in hours (Infinity when never). */
  ageHours: number;
  /** True when operator action is required. */
  alert: boolean;
  reason: string;
}

export function evaluateMissedRun(input: MissedRunInput): MissedRunEvaluation {
  const now = input.now ?? new Date();
  const maxAgeMs = input.maxAgeHours * 3600 * 1000;

  if (!input.lastSuccessAt) {
    return {
      verdict: 'never_ran',
      ageHours: Infinity,
      alert: true,
      reason: 'No successful crawl run has ever been recorded',
    };
  }

  const lastSuccess = new Date(input.lastSuccessAt);
  const ageMs = now.getTime() - lastSuccess.getTime();
  const ageHours = ageMs / 3600_000;

  if (ageMs > maxAgeMs) {
    const runningNote =
      input.lastRunStatus === 'running' ? ' (a run is currently in progress)' : '';
    return {
      verdict: 'stale',
      ageHours,
      alert: true,
      reason: `Last successful crawl was ${ageHours.toFixed(1)}h ago, exceeding the ${input.maxAgeHours}h threshold${runningNote}`,
    };
  }

  return {
    verdict: 'ok',
    ageHours,
    alert: false,
    reason: `Last successful crawl ${ageHours.toFixed(1)}h ago, within the ${input.maxAgeHours}h threshold`,
  };
}
