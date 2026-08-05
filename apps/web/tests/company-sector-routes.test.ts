import { describe, it, expect, afterEach } from 'vitest';
import {
  deriveCompanies,
  deriveSectors,
  deriveStates,
  mapClaimableRow,
  getPublishedClaimables,
  getPublishedCompanyBySlug,
  getPublishedSectorBySlug,
  __setDbClientFactoryForTests,
  __resetDbClientFactoryForTests,
} from '../lib/claimables-repository';
import { makeValidRow, fakeDbClient } from './fixtures';

afterEach(() => {
  __resetDbClientFactoryForTests();
});

function sampleRows() {
  return [
    makeValidRow({
      id: 'a1',
      slug: 'alpha-refund',
      status: 'verified_claimable',
      companies: {
        display_name: 'Alpha Securities Ltd',
        slug: 'alpha-securities',
        sectors: { name: 'Financial Services', slug: 'financial-services' },
      },
      geographic_scope: 'Maharashtra',
    }),
    makeValidRow({
      id: 'a2',
      slug: 'alpha-grievance',
      status: 'official_update',
      companies: {
        display_name: 'Alpha Securities Ltd',
        slug: 'alpha-securities',
        sectors: { name: 'Financial Services', slug: 'financial-services' },
      },
      geographic_scope: 'India',
    }),
    makeValidRow({
      id: 'b1',
      slug: 'beta-bank-refund',
      status: 'potential_claimable',
      companies: {
        display_name: 'Beta Bank',
        slug: 'beta-bank',
        sectors: { name: 'Banking', slug: 'banking' },
      },
      deadline: '2020-01-01T00:00:00.000Z', // past deadline → closed, not active
      geographic_scope: 'Karnataka',
    }),
  ];
}

describe('Company and sector association derivation', () => {
  it('derives companies from published claimables with active counts', () => {
    const items = sampleRows().map((row) => mapClaimableRow(row));
    const companies = deriveCompanies(items);

    const alpha = companies.find((c) => c.slug === 'alpha-securities');
    const beta = companies.find((c) => c.slug === 'beta-bank');
    expect(alpha).toBeDefined();
    expect(alpha?.name).toBe('Alpha Securities Ltd');
    expect(alpha?.sector).toBe('Financial Services');
    expect(alpha?.activeClaimCount).toBe(2);
    expect(beta?.activeClaimCount).toBe(0); // closed deadline records are not active
  });

  it('derives sectors from published claimables', () => {
    const items = sampleRows().map((row) => mapClaimableRow(row));
    const sectors = deriveSectors(items);

    const fin = sectors.find((s) => s.slug === 'financial-services');
    const bank = sectors.find((s) => s.slug === 'banking');
    expect(fin?.name).toBe('Financial Services');
    expect(fin?.activeClaimCount).toBe(2);
    expect(bank?.activeClaimCount).toBe(0);
  });

  it('derives states from geographic scope of published records', () => {
    const items = sampleRows().map((row) => mapClaimableRow(row));
    const states = deriveStates(items);

    const mh = states.find((s) => s.slug === 'maharashtra');
    const ka = states.find((s) => s.slug === 'karnataka');
    expect(mh?.claimCount).toBe(1);
    expect(ka?.claimCount).toBe(1);
    expect(states.find((s) => s.slug === 'goa')).toBeUndefined();
  });
});

describe('Company and sector repository queries (fake DB)', () => {
  it('resolves a company by slug from published records', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedCompanyBySlug('alpha-securities');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.name).toBe('Alpha Securities Ltd');
    }
  });

  it('returns null for non-existent company slug', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedCompanyBySlug('non-existent-co');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });

  it('resolves a sector by slug', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedSectorBySlug('financial-services');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.name).toBe('Financial Services');
    }
  });

  it('returns null for non-existent sector slug', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedSectorBySlug('non-existent-sector');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });

  it('filters published claimables by company slug', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedClaimables({ companySlug: 'alpha-securities', limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items.length).toBe(2);
      expect(result.data.items.every((i) => i.companySlug === 'alpha-securities')).toBe(true);
    }
  });

  it('filters published claimables by sector slug', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: sampleRows(), error: null }));
    const result = await getPublishedClaimables({ sectorSlug: 'financial-services', limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items.length).toBe(2);
      expect(result.data.items.every((i) => i.sectorSlug === 'financial-services')).toBe(true);
    }
  });
});
