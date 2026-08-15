/**
 * Claim Freshness & Verification Evaluator
 * Evaluates record freshness, closing-soon verification thresholds, and legal status stability.
 */

import { calculateDeadlineStatus } from '@claimradar/shared-types';

export interface ClaimFreshnessInput {
  claimId: string;
  deadlineDate?: Date | string | null;
  lastVerifiedAt?: Date | string | null;
  sourceHealthState: 'healthy' | 'delayed' | 'stale' | 'failing' | 'disabled';
  proceduralStatus: string; // e.g. 'open', 'closing_soon', 'expired'
  isOfficialRouteValid: boolean;
}

export interface ClaimFreshnessResult {
  isActionable: boolean;
  needsReverification: boolean;
  freshnessWarning?: string | undefined;
  proceduralStatusUnchanged: boolean;
  displayStatus: string;
}

/**
 * Evaluates claim freshness without mutating underlying procedural legal status.
 */
export function evaluateClaimFreshness(
  input: ClaimFreshnessInput,
  now: Date = new Date(),
): ClaimFreshnessResult {
  const {
    deadlineDate,
    lastVerifiedAt,
    sourceHealthState,
    proceduralStatus,
    isOfficialRouteValid,
  } = input;

  const verifiedDate = lastVerifiedAt ? new Date(lastVerifiedAt) : null;
  const verifiedAgeHours = verifiedDate
    ? (now.getTime() - verifiedDate.getTime()) / (3600 * 1000)
    : Infinity;

  const deadlineCalc = calculateDeadlineStatus(deadlineDate, { clockDate: now });
  const isClosingSoon = deadlineCalc.isClosingSoon;

  // Rule 9 & 10: Source failure never changes procedural legal status or closes a claim
  const proceduralStatusUnchanged = true;

  // Rule 11: Closing-soon records use a stricter verification threshold (24 hours)
  const verificationThresholdHours = isClosingSoon ? 24 : 72;
  const needsReverification = verifiedAgeHours > verificationThresholdHours;

  // Rule 12: Old orders remain actionable when official routes and deadlines remain valid
  const isDeadlineValid = deadlineCalc.status !== 'EXPIRED';
  const isActionable = isOfficialRouteValid && isDeadlineValid;

  // Rule 13: Stale active records receive explicit warning or are withheld according to policy
  let freshnessWarning: string | undefined;
  if (sourceHealthState === 'failing' || sourceHealthState === 'stale') {
    freshnessWarning =
      'Upstream source currently delayed or unverified; verify directly on official portal before submitting.';
  } else if (needsReverification) {
    freshnessWarning = `Record last verified ${Math.round(verifiedAgeHours)} hours ago. Verification in progress.`;
  }

  return {
    isActionable,
    needsReverification,
    freshnessWarning,
    proceduralStatusUnchanged,
    displayStatus: proceduralStatus,
  };
}
