/**
 * Notification persistence layer (sections 26–27).
 *
 * The engine (engine.ts) is storage-agnostic: it talks to this NotificationStore
 * interface. SupabaseNotificationStore is the production implementation backed
 * by the service-role client (notification_delivery_log is service-role only —
 * see migration 011). Tests use an in-memory fake defined in the test suite.
 */

import { getAdminDb } from '@/lib/admin-db';
import type { ClaimableForNotification, NotificationPreferences, NotificationType } from './types';
import { DEFAULT_PREFERENCES } from './types';

/** Outcome of recording a delivery attempt in the ledger. */
export type RecordDeliveryOutcome = 'recorded' | 'duplicate';

export interface DeliveryLogEntry {
  userId: string;
  notificationId: string | null;
  claimableId: string | null;
  notificationType: NotificationType;
  channel: 'email' | 'browser' | 'whatsapp';
  dedupKey: string;
  status: 'delivered' | 'failed' | 'skipped';
  skipReason?: string | null;
  provider?: string | null;
  subject?: string | null;
  error?: string | null;
}

/** Everything the delivery engine needs to read/write, behind one seam. */
export interface NotificationStore {
  getPreferences(userId: string): Promise<NotificationPreferences>;
  getUserEmail(userId: string): Promise<string | null>;
  getClaimable(claimableId: string): Promise<ClaimableForNotification | null>;
  /** True when this user already received (status='delivered') this dedup key on this channel. */
  hasDelivery(userId: string, dedupKey: string, channel: string): Promise<boolean>;
  /**
   * Count of distinct delivered notifications (dedup keys) for this user +
   * type since the given ISO instant. Counts notifications, not channel
   * rows, so a single email+browser delivery counts once against the cap.
   */
  countDeliveredKeysSince(
    userId: string,
    type: NotificationType,
    sinceIso: string,
  ): Promise<number>;
  insertInAppNotification(row: {
    userId: string;
    type: string;
    title: string;
    body: string | null;
    claimableId: string | null;
  }): Promise<string>;
  /**
   * Insert a ledger row. Must return 'duplicate' (never throw) when the
   * unique (user_id, dedup_key, channel) index rejects a re-delivery.
   */
  recordDelivery(entry: DeliveryLogEntry): Promise<RecordDeliveryOutcome>;
}

/* ---------------------------------------------------------------------------
 * Supabase implementation (service-role — bypasses RLS by design)
 * ------------------------------------------------------------------------- */

interface PreferencesRow {
  email_enabled: boolean;
  browser_enabled: boolean;
  whatsapp_enabled: boolean;
  digest_frequency: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

interface ClaimableRow {
  id: string;
  publication_status: string;
  public_title: string;
  slug: string;
  status: string;
  deadline: string | null;
  company_id: string | null;
}

/** Postgres unique_violation — raised by the dedup index on re-delivery. */
const UNIQUE_VIOLATION = '23505';

export class SupabaseNotificationStore implements NotificationStore {
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const db = getAdminDb();
    const { data, error } = await db
      .from('notification_preferences')
      .select(
        'email_enabled, browser_enabled, whatsapp_enabled, digest_frequency, quiet_hours_start, quiet_hours_end',
      )
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(`preferences_load_failed: ${error.message}`);
    if (!data) return { ...DEFAULT_PREFERENCES };
    const row = data as PreferencesRow;
    return {
      emailEnabled: row.email_enabled,
      browserEnabled: row.browser_enabled,
      whatsappEnabled: row.whatsapp_enabled,
      digestFrequency: row.digest_frequency,
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
    };
  }

  async getUserEmail(userId: string): Promise<string | null> {
    const db = getAdminDb();
    const { data, error } = await db
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(`email_load_failed: ${error.message}`);
    return (data as { email: string | null } | null)?.email ?? null;
  }

  async getClaimable(claimableId: string): Promise<ClaimableForNotification | null> {
    const db = getAdminDb();
    const { data, error } = await db
      .from('claimables')
      .select('id, publication_status, public_title, slug, status, deadline, company_id')
      .eq('id', claimableId)
      .maybeSingle();
    if (error) throw new Error(`claimable_load_failed: ${error.message}`);
    if (!data) return null;
    const row = data as ClaimableRow;
    return {
      id: row.id,
      publicationStatus: row.publication_status,
      publicTitle: row.public_title,
      slug: row.slug,
      status: row.status,
      deadline: row.deadline,
      companyId: row.company_id,
    };
  }

  async hasDelivery(userId: string, dedupKey: string, channel: string): Promise<boolean> {
    const db = getAdminDb();
    const { count, error } = await db
      .from('notification_delivery_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('dedup_key', dedupKey)
      .eq('channel', channel)
      .eq('status', 'delivered');
    if (error) throw new Error(`delivery_check_failed: ${error.message}`);
    return (count ?? 0) > 0;
  }

  async countDeliveredKeysSince(
    userId: string,
    type: NotificationType,
    sinceIso: string,
  ): Promise<number> {
    const db = getAdminDb();
    const { data, error } = await db
      .from('notification_delivery_log')
      .select('dedup_key')
      .eq('user_id', userId)
      .eq('notification_type', type)
      .eq('status', 'delivered')
      .gte('created_at', sinceIso);
    if (error) throw new Error(`frequency_count_failed: ${error.message}`);
    const keys = new Set((data ?? []).map((row: { dedup_key: string }) => row.dedup_key));
    return keys.size;
  }

  async insertInAppNotification(row: {
    userId: string;
    type: string;
    title: string;
    body: string | null;
    claimableId: string | null;
  }): Promise<string> {
    const db = getAdminDb();
    const { data, error } = await db
      .from('notifications')
      .insert({
        user_id: row.userId,
        type: row.type,
        title: row.title,
        body: row.body,
        claimable_id: row.claimableId,
        delivery_status: 'delivered',
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw new Error(`notification_insert_failed: ${error.message}`);
    return (data as { id: string }).id;
  }

  async recordDelivery(entry: DeliveryLogEntry): Promise<RecordDeliveryOutcome> {
    const db = getAdminDb();
    const { error } = await db.from('notification_delivery_log').insert({
      user_id: entry.userId,
      notification_id: entry.notificationId,
      claimable_id: entry.claimableId,
      notification_type: entry.notificationType,
      channel: entry.channel,
      dedup_key: entry.dedupKey,
      status: entry.status,
      skip_reason: entry.skipReason ?? null,
      provider: entry.provider ?? null,
      subject: entry.subject ?? null,
      error: entry.error ?? null,
    });
    if (!error) return 'recorded';
    if (error.code === UNIQUE_VIOLATION) return 'duplicate';
    throw new Error(`delivery_log_failed: ${error.message}`);
  }
}
