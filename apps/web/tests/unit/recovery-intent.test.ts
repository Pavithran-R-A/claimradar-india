import { describe, expect, it } from 'vitest';
import { RECOVERY_INTENT_CHOICES, routesForIntent } from '../../lib/recovery-intent';

describe('private and deterministic official recovery route guidance', () => {
  it('shows all eight available authority routes when no choice has been made', () => {
    expect(routesForIntent('all')).toHaveLength(8);
    expect(RECOVERY_INTENT_CHOICES).toHaveLength(4);
  });

  it('recommends forgotten assets without pretending users qualify for payouts', () => {
    expect(routesForIntent('forgotten').map((route) => route.id)).toEqual([
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
});
