/**
 * Production deadline status calculation for ClaimRadar India.
 *
 * Evaluates whether a claim deadline is CURRENT, CLOSING_TODAY, EXPIRED, or UNKNOWN.
 * Standardizes calendar calculation in Asia/Kolkata timezone with support for injectable clocks.
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
}

const DEFAULT_TIMEZONE = 'Asia/Kolkata';

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
 * Parses various deadline string formats (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, ISO) into YYYY-MM-DD.
 */
export function parseDeadlineDate(raw: string | Date | null | undefined): string | null {
  if (!raw) return null;

  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return null;
    return raw.toISOString().slice(0, 10);
  }

  const str = raw.trim();
  if (
    !str ||
    str.toUpperCase() === 'UNKNOWN' ||
    str.toUpperCase() === 'NOT_STATED' ||
    str.toUpperCase() === 'N/A'
  ) {
    return null;
  }

  // 1. DD-MM-YYYY or DD/MM/YYYY (common Indian date format)
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch && ymdMatch[1] && ymdMatch[2] && ymdMatch[3]) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Try standard Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Calculates deadline status against a reference clock date and timezone.
 */
export function calculateDeadlineStatus(
  deadlineInput: string | Date | null | undefined,
  options: DeadlineCalculationOptions = {},
): DeadlineCalculationResult {
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;
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
    };
  }

  // Compare calendar day difference (YYYY-MM-DD UTC timestamps)
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
  if (daysRemaining < 0) {
    status = 'EXPIRED';
  } else if (daysRemaining === 0) {
    status = 'CLOSING_TODAY';
  } else {
    status = 'CURRENT';
  }

  return {
    status,
    deadlineDate: deadlineStr,
    today: todayStr,
    daysRemaining,
    timezone,
  };
}
