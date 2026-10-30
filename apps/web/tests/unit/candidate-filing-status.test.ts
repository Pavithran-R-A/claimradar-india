import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { candidateFilingStatus } from '../../lib/candidate-filing-status';

const now = new Date('2026-10-30T07:00:00.000Z');

describe('candidate editorial deadline presentation', () => {
  it('marks a passed historical validation as expired after its Indian final day', () => {
    expect(candidateFilingStatus({ deadline: '2026-10-20' }, now)).toEqual({
      deadline: '2026-10-20',
      expired: true,
    });
  });

  it('keeps the final Indian local deadline day open', () => {
    expect(candidateFilingStatus({ deadline: '2026-10-30' }, now).expired).toBe(false);
    expect(
      candidateFilingStatus({ deadline: '2026-10-30' }, new Date('2026-10-30T18:31:00Z'))
        .expired,
    ).toBe(true);
  });

  it('distinguishes a future deadline from unknown or malformed evidence', () => {
    expect(candidateFilingStatus({ deadline: '2026-11-13' }, now).expired).toBe(false);
    expect(candidateFilingStatus({ deadline: '2026-02-30' }, now).expired).toBe(true);
    expect(candidateFilingStatus(null, now)).toEqual({ deadline: null, expired: false });
    expect(candidateFilingStatus({ deadline: null }, now)).toEqual({
      deadline: null,
      expired: false,
    });
  });

  it('blocks expired editorial controls and labels both candidate lists', () => {
    const detail = readFileSync(
      new URL('../../app/admin/candidates/[id]/page.tsx', import.meta.url),
      'utf8',
    );
    const reviewQueue = readFileSync(new URL('../../app/admin/reviews/page.tsx', import.meta.url), 'utf8');
    const directory = readFileSync(new URL('../../app/admin/candidates/page.tsx', import.meta.url), 'utf8');
    expect(detail).toContain('Filing deadline expired:');
    expect(detail).toContain('filing.expired ? (');
    expect(detail).toContain('Draft promotion blocked:');
    expect(detail.indexOf('filing.expired ? (')).toBeLessThan(detail.indexOf('label="Approve candidate"'));
    expect(reviewQueue).toContain('Expired:');
    expect(directory).toContain('Expired:');
  });
});
