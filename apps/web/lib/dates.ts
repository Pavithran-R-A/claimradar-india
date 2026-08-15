/**
 * Date display helpers for the public directory.
 *
 * All deadline calculations delegate to canonical @claimradar/shared-types
 * in Indian Standard Time (Asia/Kolkata) explicitly so server and client
 * rendering agree regardless of host timezone, and every rendered date is
 * paired with a machine-readable <time dateTime> element in the markup.
 */

import { calculateDeadlineStatus, parseDeadlineDate } from '@claimradar/shared-types';

const IST = 'Asia/Kolkata';

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const parsedStr = parseDeadlineDate(iso);
  if (!parsedStr) return null;
  const date = new Date(parsedStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "31 Oct 2026" in IST. Returns null for unparseable input. */
export function formatIstDate(iso: string | null | undefined): string | null {
  const date = parse(iso);
  if (!date) return null;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** e.g. "31 Oct 2026, 11:59 pm IST" for detail pages. */
export function formatIstDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)} IST`;
}

/** Whole calendar days from `now` until the deadline in Asia/Kolkata (negative when past, null when missing). */
export function daysUntil(iso: string | null | undefined, now: Date = new Date()): number | null {
  const result = calculateDeadlineStatus(iso, { clockDate: now, timezone: IST });
  return result.daysRemaining;
}

/** Relative, non-urgent phrasing for deadlines using canonical shared semantics. */
export function deadlinePhrase(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const result = calculateDeadlineStatus(iso, { clockDate: now, timezone: IST });
  if (result.status === 'UNKNOWN' || result.daysRemaining === null) return null;
  if (result.status === 'EXPIRED') return 'Deadline passed';
  if (result.status === 'CLOSING_TODAY') return 'Closes today';
  if (result.daysRemaining === 1) return 'Closes tomorrow';
  if (result.daysRemaining <= 30) return `Closes in ${result.daysRemaining} days`;
  return `Closes in ${Math.round(result.daysRemaining / 30)} months`;
}
