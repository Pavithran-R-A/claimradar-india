import { describe, it, expect } from 'vitest';
import {
  deriveDisplayStatus,
  applyClaimableFilters,
  type PublishedClaimable,
} from '../../lib/claimables-repository';
import { daysUntil, deadlinePhrase, formatIstDate } from '../../lib/dates';
import { calculateDeadlineStatus } from '@claimradar/shared-types';

describe('Web Deadlines & Display Status Integration (Asia/Kolkata)', () => {
  const referenceClock = new Date('2026-08-15T10:00:00+05:30');

  const baseClaim: PublishedClaimable = {
    id: 'test-claim-1',
    slug: 'test-claim-1',
    title: 'Test Claimable Opportunity',
    companyName: 'Test Debtor Corp',
    companySlug: 'test-debtor-corp',
    sector: 'Financial Services',
    sectorSlug: 'financial-services',
    status: 'open',
    statusDetail: 'Verified claimable',
    statusExplanation: 'Test explanation',
    affectedGroup: 'General public claimants',
    reliefAmount: '₹50,000',
    actionRoute: 'Submit Form B to IRP',
    officialRouteUrl: 'https://ibbi.gov.in/claims',
    deadlineDate: '2026-08-20',
    proofRequirements: ['Proof of claim'],
    officialSources: [],
    evidenceSummary: 'Evidence',
    lastCheckedAt: '2026-08-15T00:00:00Z',
    lastVerifiedAt: '2026-08-15T00:00:00Z',
    publishedAt: '2026-08-15T00:00:00Z',
  };

  it('correctly maps display status when deadline is past (EXPIRED)', () => {
    const calc = calculateDeadlineStatus('2026-08-10', { clockDate: referenceClock });
    expect(calc.status).toBe('EXPIRED');
    const status = deriveDisplayStatus({
      claimStatus: 'open',
      deadline: '2026-08-10',
      now: referenceClock,
    });
    expect(status).toBe('closed');
  });

  it('correctly maps display status when deadline is today (CLOSING_TODAY)', () => {
    const status = deriveDisplayStatus({
      claimStatus: 'open',
      deadline: '2026-08-15',
      now: referenceClock,
    });
    expect(status).toBe('closing_soon');
  });

  it('correctly maps display status when deadline is in 5 days (CURRENT, closing soon)', () => {
    const status = deriveDisplayStatus({
      claimStatus: 'open',
      deadline: '2026-08-20',
      now: referenceClock,
    });
    expect(status).toBe('closing_soon');
  });

  it('correctly maps display status when deadline is in 15 days (CURRENT, open)', () => {
    const status = deriveDisplayStatus({
      claimStatus: 'open',
      deadline: '2026-08-30',
      now: referenceClock,
    });
    expect(status).toBe('open');
  });

  it('correctly maps display status when deadline is missing/null (UNKNOWN, open/under_review)', () => {
    const status = deriveDisplayStatus({
      claimStatus: 'open',
      deadline: null,
      now: referenceClock,
    });
    expect(status).toBe('open');
  });

  it('filters /closing-soon strictly according to canonical 7-day rule', () => {
    const items: PublishedClaimable[] = [
      { ...baseClaim, id: '1', deadlineDate: '2026-08-14', status: 'closed' }, // past
      { ...baseClaim, id: '2', deadlineDate: '2026-08-15', status: 'closing_soon' }, // today
      { ...baseClaim, id: '3', deadlineDate: '2026-08-16', status: 'closing_soon' }, // +1 day
      { ...baseClaim, id: '4', deadlineDate: '2026-08-22', status: 'closing_soon' }, // +7 days
      { ...baseClaim, id: '5', deadlineDate: '2026-08-23', status: 'open' }, // +8 days
      { ...baseClaim, id: '6', deadlineDate: undefined, status: 'open' }, // missing
    ];

    const closingSoon = applyClaimableFilters(items, { closingSoonOnly: true }, referenceClock);
    const ids = closingSoon.map((c) => c.id);
    expect(ids).toEqual(['2', '3', '4']);
    expect(ids).not.toContain('1'); // expired excluded
    expect(ids).not.toContain('5'); // +8 days excluded
    expect(ids).not.toContain('6'); // missing excluded
  });

  it('dates.ts helpers format correctly with canonical calculations', () => {
    expect(daysUntil('2026-08-15', referenceClock)).toBe(0);
    expect(daysUntil('2026-08-16', referenceClock)).toBe(1);
    expect(daysUntil('2026-08-14', referenceClock)).toBe(-1);
    expect(daysUntil(null, referenceClock)).toBeNull();

    expect(deadlinePhrase('2026-08-15', referenceClock)).toBe('Closes today');
    expect(deadlinePhrase('2026-08-16', referenceClock)).toBe('Closes tomorrow');
    expect(deadlinePhrase('2026-08-14', referenceClock)).toBe('Deadline passed');
    expect(deadlinePhrase(null, referenceClock)).toBeNull();

    expect(formatIstDate('2026-08-15')).toBe('15 Aug 2026');
  });
});
