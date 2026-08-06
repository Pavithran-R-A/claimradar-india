/**
 * Notification delivery engine (sections 26–27).
 *
 * Orchestrates one outbound notification through every safety control, in
 * order:
 *
 *   1. dry-run guard            — crawler dry runs must never reach users
 *   2. type validation          — only the seven product types exist
 *   3. claimable safety         — never notify about missing/unpublished rows
 *   4. preferences              — channel opt-outs and digest settings
 *   5. quiet hours              — respect the user's quiet window
 *   6. deduplication            — ledger lookup per (user, dedupKey, channel)
 *   7. frequency limits         — per-user, per-type, per-UTC-day caps
 *   8. channel delivery         — browser inbox, email provider, WhatsApp skip
 *   9. ledger recording         — idempotent insert into the delivery log
 *
 * Real email can only leave when EMAIL_PROVIDER=resend + RESEND_API_KEY +
 * APP_ENV=production (enforced twice: selectEmailProvider and an explicit
 * sendsExternally gate below). Every other environment prints to the console.
 */

import { notificationConfigFromEnv, type NotificationConfig } from './config';
import { ConsoleEmailProvider, selectEmailProvider, type NotificationProvider } from './providers';
import {
  getFrequencyLimit,
  isProductionEmailAllowed,
  isWithinQuietHours,
  sanitizeSubject,
  startOfUtcDay,
  buildUnsubscribeUrl,
  createUnsubscribeToken,
} from './safety';
import type { NotificationStore } from './store';
import type {
  ChannelOutcome,
  ClaimableForNotification,
  DeliveryContext,
  DeliveryResult,
  NotificationChannel,
  NotificationPreferences,
  OutboundNotification,
  RenderedMessage,
} from './types';
import { isNotificationType } from './types';

/** Digest deliveries are dropped entirely when the user opted out. */
const DIGEST_OFF_VALUES = ['none', 'never'];

export interface DeliveryEngineOptions {
  /** Override env-derived config (tests). */
  config?: NotificationConfig;
  /** Override the email provider (tests). */
  emailProvider?: NotificationProvider;
  /** Override frequency limits per type (tests). */
  frequencyLimits?: Partial<Record<string, number>>;
}

function suppressed(reason: NonNullable<DeliveryResult['reason']>): DeliveryResult {
  return { status: 'suppressed', reason, channels: [] };
}

/** Renders the plain-text body handed to channel providers. */
export function renderBody(notification: OutboundNotification, link: string | null): string {
  const parts = [notification.body ?? ''];
  if (link) parts.push(`Details: ${link}`);
  return parts.filter((part) => part.length > 0).join('\n\n');
}

/**
 * Deliver one notification with every safety control applied.
 *
 * Never throws for expected suppression cases — the result distinguishes
 * 'delivered', 'duplicate' and 'suppressed' (with a reason). Store failures
 * surface as 'suppressed' with reason 'store_error' so a database outage can
 * never become an accidental blast to users.
 */
