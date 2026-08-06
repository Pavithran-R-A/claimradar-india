import { describe, expect, it } from 'vitest';
import { daysUntil, formatDate, isClosingSoon } from '@/app/app/_components/badges';

/**
 * Pure helpers behind the customer dashboard and list pages. These drive
 * deadline messaging, so the deterministic boundary behaviour is pinned
 * here (no clocks mocked — the helpers are relative to Date.now()).
 */

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

describe('formatDate', () => {
  it('renders an em dash for null or invalid input', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formats valid ISO dates with day, month and year', () => {
    const formatted = formatDate('2026-03-05T12:00:00.000Z');
    expect(formatted).toMatch(/2026/);
    expect(formatted).not.toBe('—');
  });
});

describe('daysUntil', () => {
  it('returns null when there is no deadline', () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil('garbage')).toBeNull();
  });

  it('is non-negative for future deadlines and negative for past ones', () => {
    expect(daysUntil(daysFromNow(10))).toBeGreaterThanOrEqual(9);
    expect(daysUntil(daysFromNow(-3))).toBeLessThan(0);
  });
});

describe('isClosingSoon', () => {
  it('flags deadlines inside the default 14-day window', () => {
    expect(isClosingSoon(daysFromNow(0))).toBe(true);
    expect(isClosingSoon(daysFromNow(14))).toBe(true);
  });

  it('does not flag deadlines outside the window or already passed', () => {
    expect(isClosingSoon(daysFromNow(15))).toBe(false);
    expect(isClosingSoon(daysFromNow(60))).toBe(false);
    expect(isClosingSoon(daysFromNow(-1))).toBe(false);
    expect(isClosingSoon(null)).toBe(false);
  });

  it('respects a custom window', () => {
    expect(isClosingSoon(daysFromNow(5), 3)).toBe(false);
    expect(isClosingSoon(daysFromNow(2), 3)).toBe(true);
  });
});
