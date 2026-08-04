import type { Extraction, Evidence } from '@claimradar/claim-schema';
import { ProceduralStatus } from '@claimradar/shared-types';

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function createTestEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    field: 'affected_group',
    excerpt: 'All consumers who purchased the product',
    page: null,
    start_offset: 0,
    end_offset: 50,
    ...overrides,
  };
}

export function createTestExtraction(overrides: Partial<Extraction> = {}): Extraction {
  return {
    is_relevant: true,
    company_names: null,
    legal_case_title: null,
    case_number: null,
    authority: null,
    document_type: null,
    procedural_status: ProceduralStatus.Final,
    claimability_status: null,
    affected_group: 'All consumers who purchased defective products between 2023 and 2024',
    geographic_scope: null,
    relevant_period_start: null,
    relevant_period_end: null,
    relief_type: 'Refund',
    relief_description: null,
    official_amount: 10000000,
    amount_currency: 'INR',
    proof_requirements: null,
    action_required: 'Submit a claim form with proof of purchase',
    official_claim_url: 'https://ncdrc.gov.in/claims/test-2026',
    deadline: '2027-06-30',
    appeal_or_pending_issue: null,
    reason_not_publicly_claimable: null,
    evidence: [
      createTestEvidence({
        field: 'affected_group',
        excerpt: 'All consumers who purchased defective products between 2023 and 2024',
      }),
      createTestEvidence({
        field: 'relief_type',
        excerpt: 'Full refund to all affected consumers',
      }),
      createTestEvidence({ field: 'official_amount', excerpt: 'Rs. 1 crore' }),
      createTestEvidence({
        field: 'deadline',
        excerpt: 'Claims must be submitted by 30 June 2027',
      }),
      createTestEvidence({
        field: 'action_required',
        excerpt: 'Submit a claim form with proof of purchase',
      }),
      createTestEvidence({ field: 'procedural_status', excerpt: 'This is a final order' }),
      createTestEvidence({
        field: 'official_claim_url',
        excerpt: 'https://ncdrc.gov.in/claims/test-2026',
      }),
      createTestEvidence({ field: 'appeal_or_pending_issue', excerpt: 'No appeal pending' }),
    ],
    confidence: 0.9,
    ...overrides,
  };
}

export function createTestSourceDocument(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: nextId('source-doc'),
    source_id: 'source-1',
    canonical_url: 'https://pib.gov.in/test-document',
    content_hash: 'abc123def456',
    title: 'Test Source Document',
    extraction_status: 'pending',
    content_type: 'text/html',
    ...overrides,
  };
}

export function createTestCandidateDocument(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: nextId('candidate'),
    source_document_id: 'source-doc-1',
    keyword_score: 50,
    ai_extraction_status: 'pending',
    validation_status: 'pending',
    publication_decision: 'pending',
    ...overrides,
  };
}