export async function deliverNotification(
  notification: OutboundNotification,
  store: NotificationStore,
  context: DeliveryContext = {},
  options: DeliveryEngineOptions = {},
): Promise<DeliveryResult> {
  // 1. Dry-run guard: zero writes, zero sends.
  if (context.dryRun) return suppressed('dry_run');

  // 2. Type validation — the DB constraint is the last line of defence.
  if (!isNotificationType(notification.type)) return suppressed('invalid_type');
  const type = notification.type;

  const config = options.config ?? notificationConfigFromEnv();
  const appEnv = context.appEnv ?? config.appEnv;
  const now = context.now ?? new Date();

  try {
    // 3. Claimable safety — triggers may reference stale or withdrawn rows.
    let claimable: ClaimableForNotification | null = null;
    if (notification.claimableId) {
      claimable = await store.getClaimable(notification.claimableId);
      if (!claimable) return suppressed('claimable_missing');
      if (claimable.publicationStatus !== 'published') return suppressed('unpublished_claimable');
    }

    // 4. Preferences.
    const preferences = await store.getPreferences(notification.userId);
    if (type === 'weekly_digest' && DIGEST_OFF_VALUES.includes(preferences.digestFrequency)) {
      return suppressed('digest_disabled');
    }

    // 5. Quiet hours — no delivery now; a later retry in-window can proceed
    //    because nothing has been written yet.
    if (isWithinQuietHours(preferences, now)) return suppressed('quiet_hours');

    // 6. Channel selection + deduplication.
    const channels = selectChannels(preferences);
    if (channels.length === 0) return suppressed('duplicate');

    const pendingChannels: NotificationChannel[] = [];
    const outcomes: ChannelOutcome[] = [];
    for (const channel of channels) {
      const already = await store.hasDelivery(notification.userId, notification.dedupKey, channel);
      if (already) {
        outcomes.push({ channel, status: 'skipped', reason: 'duplicate' });
      } else {
        pendingChannels.push(channel);
      }
    }
    if (pendingChannels.length === 0) {
      return { status: 'duplicate', channels: outcomes };
    }

    // 7. Frequency limit — per user, per type, per UTC day (counted per
    //    notification, not per channel row).
    const limit = getFrequencyLimit(type, options.frequencyLimits);
    const sinceIso = startOfUtcDay(now).toISOString();
    const deliveredToday = await store.countDeliveredKeysSince(notification.userId, type, sinceIso);
    if (deliveredToday >= limit) return suppressed('frequency_limit');

    // Rendering — subjects never carry sensitive details.
    const subject = sanitizeSubject(notification.title);
    const link = notification.link ?? null;
    const body = renderBody(notification, link);
    const unsubscribeUrl = buildUnsubscribeUrlForEmail(config, notification.userId);

    // 8+9. Deliver each pending channel, then record the ledger row.
    let notificationId: string | null = null;
    let deliveredAny = false;

    for (const channel of pendingChannels) {
      if (channel === 'browser') {
        try {
          notificationId = await store.insertInAppNotification({
            userId: notification.userId,
            type,
            title: subject,
            body,
            claimableId: notification.claimableId ?? null,
          });
          await store.recordDelivery({
            userId: notification.userId,
            notificationId,
            claimableId: notification.claimableId ?? null,
            notificationType: type,
            channel,
            dedupKey: notification.dedupKey,
            status: 'delivered',
            provider: 'browser-inbox',
            subject,
          });
          outcomes.push({ channel, status: 'delivered', provider: 'browser-inbox' });
          deliveredAny = true;
        } catch (error) {
          outcomes.push({
            channel,
            status: 'failed',
            reason: error instanceof Error ? error.message : 'store_error',
          });
        }
        continue;
      }

      if (channel === 'whatsapp') {
        // Placeholder only — never implemented, never sent.
        outcomes.push({
          channel,
          status: 'skipped',
          provider: 'whatsapp-placeholder',
          reason: 'not_implemented',
        });
        continue;
      }

      // Email channel.
      const recipient = await store.getUserEmail(notification.userId);
      if (!recipient) {
        outcomes.push({ channel, status: 'skipped', reason: 'recipient_email_missing' });
        continue;
      }

      let provider = options.emailProvider ?? selectEmailProvider({ ...config, appEnv });
      // Defence in depth: an external-sending provider can never run outside
      // production, regardless of configuration mistakes.
      if (provider.sendsExternally && !isProductionEmailAllowed(appEnv)) {
        provider = new ConsoleEmailProvider(config.emailFrom);
      }

      const message: RenderedMessage = {
        userId: notification.userId,
        toEmail: recipient,
        type,
        subject,
        body,
        claimableId: notification.claimableId ?? null,
        link,
        unsubscribeUrl,
      };

      try {
        const sendResult = await provider.send(message);
        if (sendResult.ok) {
          await store.recordDelivery({
            userId: notification.userId,
            notificationId,
            claimableId: notification.claimableId ?? null,
            notificationType: type,
            channel,
            dedupKey: notification.dedupKey,
            status: 'delivered',
            provider: provider.name,
            subject,
          });
          outcomes.push({ channel, status: 'delivered', provider: provider.name });
          deliveredAny = true;
        } else {
          await store.recordDelivery({
            userId: notification.userId,
            notificationId,
            claimableId: notification.claimableId ?? null,
            notificationType: type,
            channel,
            dedupKey: notification.dedupKey,
            status: 'failed',
            provider: provider.name,
            subject,
            error: sendResult.error ?? 'send_failed',
          });
          outcomes.push({
            channel,
            status: 'failed',
            provider: provider.name,
            ...(sendResult.error ? { reason: sendResult.error } : {}),
          });
        }
      } catch (error) {
        outcomes.push({
          channel,
          status: 'failed',
          provider: provider.name,
          reason: error instanceof Error ? error.message : 'send_failed',
        });
      }
    }

    if (deliveredAny) {
      return { status: 'delivered', notificationId, channels: outcomes };
    }
    // Every pending channel was skipped or failed — treat as suppressed so the
    // trigger can be retried; nothing blocks reprocessing here.
    const firstFailure = outcomes.find((outcome) => outcome.status === 'failed');
    return {
      status: 'suppressed',
      reason: firstFailure ? 'store_error' : 'duplicate',
      channels: outcomes,
    };
  } catch {
    return suppressed('store_error');
  }
}

/** Channels the user has enabled, in stable delivery order. */
function selectChannels(preferences: NotificationPreferences): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (preferences.browserEnabled) channels.push('browser');
  if (preferences.emailEnabled) channels.push('email');
  if (preferences.whatsappEnabled) channels.push('whatsapp');
  return channels;
}

/** One-click unsubscribe link, only when a signing secret is configured. */
function buildUnsubscribeUrlForEmail(config: NotificationConfig, userId: string): string | null {
  if (!config.siteUrl || !config.unsubscribeSecret) return null;
  const token = createUnsubscribeToken(userId, config.unsubscribeSecret);
  return buildUnsubscribeUrl(config.siteUrl, userId, token);
}
