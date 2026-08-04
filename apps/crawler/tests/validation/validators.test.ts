import { describe, it, expect } from 'vitest';
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
} from '../../src/validation/validators.js';
import { createTestExtraction } from '../fixtures/factory.js';
import type { EvidenceVerification } from '../../src/validation/evidence.js';

function createEvidenceVerifications(
  entries: Array<{ field: string; found: boolean }>,
): EvidenceVerification[] {
  return entries.map((e) => ({
    field: e.field,
    excerpt: `excerpt for ${e.field}`,
    found: e.found,
    normalizedExcerpt: `excerpt for ${e.field}`,
    matchedPosition: e.found ? { start: 0, end: 10 } : undefined,
    page: null,
  }));
}

describe('Validators — 10 Scenarios', () => {
  // Scenario 1: Individual consumer compensation → individual_judgment_guard blocks
  it('Scenario 1: Individual consumer compensation → blocked by individual_judgment_guard', () => {
    const extraction = createTestExtraction({
      affected_group: 'Shri Ramesh Kumar',
      document_type: 'individual_compensation_order',
    });

    const result = individualJudgmentGuard(extraction);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('block');
    expect(result.name).toBe('individual_judgment_guard');
  });

  // Scenario 2: Group refund order → passes all validators
  it('Scenario 2: Group refund order → passes group validators', () => {
    const extraction = createTestExtraction({
      affected_group: 'All consumers who purchased XYZ products',
      document_type: 'group_refund_order',
    });

    const individualResult = individualJudgmentGuard(extraction);
    expect(individualResult.passed).toBe(true);

    const groupResult = groupVsIndividualValidator(extraction);
    expect(groupResult.passed).toBe(true);
  });

  // Scenario 3: Company recall with refund → passes
  it('Scenario 3: Company recall with refund → passes', () => {
    const extraction = createTestExtraction({
      affected_group: 'All customers who purchased recalled vehicles',
      relief_type: 'Refund and repair',
      document_type: 'product_recall',
    });

    const groupResult = groupVsIndividualValidator(extraction);
    expect(groupResult.passed).toBe(true);

    const individualResult = individualJudgmentGuard(extraction);
    expect(individualResult.passed).toBe(true);
  });

  // Scenario 4: Proposed settlement (no approval) → final_vs_proposed warns
  it('Scenario 4: Proposed settlement → final_vs_proposed warns', () => {
    const extraction = createTestExtraction({
      document_type: 'proposed_settlement',
      relief_description: 'A proposed settlement for affected consumers',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      procedural_status: 'proposed' as any,
    });

    const result = finalVsProposedValidator(extraction);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warn');
    expect(result.details.detectedSignals).toContain('proposed');
  });

  // Scenario 5: Pending representative complaint → appeal_or_stay warns
  it('Scenario 5: Pending appeal → appeal_or_stay warns', () => {
    const extraction = createTestExtraction({
      appeal_or_pending_issue: 'An appeal filed by the company is pending before the High Court',
    });

    const result = appealOrStayValidator(extraction);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warn');
    expect(result.details.detectedSignals).toContain('appeal filed');
  });

  // Scenario 6: Expired registration notice → deadline_validator blocks
  it('Scenario 6: Expired deadline → deadline_validator blocks', () => {
    const extraction = createTestExtraction({
      deadline: '2020-01-01',
    });

    const result = deadlineValidator(extraction);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('block');
    expect(result.details.expired).toBe(true);
  });

  // Scenario 7: Appeal staying earlier order → appeal_or_stay warns
  it('Scenario 7: Stay granted on earlier order → appeal_or_stay warns', () => {
    const extraction = createTestExtraction({
      appeal_or_pending_issue: 'Stay granted by the appellate tribunal on the original order',
    });

    const result = appealOrStayValidator(extraction);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warn');
    expect(result.details.detectedSignals).toContain('stay granted');
  });

  // Scenario 8: News report with no primary source → domain_allowlist warns
  it('Scenario 8: Non-official domain → domain_allowlist warns', () => {
    const result = domainAllowlistValidator('newswebsite.com');
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warn');
    expect(result.name).toBe('domain_allowlist');
  });

  it('Scenario 8b: Official domain → domain_allowlist passes', () => {
    const result = domainAllowlistValidator('pib.gov.in');
    expect(result.passed).toBe(true);
  });

  // Scenario 9: Government procurement → should be filtered by keyword scorer, not validators
  it('Scenario 9: Government procurement → source_trust_level validator works', () => {
    const result = sourceTrustLevelValidator('official');
    expect(result.passed).toBe(true);

    const communityResult = sourceTrustLevelValidator('community');
    expect(communityResult.passed).toBe(false);
  });

  // Scenario 10: Incomplete claim instructions → evidence_backing blocks
  it('Scenario 10: Incomplete evidence backing → evidence_backing blocks', () => {
    const extraction = createTestExtraction({
      affected_group: 'All consumers',
      relief_type: 'Refund',
      official_amount: 5000000,
    });

    // Only provide evidence for some fields
    const evidenceResults = createEvidenceVerifications([
      { field: 'affected_group', found: true },
      { field: 'relief_type', found: true },
      // Missing evidence for official_amount and other non-null fields
    ]);

    const result = evidenceBackingValidator(extraction, evidenceResults);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('block');
    expect(result.details.missing).toBeDefined();
  });

  describe('Additional validator tests', () => {
    it('amount_support_validator: passes when amount is present and has evidence', () => {
      const evidenceResults = createEvidenceVerifications([
        { field: 'official_amount', found: true },
      ]);
      const result = amountSupportValidator(evidenceResults, 5000000);
      expect(result.passed).toBe(true);
    });

    it('amount_support_validator: blocks when amount is present but has no evidence', () => {
      const evidenceResults = createEvidenceVerifications([
        { field: 'official_amount', found: false },
      ]);
      const result = amountSupportValidator(evidenceResults, 5000000);
      expect(result.passed).toBe(false);
      expect(result.severity).toBe('block');
    });

    it('amount_support_validator: passes when no amount is claimed (null)', () => {
      const result = amountSupportValidator([], null);
      expect(result.passed).toBe(true);
      expect(result.reason).toBe('No amount claimed — evidence not required');
    });

    it('amount_support_validator: passes when no amount is claimed (undefined)', () => {
      const result = amountSupportValidator([], undefined);
      expect(result.passed).toBe(true);
      expect(result.details.hasAmount).toBe(false);
    });

    it('claim_url_support_validator: passes when URL has evidence', () => {
      const evidenceResults = createEvidenceVerifications([
        { field: 'official_claim_url', found: true },
      ]);
      const result = claimUrlSupportValidator(evidenceResults);
      expect(result.passed).toBe(true);
    });

    it('source_freshness_validator: passes for recent document', () => {
      const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const result = sourceFreshnessValidator(recentDate);
      expect(result.passed).toBe(true);
    });

    it('source_freshness_validator: fails for old document', () => {
      const oldDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
      const result = sourceFreshnessValidator(oldDate);
      expect(result.passed).toBe(false);
    });

    it('deadline_validator: passes for future deadline within 5 years', () => {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const extraction = createTestExtraction({ deadline: futureDate });
      const result = deadlineValidator(extraction);
      expect(result.passed).toBe(true);
    });

    it('deadline_validator: passes when no deadline specified', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extraction = createTestExtraction({ deadline: null as any });
      const result = deadlineValidator(extraction);
      expect(result.passed).toBe(true);
    });
  });
});
