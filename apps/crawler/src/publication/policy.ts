import type { Extraction } from '@claimradar/claim-schema';
import { ClaimableStatus, PublicationStatus } from '@claimradar/shared-types';
import type { ValidationRunResult } from '../validation/runner.js';

export type PublicationAction = 'auto_publish' | 'human_review' | 'reject';

export interface PublicationDecision {
  action: PublicationAction;
  status: ClaimableStatus;
  publicationStatus: PublicationStatus;
  reasons: string[];
}

export function decidePublication(params: {
  extraction: Extraction;
  validationResults: ValidationRunResult;
  claimabilityScore: number;
  sourceDomain: string;
  trustLevel: string;
  featureFlags: { AUTO_VERIFY_CLAIMABLES: boolean };
}): PublicationDecision {
  const { extraction, validationResults, claimabilityScore, trustLevel, featureFlags } = params;
  const reasons: string[] = [];

  // 1. Individual judgment guard triggered → reject
  const individualGuard = validationResults.results.find(
    (r) => r.name === 'individual_judgment_guard' && !r.passed,
  );
  if (individualGuard) {
    reasons.push('Individual judgment cannot be published as group claim');
    return {
      action: 'reject',
      status: ClaimableStatus.IndividualJudgment,
      publicationStatus: PublicationStatus.Draft,
      reasons,
    };
  }

  // 2. Any blocking validator fails → reject
  if (validationResults.blockingFailures.length > 0) {
    for (const failure of validationResults.blockingFailures) {
      reasons.push(`Blocking failure: ${failure.name} — ${failure.reason}`);
    }
    return {
      action: 'reject',
      status: ClaimableStatus.Rejected,
      publicationStatus: PublicationStatus.Draft,
      reasons,
    };
  }

  // 3. AUTO_VERIFY_CLAIMABLES=false (the default) → human_review at best
  if (!featureFlags.AUTO_VERIFY_CLAIMABLES) {
    reasons.push('AUTO_VERIFY_CLAIMABLES is disabled — human review required');
    return {
      action: 'human_review',
      status: ClaimableStatus.Detected,
      publicationStatus: PublicationStatus.Draft,
      reasons,
    };
  }

  // 4. AUTO_VERIFY_CLAIMABLES=true AND score >= 70 AND trust_level='official' AND all validators pass
  const allValidatorsPass = validationResults.allPassed;
  if (allValidatorsPass && claimabilityScore >= 70 && trustLevel === 'official') {
    const status =
      extraction.procedural_status === 'final'
        ? ClaimableStatus.OfficialUpdate
        : ClaimableStatus.PotentialClaimable;

    reasons.push(
      `Auto-publish: score=${claimabilityScore}, trust=${trustLevel}, all validators passed`,
    );
    return {
      action: 'auto_publish',
      status,
      publicationStatus: PublicationStatus.Published,
      reasons,
    };
  }

  // 5. Otherwise → human_review
  reasons.push('Does not meet auto-publish criteria — requires human review');
  if (claimabilityScore < 70) reasons.push(`Score ${claimabilityScore} < 70 threshold`);
  if (trustLevel !== 'official') reasons.push(`Trust level "${trustLevel}" is not official`);
  if (!allValidatorsPass) reasons.push('Some validators did not pass');

  return {
    action: 'human_review',
    status: ClaimableStatus.Detected,
    publicationStatus: PublicationStatus.Draft,
    reasons,
  };
}
