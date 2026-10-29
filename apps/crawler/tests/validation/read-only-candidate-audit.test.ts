import { describe, expect, it } from 'vitest';
import { createTestExtraction } from '../fixtures/factory.js';
import { auditStoredCandidate } from '../../src/validation/read-only-candidate-audit.js';

const actionExcerpt =
  'Eligible investors who have not yet submitted their claims are, therefore, advised to submit their claims on the portal within the extended period.';
const sourceText =
  'SEBI notice. Eligible I nvestors who have not yet submitted their claims are, therefore, advised to submit their claims on the portal within the extended period.';

const extraction = createTestExtraction({
  company_names: null,
  procedural_status: null,
  affected_group: null,
  relief_type: null,
  official_amount: null,
  amount_currency: null,
  official_claim_url: null,
  deadline: null,
  action_required: 'submit claims within the extended period',
  evidence: [{ field: 'action_required', excerpt: actionExcerpt, page: null }],
});

const input = {
  candidateId: '04c04402-0729-42c6-b1e2-31ce7c1ba177',
  historicalValidation: 'reject',
  historicalPublication: 'reject',
  extraction,
  sourceText,
  sourceDomain: 'sebi.gov.in',
  sourceTrustLevel: 'official',
  documentDate: '2026-10-13T00:00:00.000Z',
};

describe('stored candidate audit is deterministic and read only', () => {
  it('recognizes the official PDF single-word split without mutating evidence', () => {
    const original = structuredClone(input);
    const result = auditStoredCandidate(input);
    expect(result.historical).toEqual({
      validationStatus: 'reject',
      publicationDecision: 'reject',
    });
    expect(result.replay.blockingValidators).toEqual([]);
    expect(result.replay.evidence).toContainEqual({ field: 'action_required', found: true });
    expect(result.eligibleForStaffReassessment).toBe(true);
    expect(result.automaticallyApproved).toBe(false);
    expect(result.dataWritten).toBe(false);
    expect(result.aiRequestsMade).toBe(0);
    expect(result.requiresQualifiedLegalAndEditorialReview).toBe(true);
    expect(input).toEqual(original);
  });

  it('blocks a materially changed claim instruction', () => {
    const result = auditStoredCandidate({
      ...input,
      sourceText: sourceText.replace(
        'submit their claims on the portal',
        'pay a registration fee on the portal',
      ),
    });
    expect(result.replay.blockingValidators).toContain('evidence_backing');
    expect(result.eligibleForStaffReassessment).toBe(false);
  });

  it('rejects missing source text or malformed historical extraction', () => {
    expect(() => auditStoredCandidate({ ...input, sourceText: '' })).toThrow(
      'preserved source text',
    );
    expect(() => auditStoredCandidate({ ...input, extraction: {} })).toThrow(
      'current evidence schema',
    );
  });
});
