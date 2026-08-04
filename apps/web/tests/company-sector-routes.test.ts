import { describe, it, expect } from 'vitest';
import {
  getPublishedCompanyBySlug,
  getPublishedSectorBySlug,
  getPublishedClaimables,
} from '../lib/claimables-repository.js';

describe('Company and Sector Detail Route Tests', () => {
  it('should resolve company by slug and include neutral disclosure', async () => {
    const company = await getPublishedCompanyBySlug('abc-securities');
    expect(company).not.toBeNull();
    expect(company?.name).toBe('ABC Securities Ltd');
    expect(company?.sector).toBe('Financial Services');
  });

  it('should return null for non-existent company slug', async () => {
    const company = await getPublishedCompanyBySlug('non-existent-co');
    expect(company).toBeNull();
  });

  it('should resolve sector by slug', async () => {
    const sector = await getPublishedSectorBySlug('financial-services');
    expect(sector).not.toBeNull();
    expect(sector?.name).toBe('Financial Services');
  });

  it('should return null for non-existent sector slug', async () => {
    const sector = await getPublishedSectorBySlug('non-existent-sector');
    expect(sector).toBeNull();
  });

  it('should filter published claimables by company slug', async () => {
    const { items } = await getPublishedClaimables({ companySlug: 'abc-securities' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.companySlug === 'abc-securities')).toBe(true);
  });

  it('should filter published claimables by sector slug', async () => {
    const { items } = await getPublishedClaimables({ sectorSlug: 'financial-services' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.sectorSlug === 'financial-services')).toBe(true);
  });
});
