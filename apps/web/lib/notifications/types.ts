/**
 * Core types for the notification system (quest §28).
 *
 * The seven notification types are enforced at the database level by
 * migration 011 (CHECK constraint on notifications.type and
 * notification_delivery_log.notification_type) and re-validated here by the
 * delivery engine before any write happens.
 */

export const NOTIFICATION_TYPES = [
  'new_match',
  'status_change',
  'closing_soon_reminder',
  'deadline_reminder',
  'source_change_update',
  'weekly_digest',
  'correction_notice',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export const NOTIFICATION_CHANNELS = ['email', 'browser', 'whatsapp'] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/** Per-user channel preferences (notification_preferences table). */
export interface NotificationPreferences {
  emailEnabled: boolean;
  browserEnabled: boolean;
  whatsappEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'none' | string;
  /** 'HH:MM' or 'HH:MM:SS', may cross midnight (e.g. 22:00 → 07:00). */
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  browserEnabled: true,
  whatsappEnabled: false,
  digestFrequency: 'weekly',
  quietHoursStart: null,
  quietHoursEnd: null,
};

/**
 * A notification a trigger wants to deliver. `dedupKey` is the unique
 * delivery key (user + type + subject entity + window) that makes
 * reprocessing safe — see buildDedupKey in safety.ts.
 */
export interface OutboundNotification {
  userId: string;
  type: NotificationType;
  /** In-app title and email subject. Sanitized by the engine before use. */
  title: string;
  body?: string | null;
  claimableId?: string | null;
  /** Optional deep link (relative path) rendered in channel messages. */
  link?: string | null;
  dedupKey: string;
}

/** Runtime context for a delivery attempt. */
export interface DeliveryContext {
  /** Override "now" — used by tests and the reminder scheduler. */
  now?: Date;
  /**
   * Dry-run guard: when true the engine performs ZERO writes and ZERO sends.
   * Crawler dry runs must never reach users (quest §28 safety control).
   */
  dryRun?: boolean;
  /** APP_ENV — real email only leaves in 'production'. */
  appEnv?: string;
}

export type ChannelDeliveryStatus = 'delivered' | 'skipped' | 'failed';

export interface ChannelOutcome {
  channel: NotificationChannel;
  status: ChannelDeliveryStatus;
  provider?: string;
  reason?: string;
}

export type DeliverySuppressionReason =
  | 'dry_run'
  | 'invalid_type'
  | 'claimable_missing'
  | 'unpublished_claimable'
  | 'duplicate'
  | 'frequency_limit'
  | 'quiet_hours'
  | 'digest_disabled'
  | 'store_error';

export interface DeliveryResult {
  status: 'delivered' | 'duplicate' | 'suppressed';
  reason?: DeliverySuppressionReason;
  /** In-app notification row id when one was created. */
  notificationId?: string | null;
  channels: ChannelOutcome[];
}

/** Slice of the claimables table the engine needs for safety checks. */
export interface ClaimableForNotification {
  id: string;
  publicationStatus: string;
  publicTitle: string;
  slug: string;
  status: string;
  deadline: string | null;
  companyId: string | null;
}

/** A fully rendered message handed to a channel provider. */
export interface RenderedMessage {
  userId: string;
  toEmail?: string | null;
  type: NotificationType;
  subject: string;
  body: string;
  claimableId?: string | null;
  link?: string | null;
  unsubscribeUrl?: string | null;
  /** Stable event identifier for Resend's 24-hour idempotency protection. */
  dedupKey?: string;
}

export interface ProviderSendResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}
