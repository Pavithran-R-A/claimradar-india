import { vi } from 'vitest';
import { ClaimableStatus, ProceduralStatus, SourceType } from '@claimradar/shared-types';
import type { Company, Claimable, Source } from '@claimradar/shared-types';

export function createMockCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: 'company-1',
    legalName: 'Test Company Pvt Ltd',
    displayName: 'Test Company',
    slug: 'test-company',
    cin: 'U12345MH2020PTC123456',
    sector: 'Technology',
    website: 'https://testcompany.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockClaimable(overrides: Partial<Claimable> = {}): Claimable {
  return {
    id: 'claimable-1',
    companyId: 'company-1',
    slug: 'test-claimable',
    publicTitle: 'Test Claimable Opportunity',
    status: ClaimableStatus.VerifiedClaimable,
    proceduralStatus: ProceduralStatus.Final,
    summary: 'This is a test claimable opportunity',
    affectedGroup: 'All customers',
    reliefType: 'Refund',
    deadline: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockSource(overrides: Partial<Source> = {}): Source {
  return {
    id: 'source-1',
    name: 'Test Source',
    domain: 'testsource.com',
    sourceType: SourceType.RSS,
    adapterType: 'rss',
    isActive: true,
    lastCheckedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };
}

export function createMockCrawlRun(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'crawl-run-1',
    started_at: new Date().toISOString(),
    completed_at: null,
    status: 'running',
    sources_attempted: 0,
    sources_succeeded: 0,
    documents_discovered: 0,
    candidates_created: 0,
    ai_budget_used: 0,
    metadata: {},
    ...overrides,
  };
}

export function createMockSourceDocument(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'source-doc-1',
    source_id: 'source-1',
    canonical_url: 'https://example.com/doc',
    content_hash: 'abc123',
    title: 'Test Document',
    extraction_status: 'pending',
    ...overrides,
  };
}

export function createMockCandidateDocument(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'candidate-1',
    source_document_id: 'source-doc-1',
    keyword_score: 50,
    ai_extraction_status: 'pending',
    validation_status: 'pending',
    publication_decision: 'pending',
    ...overrides,
  };
}

export function createMockAiRun(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'ai-run-1',
    candidate_document_id: 'candidate-1',
    pass_number: 1,
    provider: 'noai',
    model: 'none',
    result_status: 'success',
    ...overrides,
  };
}
