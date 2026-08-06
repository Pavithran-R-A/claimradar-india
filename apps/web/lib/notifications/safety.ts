/**
 * Safety controls for the notification engine (quest §28).
 *
 * Pure, dependency-free functions — every control here is unit-testable in
 * isolation: subject sanitization, quiet hours, frequency limits, dedup key
 * construction, APP_ENV gating and token-based unsubscribe links.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NotificationPreferences, NotificationType } from './types';

/* ---------------------------------------------------------------------------
 * Subject sanitization — no sensitive details in subject lines
 * ------------------------------------------------------------------------- */

/**
 * Patterns considered sensitive: email addresses, phone numbers, and long
 * digit runs (Aadhaar / bank account / case / reference numbers).
 */
const SENSITIVE_SUBJECT_PATTERNS: RegExp[] = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, // email addresses
  /(?:\+?\d{1,3}[\s-]?)?(?:\(\d{2,5}\)[\s-]?)?\d{5}[\s-]?\d{5}/g, // phone numbers
  /\b\d{8,}\b/g, // long digit runs: Aadhaar, account, reference numbers
  /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, // grouped 4-4-4 runs (Aadhaar display format)
];

export const MAX_SUBJECT_LENGTH = 120;

/**
 * Strips sensitive details (emails, phone numbers, long digit sequences)
 * from a subject line, collapses whitespace and truncates to 120 chars.
 * Subjects must never carry personal data — details belong in the body
 * behind authentication.
 */
export function sanitizeSubject(subject: string): string {
  let sanitized = subject;
  for (const pattern of SENSITIVE_SUBJECT_PATTERNS) {
    sanitized = sanitized.replace(pattern, ' ');
  }
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  if (sanitized.length > MAX_SUBJECT_LENGTH) {
    sanitized = `${sanitized.slice(0, MAX_SUBJECT_LENGTH - 1).trimEnd()}…`;
  }
  return sanitized;
}

/* ---------------------------------------------------------------------------
 * Quiet hours — notification_preferences.quiet_hours_start / _end
 * ------------------------------------------------------------------------- */

function parseTimeOfDay(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * True when `now` falls inside the user's quiet window. Windows may cross
 * midnight (e.g. 22:00 → 07:00). Missing or malformed values mean no quiet
 * hours. Uses the local time of the supplied date.
 */
export function isWithinQuietHours(
  preferences: Pick<NotificationPreferences, 'quietHoursStart' | 'quietHoursEnd'>,
  now: Date,
): boolean {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;
  const start = parseTimeOfDay(preferences.quietHoursStart);
  const end = parseTimeOfDay(preferences.quietHoursEnd);
  if (start === null || end === null || start === end) return false;

  const current = now.getHours() * 60 + now.getMinutes();
  if (start < end) return current >= start && current < end;
  // Overnight window (e.g. 22:00 → 07:00)
  return current >= start || current < end;
}

/* ---------------------------------------------------------------------------
 * Frequency limits — max deliveries per user per day per type
 * ------------------------------------------------------------------------- */

/** Default daily cap per user per notification type. */
export const DEFAULT_FREQUENCY_LIMITS: Record<NotificationType, number> = {
  new_match: 5,
  status_change: 5,
  closing_soon_reminder: 2,
  deadline_reminder: 2,
  source_change_update: 5,
  weekly_digest: 1,
  correction_notice: 3,
};

export function getFrequencyLimit(
  type: NotificationType,
  overrides?: Partial<Record<NotificationType, number>>,
): number {
  return overrides?.[type] ?? DEFAULT_FREQUENCY_LIMITS[type];
}

/* ---------------------------------------------------------------------------
 * Dedup keys — user + type + subject entity + window
 * ------------------------------------------------------------------------- */

/** Deterministic UTC day bucket, e.g. '2026-08-05'. */
export function dayBucket(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Deterministic ISO week bucket, e.g. '2026-W32'. */
export function weekBucket(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Builds the unique delivery key from stable parts. Triggers compose keys as
 * [type, userId, subjectEntityId, windowBucket] so the same real-world event
 * can never be delivered twice — even when reprocessed.
 */
export function buildDedupKey(parts: Array<string | number>): string {
  return parts.map((part) => String(part).trim()).join(':');
}

/** Start of the current UTC day — used for per-day frequency accounting. */
export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/* ---------------------------------------------------------------------------
 * APP_ENV gating — staging/dev email never reaches real customers
 * ------------------------------------------------------------------------- */

/** Real outbound email is only permitted in production. */
export function isProductionEmailAllowed(appEnv: string | undefined): boolean {
  return appEnv === 'production';
}

/* ---------------------------------------------------------------------------
 * Unsubscribe — token-based link helpers (stateless, HMAC-signed)
 * ------------------------------------------------------------------------- */

/**
 * HMAC-SHA256 token binding a user id to the unsubscribe secret. Stateless:
 * no table required, tokens stay valid until the secret is rotated.
 */
export function createUnsubscribeToken(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(userId).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, token: string, secret: string): boolean {
  if (!userId || !token || !secret) return false;
  const expected = createUnsubscribeToken(userId, secret);
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(token, 'utf8');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

/** Builds the one-click unsubscribe link appended to email bodies. */
export function buildUnsubscribeUrl(siteUrl: string, userId: string, token: string): string {
  const base = siteUrl.replace(/\/$/, '');
  return `${base}/app/settings/unsubscribe?uid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
}
