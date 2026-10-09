import { describe, expect, it } from 'vitest';
import { sortClaimablesByPreference } from '@/lib/claimable-preferences';

const items = [
  { companyName: 'Other', sector: 'Retail', publishedAt: '2026-10-09T00:00:00Z' },
  { companyName: 'SBI', sector: 'Banking', publishedAt: '2026-10-07T00:00:00Z' },
  { companyName: 'Airtel', sector: 'Telecom', publishedAt: '2026-10-08T00:00:00Z' },
];

describe('personalized public directory ordering', () => {
  it('prioritizes preferred companies and sectors without hiding any published record', () => {
    const ordered = sortClaimablesByPreference(items, {
      companies: ['airtel'],
      sectors: ['banking'],
    });
    expect(ordered).toHaveLength(items.length);
    expect(ordered.map((x) => x.companyName)).toEqual(['Airtel', 'SBI', 'Other']);
    expect(ordered).toEqual(expect.arrayContaining(items));
    expect(items[0]?.companyName).toBe('Other');
  });

  it('leaves unaffiliated users with recency ordering', () => {
    const ordered = sortClaimablesByPreference(items, { companies: [], sectors: [] });
    expect(ordered.map((x) => x.companyName)).toEqual(['Other', 'Airtel', 'SBI']);
  });
});
