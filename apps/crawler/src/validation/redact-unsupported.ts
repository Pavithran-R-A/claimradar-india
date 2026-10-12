import { extractionSchema, type Extraction } from '@claimradar/claim-schema';
import type { EvidenceVerification } from './evidence.js';

/**
 * Remove unsubstantiated OPTIONAL AI fields, never invent their missing proof.
 * Hard material terms (eligible group, relief, amount, deadline, claim action
 * and official claim URL) are intentionally NOT scrubbed: missing evidence for
 * those fields must still block publication in the evidence validator.
 *
 * Every removed value is recorded by the caller as an audit warning so that
 * auto-publication remains prohibited even if all remaining fields pass.
 */
const REVIEW_ONLY_OPTIONAL_FIELDS = [
  'company_names',
  'legal_case_title',
  'case_number',
  'authority',
  'document_type',
  'procedural_status',
  'claimability_status',
  'geographic_scope',
  'relevant_period_start',
  'relevant_period_end',
  'relief_description',
  'proof_requirements',
  'appeal_or_pending_issue',
  'reason_not_publicly_claimable',
] as const satisfies readonly (keyof Extraction)[];

export function redactUnsupportedOptionalEvidence(
  extraction: Extraction,
  evidence: readonly EvidenceVerification[],
): { extraction: Extraction; redactedFields: string[] } {
  const backed = new Set(evidence.filter((entry) => entry.found).map((entry) => entry.field));
  const cleaned: Record<string, unknown> = { ...extraction };
  const redactedFields: string[] = [];

  for (const field of REVIEW_ONLY_OPTIONAL_FIELDS) {
    if (cleaned[field] !== null && cleaned[field] !== undefined && !backed.has(field)) {
      cleaned[field] = null;
      redactedFields.push(field);
    }
  }

  // A missing amount has no established currency: do not preserve a guessed INR.
  if (cleaned['official_amount'] == null && cleaned['amount_currency'] != null) {
    cleaned['amount_currency'] = null;
    redactedFields.push('amount_currency');
  }

  return {
    extraction: extractionSchema.parse(cleaned),
    redactedFields,
  };
}
