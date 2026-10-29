import { extractionSchema } from '@claimradar/claim-schema';
import { verifyEvidence } from './evidence.js';
import { redactUnsupportedOptionalEvidence } from './redact-unsupported.js';
import { runAllValidators } from './runner.js';
import { computeClaimabilityScore } from './scorer.js';
import { decidePublication } from '../publication/policy.js';

/**
 * Re-evaluates a stored AI extraction without calling an AI provider or
 * modifying a database. This is diagnostic evidence, NOT editorial approval.
 */
export function auditStoredCandidate(input: {
  candidateId: string;
  historicalValidation: string;
  historicalPublication: string;
  extraction: unknown;
  sourceText: string;
  sourceDomain: string;
  sourceTrustLevel: string;
  documentDate: string | null;
}) {
  if (!input.sourceText.trim()) {
    throw new Error('Cannot audit a candidate without preserved source text');
  }
  const parsed = extractionSchema.safeParse(input.extraction);
  if (!parsed.success) {
    throw new Error('Stored AI extraction does not match the current evidence schema');
  }

  const originalEvidence = verifyEvidence(parsed.data, input.sourceText);
  const redaction = redactUnsupportedOptionalEvidence(parsed.data, originalEvidence.results);
  const evidence = verifyEvidence(redaction.extraction, input.sourceText);
  const validation = runAllValidators({
    extraction: redaction.extraction,
    sourceText: input.sourceText,
    sourceDomain: input.sourceDomain,
    trustLevel: input.sourceTrustLevel,
    documentDate: input.documentDate,
    evidenceVerification: evidence,
    redactedFields: redaction.redactedFields,
  });
  const score = computeClaimabilityScore({
    validationResults: validation,
    aiConfidence: redaction.extraction.confidence,
    sourceTrustLevel: input.sourceTrustLevel,
    evidenceCount: evidence.results.length,
    evidenceVerified: evidence.allVerified,
  });
  const policy = decidePublication({
    extraction: redaction.extraction,
    validationResults: validation,
    claimabilityScore: score,
    sourceDomain: input.sourceDomain,
    trustLevel: input.sourceTrustLevel,
    featureFlags: { AUTO_VERIFY_CLAIMABLES: false },
  });

  return {
    type: 'read-only-stored-candidate-audit',
    candidateId: input.candidateId,
    historical: {
      validationStatus: input.historicalValidation,
      publicationDecision: input.historicalPublication,
    },
    replay: {
      validationDecision: validation.overallDecision,
      blockingValidators: validation.blockingFailures.map((result) => result.name),
      warnings: validation.warnings.map((result) => result.name),
      redactedOptionalFields: redaction.redactedFields,
      evidence: evidence.results.map((result) => ({
        field: result.field,
        found: result.found,
      })),
      allCriticalEvidenceVerified: evidence.allVerified,
      simulatedPolicyAction: policy.action,
    },
    eligibleForStaffReassessment:
      redaction.extraction.is_relevant &&
      validation.overallDecision !== 'reject' &&
      policy.action === 'human_review',
    automaticallyApproved: false,
    dataWritten: false,
    aiRequestsMade: 0,
    requiresQualifiedLegalAndEditorialReview: true,
  };
}
