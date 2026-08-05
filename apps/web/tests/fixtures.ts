import type { ClaimableRow, DbClient, DbQueryBuilder } from '../lib/claimables-repository';

export interface DbQueryOutcome {
  data: unknown;
  error: { message: string } | null;
}

export function makeValidRow(overrides: Partial<ClaimableRow> = {}): ClaimableRow {
  return {
    id: 'row-1',
    slug: 'test-refund-2026',
    public_title: 'Test Refund Scheme 2026',
    summary: 'A test summary describing the scheme.',
    status: 'verified_claimable',
    authority: 'Test Authority',
    jurisdiction: null,
    affected_group: 'Test affected group',
    geographic_scope: null,
    relief_description: 'Test relief',
    official_amount: null,
    amount_currency: 'INR',
    proof_requirements: ['Proof A'],
    action_required: 'File on the test portal',
    official_claim_url: 'https://example.com/test-portal',
    deadline: null,
    first_published_at: '2026-07-20T00:00:00.000Z',
    last_verified_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
    companies: {
      display_name: 'Test Company Ltd',
      slug: 'test-company',
      sectors: { name: 'Test Sector', slug: 'test-sector' },
    },
    claim_sources: [
      {
        source_documents: {
          canonical_url: 'https://example.com/test-order.pdf',
          title: 'Test Order',
          published_at: '2026-07-15T00:00:00.000Z',
        },
      },
    ],
    ...overrides,
  };
}

export function fakeDbClient(outcome: DbQueryOutcome): DbClient {
  const builder: DbQueryBuilder = {
    eq: () => builder,
    in: () => builder,
    then: (onfulfilled, onrejected) => Promise.resolve(outcome).then(onfulfilled, onrejected),
  };
  return { from: () => ({ select: () => builder }) };
}

/** Client whose query throws (simulates an unreachable database). */
export function throwingDbClient(): DbClient {
  return {
    from: () => ({
      select: () => {
        throw new Error('fetch failed');
      },
    }),
  };
}
