import { describe, expect, it } from 'vitest';
import { officialRecoveryRoutes } from '../../lib/official-recovery-routes';

describe('public official recovery route catalog', () => {
  const routes = officialRecoveryRoutes();

  it('covers ten official recovery routes including the verified DFS gateway', () => {
    expect(routes).toHaveLength(10);
    expect(new Set(routes.map((route) => route.id)).size).toBe(10);
    expect(routes.map((route) => route.id)).toEqual(
      expect.arrayContaining([
        'unclaimed-assets-gateway',
        'bank-deposits',
        'mutual-fund-folios',
        'shares-dividends',
        'insurance',
        'epf',
        'tax-refund',
        'sahara',
        'consumer-dispute',
        'securities-dispute',
      ]),
    );
  });

  it('only links to HTTPS authority domains and explicitly describes how to proceed', () => {
    for (const route of routes) {
      expect(new URL(route.url).protocol).toBe('https:');
      expect(route.description.length).toBeGreaterThan(20);
      expect(route.nextStep.length).toBeGreaterThan(30);
      expect(route.agency.length).toBeGreaterThan(8);
    }
  });

  it('routes forgotten mutual fund folios to the SEBI MITRA platform', () => {
    const mitra = routes.find((route) => route.id === 'mutual-fund-folios');
    expect(mitra?.url).toBe('https://app.mfcentral.com/investor/signin');
    expect(mitra?.agency).toContain('Securities and Exchange Board');
    expect(mitra?.kind).toBe('Search for unclaimed money');
    expect(mitra?.nextStep).toContain('not proof');
  });

  it('keeps IEPF shares and dividends on the authority portal instead of a generic redirect', () => {
    const iepf = routes.find((route) => route.id === 'shares-dividends');
    expect(iepf?.url).toBe('https://www.iepf.gov.in/content/iepf/global/master/Home/Home.html');
    expect(iepf?.nextStep).toContain('MCA Services');
    expect(iepf?.linkLabel).toContain('IEPF Authority');
  });

  it('links the finance ministry gateway without implying compensation or eligibility', () => {
    const gateway = routes.find((route) => route.id === 'unclaimed-assets-gateway');
    expect(gateway?.url).toBe('https://www.unclaimedassetsportal.in/');
    expect(gateway?.kind).toBe('Search for unclaimed money');
    expect(gateway?.nextStep).toContain('not proof of eligibility or payment');
    expect(gateway?.agency).toContain('Department of Financial Services');
  });

  it('distinguishes search portals and complaint mechanisms from actual cash claims', () => {
    const kinds = routes.map((route) => route.kind);
    expect(kinds).toContain('Search for unclaimed money');
    expect(kinds).toContain('Claim or track your money');
    expect(kinds).toContain('Report a dispute');
    expect(routes.find((route) => route.id === 'consumer-dispute')?.nextStep).toContain(
      'does not guarantee compensation',
    );
  });
});
