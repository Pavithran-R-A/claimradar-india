import { describe, it, expect } from 'vitest';
import { calculateDeadlineStatus, parseDeadlineDate } from '../../src/deadlines/status.js';

describe('Production Deadline Status Calculation (Asia/Kolkata)', () => {
  const referenceClock = new Date('2026-08-15T10:00:00+05:30');

  describe('parseDeadlineDate', () => {
    it('parses DD-MM-YYYY format', () => {
      expect(parseDeadlineDate('21-08-2026')).toBe('2026-08-21');
      expect(parseDeadlineDate('07-09-2026')).toBe('2026-09-07');
    });

    it('parses YYYY-MM-DD format', () => {
      expect(parseDeadlineDate('2026-08-21')).toBe('2026-08-21');
    });

    it('returns null for missing, null, or unknown values', () => {
      expect(parseDeadlineDate(null)).toBeNull();
      expect(parseDeadlineDate(undefined)).toBeNull();
      expect(parseDeadlineDate('UNKNOWN')).toBeNull();
      expect(parseDeadlineDate('NOT_STATED')).toBeNull();
      expect(parseDeadlineDate('N/A')).toBeNull();
    });
  });

  describe('calculateDeadlineStatus', () => {
    it('DEADLINE_TEST_CURRENT: correctly calculates future deadline as CURRENT', () => {
      const result = calculateDeadlineStatus('26-08-2026', { clockDate: referenceClock });
      expect(result.status).toBe('CURRENT');
      expect(result.daysRemaining).toBe(11);
      expect(result.deadlineDate).toBe('2026-08-26');
      expect(result.today).toBe('2026-08-15');
      expect(result.timezone).toBe('Asia/Kolkata');
    });

    it('DEADLINE_TEST_CLOSING_TODAY: correctly calculates today deadline as CLOSING_TODAY', () => {
      const result = calculateDeadlineStatus('15-08-2026', { clockDate: referenceClock });
      expect(result.status).toBe('CLOSING_TODAY');
      expect(result.daysRemaining).toBe(0);
      expect(result.deadlineDate).toBe('2026-08-15');
      expect(result.today).toBe('2026-08-15');
    });

    it('DEADLINE_TEST_EXPIRED: correctly calculates past deadline as EXPIRED', () => {
      const result = calculateDeadlineStatus('10-08-2026', { clockDate: referenceClock });
      expect(result.status).toBe('EXPIRED');
      expect(result.daysRemaining).toBe(-5);
      expect(result.deadlineDate).toBe('2026-08-10');
      expect(result.today).toBe('2026-08-15');
    });

    it('DEADLINE_TEST_UNKNOWN: correctly handles missing or unparseable deadline', () => {
      const result = calculateDeadlineStatus('NOT_STATED', { clockDate: referenceClock });
      expect(result.status).toBe('UNKNOWN');
      expect(result.daysRemaining).toBeNull();
      expect(result.deadlineDate).toBeNull();
      expect(result.today).toBe('2026-08-15');
    });

    it('works with Date objects and ISO string clock dates', () => {
      const result = calculateDeadlineStatus(new Date('2026-08-20'), {
        clockDate: '2026-08-15T00:00:00Z',
      });
      expect(result.status).toBe('CURRENT');
      expect(result.daysRemaining).toBe(5);
    });
  });
});
