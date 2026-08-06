import { describe, expect, it } from 'vitest';
import {
  buildDedupKey,
  buildUnsubscribeUrl,
  createUnsubscribeToken,
  dayBucket,
  DEFAULT_FREQUENCY_LIMITS,
  getFrequencyLimit,
  isProductionEmailAllowed,
  isWithinQuietHours,
  MAX_SUBJECT_LENGTH,
  sanitizeSubject,
  startOfUtcDay,
  verifyUnsubscribeToken,
  weekBucket,
} from '@/lib/notifications/safety';

describe('sanitizeSubject', () => {
  it('removes email addresses from subjects', () => {
    expect(sanitizeSubject('Refund update for priya@example.com')).toBe('Refund update for');
  });

  it('removes phone numbers', () => {
    expect(sanitizeSubject('Agent will call you on +91 98765 43210 today')).toBe(
      'Agent will call you on today',
    );
  });

  it('removes long digit runs (Aadhaar / account / reference numbers)', () => {
    expect(sanitizeSubject('Case 12345678 has been updated')).toBe('Case has been updated');
    expect(sanitizeSubject('Aadhaar 1234 5678 9012 verified')).toBe('Aadhaar verified');
  });

  it('keeps short non-sensitive numbers', () => {
    expect(sanitizeSubject('Deadline in 3 days')).toBe('Deadline in 3 days');
  });

  it('collapses whitespace left behind by redaction', () => {
    expect(sanitizeSubject('Update   for  +91-9876543210  now')).toBe('Update for now');
  });

  it('truncates subjects longer than the limit', () => {
    const long = 'A'.repeat(MAX_SUBJECT_LENGTH + 40);
    const sanitized = sanitizeSubject(long);
    expect(sanitized.length).toBeLessThanOrEqual(MAX_SUBJECT_LENGTH);
    expect(sanitized.endsWith('…')).toBe(true);
  });
});

describe('isWithinQuietHours', () => {
  function at(hours: number, minutes: number): Date {
    return new Date(2026, 7, 5, hours, minutes, 0);
  }

  it('returns false when quiet hours are not configured', () => {
    expect(isWithinQuietHours({ quietHoursStart: null, quietHoursEnd: null }, at(3, 0))).toBe(
      false,
    );
  });

  it('suppresses inside a same-day window', () => {
    const prefs = { quietHoursStart: '09:00', quietHoursEnd: '17:00' };
    expect(isWithinQuietHours(prefs, at(12, 0))).toBe(true);
    expect(isWithinQuietHours(prefs, at(8, 59))).toBe(false);
    expect(isWithinQuietHours(prefs, at(17, 0))).toBe(false);
  });

  it('handles overnight windows crossing midnight', () => {
    const prefs = { quietHoursStart: '22:00', quietHoursEnd: '07:00' };
    expect(isWithinQuietHours(prefs, at(23, 30))).toBe(true);
    expect(isWithinQuietHours(prefs, at(6, 59))).toBe(true);
    expect(isWithinQuietHours(prefs, at(7, 0))).toBe(false);
    expect(isWithinQuietHours(prefs, at(12, 0))).toBe(false);
  });

  it('treats malformed values as no quiet hours', () => {
    expect(
      isWithinQuietHours({ quietHoursStart: 'not-a-time', quietHoursEnd: '07:00' }, at(3, 0)),
    ).toBe(false);
    expect(isWithinQuietHours({ quietHoursStart: '25:00', quietHoursEnd: '07:00' }, at(3, 0))).toBe(
      false,
    );
  });
});

describe('frequency limits', () => {
  it('covers every notification type', () => {
    expect(Object.keys(DEFAULT_FREQUENCY_LIMITS).sort()).toEqual(
      [
        'closing_soon_reminder',
        'correction_notice',
        'deadline_reminder',
        'new_match',
        'source_change_update',
        'status_change',
        'weekly_digest',
      ].sort(),
    );
  });

  it('caps the weekly digest at one per day', () => {
    expect(DEFAULT_FREQUENCY_LIMITS.weekly_digest).toBe(1);
  });

  it('allows per-type overrides', () => {
    expect(getFrequencyLimit('new_match', { new_match: 1 })).toBe(1);
    expect(getFrequencyLimit('status_change')).toBe(DEFAULT_FREQUENCY_LIMITS.status_change);
  });
});

describe('dedup key helpers', () => {
  it('builds stable colon-separated keys', () => {
    expect(buildDedupKey(['new_match', 'user-1', 'claimable-9', '2026-08-06'])).toBe(
      'new_match:user-1:claimable-9:2026-08-06',
    );
  });

  it('trims parts so key construction is deterministic', () => {
    expect(buildDedupKey([' new_match ', 'user-1'])).toBe('new_match:user-1');
  });

  it('buckets days in UTC', () => {
    expect(dayBucket(new Date('2026-08-06T23:59:59Z'))).toBe('2026-08-06');
    expect(dayBucket(new Date('2026-08-07T00:00:00Z'))).toBe('2026-08-07');
  });

  it('buckets ISO weeks deterministically', () => {
    expect(weekBucket(new Date('2026-08-06T12:00:00Z'))).toBe('2026-W32');
    // Same instant in any timezone yields the same bucket.
    expect(weekBucket(new Date('2026-08-06T23:30:00+05:30'))).toBe(
      weekBucket(new Date('2026-08-06T23:30:00+05:30')),
    );
  });

  it('computes the start of the UTC day', () => {
    expect(startOfUtcDay(new Date('2026-08-06T14:32:00Z')).toISOString()).toBe(
      '2026-08-06T00:00:00.000Z',
    );
  });
});

describe('APP_ENV gating', () => {
  it('only permits real email in production', () => {
    expect(isProductionEmailAllowed('production')).toBe(true);
    expect(isProductionEmailAllowed('staging')).toBe(false);
    expect(isProductionEmailAllowed('development')).toBe(false);
    expect(isProductionEmailAllowed(undefined)).toBe(false);
    expect(isProductionEmailAllowed('PRODUCTION')).toBe(false);
  });
});

describe('unsubscribe tokens', () => {
  const secret = 'test-unsubscribe-secret';

  it('verifies a token created for the same user', () => {
    const token = createUnsubscribeToken('user-1', secret);
    expect(verifyUnsubscribeToken('user-1', token, secret)).toBe(true);
  });

  it('rejects tokens for a different user', () => {
    const token = createUnsubscribeToken('user-1', secret);
    expect(verifyUnsubscribeToken('user-2', token, secret)).toBe(false);
  });

  it('rejects tokens created with a different secret', () => {
    const token = createUnsubscribeToken('user-1', secret);
    expect(verifyUnsubscribeToken('user-1', token, 'other-secret')).toBe(false);
  });

  it('rejects empty inputs', () => {
    expect(verifyUnsubscribeToken('', 'abc', secret)).toBe(false);
    expect(verifyUnsubscribeToken('user-1', '', secret)).toBe(false);
    expect(verifyUnsubscribeToken('user-1', 'abc', '')).toBe(false);
  });

  it('builds absolute unsubscribe URLs from the site URL', () => {
    const url = buildUnsubscribeUrl('https://claimradar.in/', 'user-1', 'tok');
    expect(url).toBe('https://claimradar.in/app/settings/unsubscribe?uid=user-1&token=tok');
  });
});
