/**
 * Personalization may change presentation order, never directory membership.
 * Only exact case-insensitive company/sector names contribute to ranking.
 */
export interface ClaimPreference {
  companies: readonly string[];
  sectors: readonly string[];
}

export function sortClaimablesByPreference<T extends {
  companyName: string;
  sector: string;
  publishedAt: string;
}>(items: readonly T[], preferences: ClaimPreference): T[] {
  const companies = new Set(preferences.companies.map((v) => v.trim().toLocaleLowerCase('en-IN')));
  const sectors = new Set(preferences.sectors.map((v) => v.trim().toLocaleLowerCase('en-IN')));
  const rank = (item: T) =>
    (companies.has(item.companyName.trim().toLocaleLowerCase('en-IN')) ? 2 : 0) +
    (sectors.has(item.sector.trim().toLocaleLowerCase('en-IN')) ? 1 : 0);
  return [...items].sort((a, b) =>
    rank(b) - rank(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
