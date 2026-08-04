import type { ValidationRunResult } from './runner.js';

export function computeClaimabilityScore(params: {
  validationResults: ValidationRunResult;
  aiConfidence: number;
  sourceTrustLevel: string;
  evidenceCount: number;
  evidenceVerified: boolean;
}): number {
  const { validationResults, aiConfidence, sourceTrustLevel, evidenceCount, evidenceVerified } =
    params;

  // Base: AI confidence * 40 (max 40 points)
  const confidencePoints = Math.min(aiConfidence * 40, 40);

  // Validation pass rate: (passed / total) * 30 (max 30 points)
  const total = validationResults.results.length;
  const passed = validationResults.results.filter((r) => r.passed).length;
  const validationPoints = total > 0 ? (passed / total) * 30 : 0;

  // Source trust: official=20, reputable=15, community=5, unverified=0
  let trustPoints = 0;
  switch (sourceTrustLevel) {
    case 'official':
      trustPoints = 20;
      break;
    case 'reputable':
      trustPoints = 15;
      break;
    case 'community':
      trustPoints = 5;
      break;
    default:
      trustPoints = 0;
      break;
  }

  // Evidence quality: verified evidence count * 2 (max 10 points)
  const evidencePoints = evidenceVerified ? Math.min(evidenceCount * 2, 10) : 0;

  const total_score = confidencePoints + validationPoints + trustPoints + evidencePoints;
  return Math.min(Math.round(total_score), 100);
}
