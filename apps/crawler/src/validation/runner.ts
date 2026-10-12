import type { Extraction } from '@claimradar/claim-schema';
import type { EvidenceVerification } from './evidence.js';
import type { ValidatorResult } from './validators.js';
import {
  evidenceBackingValidator,
  individualJudgmentGuard,
  domainAllowlistValidator,
  sourceTrustLevelValidator,
  groupVsIndividualValidator,
  finalVsProposedValidator,
  appealOrStayValidator,
  deadlineValidator,
  amountSupportValidator,
  claimUrlSupportValidator,
  sourceFreshnessValidator,
} from './validators.js';

export interface ValidationRunResult {
  results: ValidatorResult[];
  allPassed: boolean;
  blockingFailures: ValidatorResult[];
  warnings: ValidatorResult[];
  overallDecision: 'pass' | 'review' | 'reject';
}

export function runAllValidators(params: {
  extraction: Extraction;
  sourceText: string;
  sourceDomain: string;
  trustLevel: string;
  documentDate: string | null;
  evidenceVerification: { allVerified: boolean; results: EvidenceVerification[] };
  redactedFields?: readonly string[];
}): ValidationRunResult {
  const { extraction, sourceDomain, trustLevel, documentDate, evidenceVerification } = params;

  const results: ValidatorResult[] = [
    evidenceBackingValidator(extraction, evidenceVerification.results),
    individualJudgmentGuard(extraction),
    domainAllowlistValidator(sourceDomain),
    sourceTrustLevelValidator(trustLevel),
    groupVsIndividualValidator(extraction),
    finalVsProposedValidator(extraction),
    appealOrStayValidator(extraction),
    deadlineValidator(extraction),
    amountSupportValidator(evidenceVerification.results, extraction.official_amount),
    claimUrlSupportValidator(evidenceVerification.results, extraction.official_claim_url),
    sourceFreshnessValidator(documentDate),
  ];

  if (params.redactedFields?.length) {
    results.push({
      name: 'unsupported_optional_ai_fields',
      passed: false,
      severity: 'warn',
      reason: 'Unbacked optional AI values removed; accountable human review required',
      details: { fields: [...params.redactedFields] },
    });
  }

  const blockingFailures = results.filter((r) => !r.passed && r.severity === 'block');
  const warnings = results.filter((r) => !r.passed && r.severity === 'warn');
  const allPassed = results.every((r) => r.passed);

  let overallDecision: 'pass' | 'review' | 'reject';
  if (blockingFailures.length > 0) {
    overallDecision = 'reject';
  } else if (warnings.length > 0) {
    overallDecision = 'review';
  } else {
    overallDecision = 'pass';
  }

  return {
    results,
    allPassed,
    blockingFailures,
    warnings,
    overallDecision,
  };
}
