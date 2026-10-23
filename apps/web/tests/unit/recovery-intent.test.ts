import { describe, expect, it } from 'vitest';
import {
  RECOVERY_INTENT_CHOICES,
  matchingRoutesForSearch,
  routesForIntent,
} from '../../lib/recovery-intent';

describe('private and deterministic official recovery route guidance', () => {
  it('shows all nine available authority routes when no choice has been made', () => {
    expect(routesForIntent('all')).toHaveLength(9);
    expect(RECOVERY_INTENT_CHOICES).toHaveLength(4);
  });

  it('recommends forgotten assets without pretending users qualify for payouts', () => {
    expect(routesForIntent('forgotten').map((route) => route.id)).toEqual([
      'unclaimed-assets-gateway',
      'bank-deposits',
      'shares-dividends',
      'insurance',
      'epf',
    ]);
  });

  it('keeps complaints distinct from existing money and tracked claims', () => {
    expect(routesForIntent('dispute').map((route) => route.id)).toEqual([
      'consumer-dispute',
      'securities-dispute',
    ]);
    expect(routesForIntent('follow-up').map((route) => route.id)).toEqual([
      'shares-dividends',
      'epf',
      'tax-refund',
      'sahara',
    ]);
  });

  it('returns official HTTPS routes, without collecting personal details', () => {
    for (const choice of RECOVERY_INTENT_CHOICES) {
      const routes = routesForIntent(choice.id);
      expect(routes.length).toBeGreaterThan(0);
      for (const route of routes) {
        expect(route.url.startsWith('https://')).toBe(true);
        expect(route.linkLabel.length).toBeGreaterThan(5);
      }
    }
  });

  it('matches homepage searches to relevant government recovery routes', () => {
    expect(matchingRoutesForSearch('all', 'financial assets portal').map((route) => route.id)).toContain(
      'unclaimed-assets-gateway',
    );
    expect(matchingRoutesForSearch('all', 'RBI').map((route) => route.id)).toEqual([
      'bank-deposits',
    ]);
    expect(matchingRoutesForSearch('all', 'SEBI recovery').map((route) => route.id)).toEqual([
      'securities-dispute',
    ]);
    expect(matchingRoutesForSearch('all', 'EPFO account').map((route) => route.id)).toContain(
      'epf',
    );
    expect(matchingRoutesForSearch('all', 'telecom refund').map((route) => route.id)).toContain(
      'consumer-dispute',
    );
  });

  it('preserves customer-selected intent filtering when searching', () => {
    expect(matchingRoutesForSearch('dispute', 'RBI')).toHaveLength(0);
    expect(matchingRoutesForSearch('dispute', 'SEBI').map((route) => route.id)).toEqual([
      'securities-dispute',
    ]);
  });

  it('does not invent matching official routes when nothing matches', () => {
    expect(matchingRoutesForSearch('all', 'qzxv blorf nonword')).toHaveLength(0);
    expect(matchingRoutesForSearch('all', '')).toHaveLength(9);
    expect(matchingRoutesForSearch('all', 'claims')).toHaveLength(9);
  });
});
