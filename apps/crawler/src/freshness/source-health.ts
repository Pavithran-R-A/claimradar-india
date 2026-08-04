/**
 * Source Health State Machine
 * Evaluates source health transitions across healthy, delayed, stale, failing, and disabled states.
 */

export type SourceHealthState = 'healthy' | 'delayed' | 'stale' | 'failing' | 'disabled';

export interface SourceHealthInput {
  isCurrentlyEnabled: boolean;
  expectedCheckFrequencyHours: number;
  lastAttemptedCheck?: Date | string | null;
  lastSuccessfulCheck?: Date | string | null;
  lastContentChange?: Date | string | null;
  consecutiveFailureCount: number;
  lastErrorCategory?: string | null;
}

export interface SourceHealthEvaluation {
  status: SourceHealthState;
  shouldAttemptFetch: boolean;
  reason: string;
  nextScheduledCheck: Date;
  updatedConsecutiveFailures: number;
}

/**
 * Calculates the deterministic health status of a source based on its check history.
 */
export function evaluateSourceHealth(
  input: SourceHealthInput,
  now: Date = new Date(),
): SourceHealthEvaluation {
  const {
    isCurrentlyEnabled,
    expectedCheckFrequencyHours,
    lastSuccessfulCheck,
    consecutiveFailureCount,
  } = input;

  const frequencyMs = expectedCheckFrequencyHours * 3600 * 1000;
  const lastSuccessDate = lastSuccessfulCheck ? new Date(lastSuccessfulCheck) : null;
  const elapsedMs = lastSuccessDate ? now.getTime() - lastSuccessDate.getTime() : Infinity;

  // Rule 7: Disabled sources remain disabled until explicitly enabled
  if (!isCurrentlyEnabled) {
    return {
      status: 'disabled',
      shouldAttemptFetch: false,
      reason: 'Source is manually disabled in source registry',
      nextScheduledCheck: new Date(now.getTime() + 86400 * 1000),
      updatedConsecutiveFailures: consecutiveFailureCount,
    };
  }

  // Rule 5: Repeated failures move source toward failing
  if (consecutiveFailureCount >= 3) {
    return {
      status: 'failing',
      shouldAttemptFetch: true,
      reason: `Source failed ${consecutiveFailureCount} consecutive fetch attempts`,
      nextScheduledCheck: new Date(now.getTime() + frequencyMs),
      updatedConsecutiveFailures: consecutiveFailureCount,
    };
  }

  // Rule 6: Excess age moves source to stale or delayed
  if (elapsedMs > frequencyMs * 3) {
    return {
      status: 'stale',
      shouldAttemptFetch: true,
      reason: `Source content not verified in over 3x expected frequency (${Math.round(elapsedMs / 3600000)} hours ago)`,
      nextScheduledCheck: now,
      updatedConsecutiveFailures: consecutiveFailureCount,
    };
  }

  if (elapsedMs > frequencyMs * 1.5) {
    return {
      status: 'delayed',
      shouldAttemptFetch: true,
      reason: `Fetch overdue past expected ${expectedCheckFrequencyHours} hour window`,
      nextScheduledCheck: now,
      updatedConsecutiveFailures: consecutiveFailureCount,
    };
  }

  // Rule 1: First successful fetch or recent success produces healthy state
  return {
    status: 'healthy',
    shouldAttemptFetch: elapsedMs >= frequencyMs,
    reason: 'Source operating within normal freshness parameters',
    nextScheduledCheck: lastSuccessDate ? new Date(lastSuccessDate.getTime() + frequencyMs) : now,
    updatedConsecutiveFailures: consecutiveFailureCount,
  };
}

/**
 * Calculates updated source parameters after a fetch attempt.
 */
export function recordFetchResult(
  currentInput: SourceHealthInput,
  outcome: { success: boolean; contentChanged: boolean; errorCategory?: string },
  now: Date = new Date(),
): {
  newHealth: SourceHealthEvaluation;
  lastAttemptedCheck: Date;
  lastSuccessfulCheck: Date | null;
  lastContentChange: Date | null;
  consecutiveFailureCount: number;
} {
  const lastAttemptedCheck = now;

  if (outcome.success) {
    // Rule 8: Successful fetch resets failure counter and restores healthy state
    const lastSuccessfulCheck = now;
    const lastContentChange = outcome.contentChanged
      ? now
      : currentInput.lastContentChange
        ? new Date(currentInput.lastContentChange)
        : now;

    const newHealth = evaluateSourceHealth(
      {
        ...currentInput,
        lastAttemptedCheck,
        lastSuccessfulCheck,
        lastContentChange,
        consecutiveFailureCount: 0,
        lastErrorCategory: null,
      },
      now,
    );

    return {
      newHealth,
      lastAttemptedCheck,
      lastSuccessfulCheck,
      lastContentChange,
      consecutiveFailureCount: 0,
    };
  } else {
    // Rule 4: Single transient failure increments failure count without closing or invalidating
    const newFailCount = currentInput.consecutiveFailureCount + 1;
    const lastSuccessfulCheck = currentInput.lastSuccessfulCheck
      ? new Date(currentInput.lastSuccessfulCheck)
      : null;
    const lastContentChange = currentInput.lastContentChange
      ? new Date(currentInput.lastContentChange)
      : null;

    const newHealth = evaluateSourceHealth(
      {
        ...currentInput,
        lastAttemptedCheck,
        consecutiveFailureCount: newFailCount,
        lastErrorCategory: outcome.errorCategory ?? 'NETWORK_ERROR',
      },
      now,
    );

    return {
      newHealth,
      lastAttemptedCheck,
      lastSuccessfulCheck,
      lastContentChange,
      consecutiveFailureCount: newFailCount,
    };
  }
}
