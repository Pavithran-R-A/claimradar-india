/**
 * Single source of truth for claim deadline calculations across ClaimRadar India.
 *
 * Used by crawler, web app, repositories, inventory scripts, and admin interfaces.
 * Standardizes calendar-day arithmetic in Asia/Kolkata timezone with support for injectable clocks.
 */

export type DeadlineStatus = 'CURRENT' | 'CLOSING_TODAY' | 'EXPIRED' | 'UNKNOWN';

export interface DeadlineCalculationOptions {
  /** Injectable clock date for deterministic testing. Defaults to new Date(). */
  clockDate?: Date | string;
  /** Authoritative timezone. Defaults to 'Asia/Kolkata'. */
  timezone?: string;
}

export interface DeadlineCalculationResult {
  status: DeadlineStatus;
  deadlineDate: string | null; // Formatted YYYY-MM-DD
  today: string; // Formatted YYYY-MM-DD
  daysRemaining: number | null;
  timezone: string;
  isClosingSoon: boolean;
}

export const DEFAULT_DEADLINE_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a Date object into YYYY-MM-DD in the specified timezone.
 */
function formatDateInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Parses various deadline string formats (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO, or Date instances) into YYYY-MM-DD.
 * Returns null for missing, null, undefined, empty, or unparseable input.
 */
export function parseDeadlineDate(raw: string | Date | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;

  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return null;
    return raw.toISOString().slice(0, 10);
  }

  if (typeof raw !== 'string') return null;

  const str = raw.trim();
  if (
    !str ||
    str.toUpperCase() === 'UNKNOWN' ||
    str.toUpperCase() === 'NOT_STATED' ||
    str.toUpperCase() === 'N/A' ||
    str.toUpperCase() === 'NULL' ||
    str.toUpperCase() === 'UNDEFINED'
  ) {
    return null;
  }

  // 1. DD-MM-YYYY or DD/MM/YYYY (common Indian date format)
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    // Validate reasonable range
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return `${year}-${month}-${day}`;
  }

  // 2. YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch && ymdMatch[1] && ymdMatch[2] && ymdMatch[3]) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return `${year}-${month}-${day}`;
  }

  // 3. Date string like "12 Aug, 2026" or ISO
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    // Only return if year is reasonable
    const iso = parsed.toISOString().slice(0, 10);
    const year = parseInt(iso.slice(0, 4), 10);
    if (year >= 1900 && year <= 2200) {
      return iso;
    }
  }

  return null;
}

/**
 * Calculates deadline status against a reference clock date and timezone.
 *
 * Semantics:
 * - deadline < today: EXPIRED (isClosingSoon = false)
 * - deadline == today: CLOSING_TODAY (isClosingSoon = true)
 * - deadline > today and daysRemaining <= 7: CURRENT (isClosingSoon = true)
 * - deadline > today and daysRemaining > 7: CURRENT (isClosingSoon = false)
 * - missing or unparseable: UNKNOWN (deadlineDate = null, daysRemaining = null, isClosingSoon = false)
 */
export function calculateDeadlineStatus(
  deadlineInput: string | Date | null | undefined,
  options: DeadlineCalculationOptions = {},
): DeadlineCalculationResult {
  const timezone = options.timezone ?? DEFAULT_DEADLINE_TIMEZONE;
  const clock = options.clockDate
    ? typeof options.clockDate === 'string'
      ? new Date(options.clockDate)
      : options.clockDate
    : new Date();

  const todayStr = formatDateInTimezone(clock, timezone);
  const deadlineStr = parseDeadlineDate(deadlineInput);

  if (!deadlineStr) {
    return {
      status: 'UNKNOWN',
      deadlineDate: null,
      today: todayStr,
      daysRemaining: null,
      timezone,
      isClosingSoon: false,
    };
  }

  // Calculate calendar day difference using UTC day boundaries of the YYYY-MM-DD strings
  const todayUtc = Date.UTC(
    parseInt(todayStr.slice(0, 4), 10),
    parseInt(todayStr.slice(5, 7), 10) - 1,
    parseInt(todayStr.slice(8, 10), 10),
  );
  const deadlineUtc = Date.UTC(
    parseInt(deadlineStr.slice(0, 4), 10),
    parseInt(deadlineStr.slice(5, 7), 10) - 1,
    parseInt(deadlineStr.slice(8, 10), 10),
  );

  const diffMs = deadlineUtc - todayUtc;
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let status: DeadlineStatus;
  let isClosingSoon = false;

  if (daysRemaining < 0) {
    status = 'EXPIRED';
    isClosingSoon = false;
  } else if (daysRemaining === 0) {
    status = 'CLOSING_TODAY';
    isClosingSoon = true;
  } else {
    status = 'CURRENT';
    // Closing soon is defined as closing today OR closing in 1 to 7 days inclusive
    isClosingSoon = daysRemaining <= 7;
  }

  return {
    status,
    deadlineDate: deadlineStr,
    today: todayStr,
    daysRemaining,
    timezone,
    isClosingSoon,
  };
}

/**
 * Returns whether a deadline qualifies for the /closing-soon listing.
 * Exactly true when status is CLOSING_TODAY or (CURRENT and daysRemaining between 1 and 7).
 */
export function isClosingSoon(
  deadlineInput: string | Date | null | undefined,
  options: DeadlineCalculationOptions = {},
): boolean {
  const result = calculateDeadlineStatus(deadlineInput, options);
  return result.isClosingSoon;
}

/**
 * Derives a human-friendly phrase for deadline status.
 */
export function formatDeadlinePhrase(
  deadlineInput: string | Date | null | undefined,
  options: DeadlineCalculationOptions = {},
): string {
  const result = calculateDeadlineStatus(deadlineInput, options);
  switch (result.status) {
    case 'EXPIRED':
      return result.daysRemaining !== null && result.daysRemaining === -1
        ? 'Closed yesterday'
        : `Closed ${Math.abs(result.daysRemaining ?? 0)} days ago`;
    case 'CLOSING_TODAY':
      return 'Closing today';
    case 'CURRENT':
      if (result.daysRemaining === 1) return 'Closes tomorrow';
      if (result.daysRemaining !== null && result.daysRemaining <= 7)
        return `Closes in ${result.daysRemaining} days`;
      return `Deadline: ${result.deadlineDate}`;
    case 'UNKNOWN':
    default:
      return 'No deadline stated';
  }
}
