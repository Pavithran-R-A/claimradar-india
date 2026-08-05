/**
 * Entitlement limits. Billing is disabled (NEXT_PUBLIC_ENABLE_BILLING=false),
 * so every account currently operates on the free tier. These limits are
 * enforced server-side in the watchlist/tracker actions.
 */

export const FREE_TIER = 'free' as const;

export const FREE_TIER_LIMITS = {
  companyWatchlist: 5,
  sectorWatchlist: 3,
  trackers: 10,
} as const;

export type FreeTierLimitKey = keyof typeof FREE_TIER_LIMITS;

export function isOverLimit(key: FreeTierLimitKey, currentCount: number): boolean {
  return currentCount >= FREE_TIER_LIMITS[key];
}
