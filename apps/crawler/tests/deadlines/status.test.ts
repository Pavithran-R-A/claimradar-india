import { describe, it, expect } from 'vitest';
import {
  calculateDeadlineStatus,
  parseDeadlineDate,
  isClosingSoon,
  formatDeadlinePhrase,
} from '../../src/deadlines/status.js';

describe('Production Deadline Status Calculation (Asia/Kolkata)', () => {
  const referenceClock = new Date('2026-08-15T10:00:00+05:30'); // Reference: 15 Aug 2026

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
      expect(parseDeadlineDate('UNKNOWN / NOT_STATED')).toBeNull();
    });
  });

  describe('calculateDeadlineStatus & isClosingSoon cross-layer cases', () => {
    it('DEADLINE_YESTERDAY: yesterday is EXPIRED and excluded from closing-soon', () => {
      const result = calculateDeadlineStatus('2026-08-14', { clockDate: referenceClock });
      expect(result.status).toBe('EXPIRED');
      expect(result.daysRemaining).toBe(-1);
      expect(result.isClosingSoon).toBe(false);
      expect(isClosingSoon('2026-08-14', { clockDate: referenceClock })).toBe(false);
      expect(formatDeadlinePhrase('2026-08-14', { clockDate: referenceClock })).toBe(
        'Closed yesterday',
      );
    });

    it('DEADLINE_TODAY: today is CLOSING_TODAY and included in closing-soon', () => {
      const result = calculateDeadlineStatus('2026-08-15', { clockDate: referenceClock });
      expect(result.status).toBe('CLOSING_TODAY');
      expect(result.daysRemaining).toBe(0);
      expect(result.isClosingSoon).toBe(true);
      expect(isClosingSoon('2026-08-15', { clockDate: referenceClock })).toBe(true);
      expect(formatDeadlinePhrase('2026-08-15', { clockDate: referenceClock })).toBe(
        'Closing today',
      );
    });

    it('DEADLINE_PLUS_1: +1 day is CURRENT and included in closing-soon', () => {
      const result = calculateDeadlineStatus('2026-08-16', { clockDate: referenceClock });
      expect(result.status).toBe('CURRENT');
      expect(result.daysRemaining).toBe(1);
      expect(result.isClosingSoon).toBe(true);
      expect(isClosingSoon('2026-08-16', { clockDate: referenceClock })).toBe(true);
      expect(formatDeadlinePhrase('2026-08-16', { clockDate: referenceClock })).toBe(
        'Closes tomorrow',
      );
    });

    it('DEADLINE_PLUS_7: +7 days is CURRENT and included in closing-soon', () => {
      const result = calculateDeadlineStatus('2026-08-22', { clockDate: referenceClock });
      expect(result.status).toBe('CURRENT');
      expect(result.daysRemaining).toBe(7);
      expect(result.isClosingSoon).toBe(true);
      expect(isClosingSoon('2026-08-22', { clockDate: referenceClock })).toBe(true);
      expect(formatDeadlinePhrase('2026-08-22', { clockDate: referenceClock })).toBe(
        'Closes in 7 days',
      );
    });

    it('DEADLINE_PLUS_8: +8 days is CURRENT and excluded from closing-soon', () => {
      const result = calculateDeadlineStatus('2026-08-23', { clockDate: referenceClock });
      expect(result.status).toBe('CURRENT');
      expect(result.daysRemaining).toBe(8);
      expect(result.isClosingSoon).toBe(false);
      expect(isClosingSoon('2026-08-23', { clockDate: referenceClock })).toBe(false);
      expect(formatDeadlinePhrase('2026-08-23', { clockDate: referenceClock })).toBe(
        'Deadline: 2026-08-23',
      );
    });

    it('DEADLINE_MISSING: missing/null deadline is UNKNOWN and excluded from closing-soon', () => {
      const result = calculateDeadlineStatus(null, { clockDate: referenceClock });
      expect(result.status).toBe('UNKNOWN');
      expect(result.daysRemaining).toBeNull();
      expect(result.deadlineDate).toBeNull();
      expect(result.isClosingSoon).toBe(false);
      expect(isClosingSoon(null, { clockDate: referenceClock })).toBe(false);
      expect(formatDeadlinePhrase(null, { clockDate: referenceClock })).toBe('No deadline stated');
    });

    it('DEADLINE_MALFORMED: malformed string is UNKNOWN and excluded from closing-soon', () => {
      const result = calculateDeadlineStatus('not-a-valid-date-xyz', {
        clockDate: referenceClock,
      });
      expect(result.status).toBe('UNKNOWN');
      expect(result.daysRemaining).toBeNull();
      expect(result.deadlineDate).toBeNull();
      expect(result.isClosingSoon).toBe(false);
      expect(isClosingSoon('not-a-valid-date-xyz', { clockDate: referenceClock })).toBe(false);
    });

    it('DEADLINE_IST_BOUNDARY_TEST: enforces Asia/Kolkata calendar day rollover at 18:30 UTC', () => {
      // 2026-08-15 18:29:59 UTC = 2026-08-15 23:59:59 IST -> today is 2026-08-15
      const clockJustBeforeMidnight = new Date('2026-08-15T18:29:59.000Z');
      const resBefore = calculateDeadlineStatus('2026-08-16', {
        clockDate: clockJustBeforeMidnight,
        timezone: 'Asia/Kolkata',
      });
      expect(resBefore.today).toBe('2026-08-15');
      expect(resBefore.status).toBe('CURRENT');
      expect(resBefore.daysRemaining).toBe(1);

      // 2026-08-15 18:30:00 UTC = 2026-08-16 00:00:00 IST -> today is 2026-08-16
      const clockJustAfterMidnight = new Date('2026-08-15T18:30:00.000Z');
      const resAfter = calculateDeadlineStatus('2026-08-16', {
        clockDate: clockJustAfterMidnight,
        timezone: 'Asia/Kolkata',
      });
      expect(resAfter.today).toBe('2026-08-16');
      expect(resAfter.status).toBe('CLOSING_TODAY');
      expect(resAfter.daysRemaining).toBe(0);
      expect(resAfter.isClosingSoon).toBe(true);
    });
  });
});
