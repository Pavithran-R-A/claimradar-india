import { describe, it, expect } from 'vitest';
import { verifyEvidence } from '../../src/validation/evidence.js';
import { createTestExtraction } from '../fixtures/factory.js';

describe('Evidence Verification', () => {
  it('should verify excerpt found in source text', () => {
    const sourceText =
      'The NCDRC directed a full refund to all consumers who purchased defective products between 2023 and 2024. The company must comply within 90 days.';

    const extraction = createTestExtraction({
      affected_group: 'All consumers who purchased defective products between 2023 and 2024',
      evidence: [
        {
          field: 'affected_group',
          excerpt: 'all consumers who purchased defective products between 2023 and 2024',
          page: null,
          start_offset: 30,
          end_offset: 110,
        },
      ],
    });

    const result = verifyEvidence(extraction, sourceText);
    expect(result.results[0]!.found).toBe(true);
  });

  it('should reject excerpt NOT found in source text', () => {
    const sourceText =
      'This is a completely different document about government appointments and seminars.';

    const extraction = createTestExtraction({
      evidence: [
        {
          field: 'affected_group',
          excerpt: 'All consumers who purchased defective products between 2023 and 2024',
          page: null,
          start_offset: 0,
          end_offset: 50,
        },
      ],
    });

    const result = verifyEvidence(extraction, sourceText);
    expect(result.results[0]!.found).toBe(false);
  });

  it('should handle whitespace normalization', () => {
    const sourceText = 'The  NCDRC   directed   a full   refund   to all consumers.';

    const extraction = createTestExtraction({
      evidence: [
        {
          field: 'affected_group',
          excerpt: 'The NCDRC directed a full refund to all consumers',
          page: null,
          start_offset: 0,
          end_offset: 50,
        },
      ],
    });

    const result = verifyEvidence(extraction, sourceText);
    expect(result.results[0]!.found).toBe(true);
  });

  it('should report allVerified false when critical fields lack evidence', () => {
    const sourceText = 'Some unrelated content here.';

    const extraction = createTestExtraction({
      affected_group: 'All consumers',
      relief_type: 'Refund',
      official_amount: 1000000,
      evidence: [],
    });

    const result = verifyEvidence(extraction, sourceText);
    expect(result.allVerified).toBe(false);
  });

  it('should report allVerified true when all critical non-null fields have evidence', () => {
    const sourceText =
      'All consumers who purchased defective products between 2023 and 2024 are eligible. ' +
      'Full refund to all affected consumers is ordered. ' +
      'Rs. 1 crore total amount. ' +
      'Claims must be submitted by 30 June 2027. ' +
      'Submit a claim form with proof of purchase. ' +
      'This is a final order. ' +
      'Visit https://ncdrc.gov.in/claims/test-2026. ' +
      'No appeal pending.';

    const extraction = createTestExtraction({
      evidence: [
        {
          field: 'affected_group',
          excerpt: 'All consumers who purchased defective products between 2023 and 2024',
          page: null,
          start_offset: 0,
          end_offset: 80,
        },
        {
          field: 'relief_type',
          excerpt: 'Full refund to all affected consumers',
          page: null,
          start_offset: 90,
          end_offset: 130,
        },
        {
          field: 'official_amount',
          excerpt: 'Rs. 1 crore',
          page: null,
          start_offset: 140,
          end_offset: 155,
        },
        {
          field: 'deadline',
          excerpt: 'Claims must be submitted by 30 June 2027',
          page: null,
          start_offset: 160,
          end_offset: 210,
        },
        {
          field: 'action_required',
          excerpt: 'Submit a claim form with proof of purchase',
          page: null,
          start_offset: 220,
          end_offset: 270,
        },
        {
          field: 'procedural_status',
          excerpt: 'This is a final order',
          page: null,
          start_offset: 280,
          end_offset: 305,
        },
        {
          field: 'official_claim_url',
          excerpt: 'https://ncdrc.gov.in/claims/test-2026',
          page: null,
          start_offset: 310,
          end_offset: 355,
        },
        {
          field: 'appeal_or_pending_issue',
          excerpt: 'No appeal pending',
          page: null,
          start_offset: 360,
          end_offset: 380,
        },
      ],
    });

    const result = verifyEvidence(extraction, sourceText);
    expect(result.allVerified).toBe(true);
  });
});
