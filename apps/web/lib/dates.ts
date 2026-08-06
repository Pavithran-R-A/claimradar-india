/**
 * Date display helpers for the public directory.
 *
 * All deadline and timestamp displays use Indian Standard Time explicitly so
 * server and client rendering agree regardless of host timezone, and every
 * rendered date is paired with a machine-readable `<time dateTime>` element
 * in the markup.
 */

const IST = 'Asia/Kolkata';

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
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
  const date = parse(iso);
  if (!date) return null;
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

/** Whole days from `now` until the deadline (negative when past). */
export function daysUntil(iso: string, now: Date = new Date()): number | null {
  const date = parse(iso);
  if (!date) return null;
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

/** Relative, non-urgent phrasing for deadlines. Never a countdown. */
export function deadlinePhrase(iso: string, now: Date = new Date()): string | null {
  const days = daysUntil(iso, now);
  if (days === null) return null;
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Closes today';
  if (days === 1) return 'Closes tomorrow';
  if (days <= 30) return `Closes in ${days} days`;
  return `Closes in ${Math.round(days / 30)} months`;
}
