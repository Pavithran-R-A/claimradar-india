/**
 * Personalization changes presentation order only, never directory membership.
 */
export interface ClaimPreference {
  companies: readonly string[];
  sectors: readonly string[];
}

interface RankedClaim {
  companyName: string;
  sector: string;
  publishedAt: string;
}

export function sortClaimablesByPreference<T extends RankedClaim>(
  items: readonly T[],
  preferences: ClaimPreference,
): T[] {
  const normalize = (value: string) => value.trim().toLowerCase();
  const companies = new Set(preferences.companies.map(normalize));
  const sectors = new Set(preferences.sectors.map(normalize));
  const rank = (item: T): number =>
    Number(companies.has(normalize(item.companyName))) * 2 +
    Number(sectors.has(normalize(item.sector)));
  return [...items].sort((a, b) => {
    const priority = rank(b) - rank(a);
    if (priority !== 0) return priority;
    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });
}
