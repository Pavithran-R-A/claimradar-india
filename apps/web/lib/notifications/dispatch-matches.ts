/**
 * A safe bridge between user-initiated matching and the notification engine.
 * Automatic scheduling/publication remains separate and is not enabled here.
 *
 * No real customer notification leaves unless ALL production gates are met.
 */
import { getAdminDb } from '@/lib/admin-db';
import { deliverNotification } from '@/lib/notifications/engine';
import { notificationConfigFromEnv } from '@/lib/notifications/config';
import { SupabaseNotificationStore } from '@/lib/notifications/store';
import { buildDedupKey } from '@/lib/notifications/safety';

export function isRealAlertDeliveryConfigured(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.APP_ENV === 'production' &&
    env.NOTIFY_CUSTOMERS_ENABLED === 'true' &&
    env.EMAIL_PROVIDER === 'resend' &&
    Boolean(env.RESEND_API_KEY) &&
    Boolean(env.UNSUBSCRIBE_SECRET)
  );
}

interface MatchRow {
  id: string;
  claimable_id: string;
}

interface PublishedRow {
  id: string;
  public_title: string;
  slug: string;
  publication_status: string;
}

export async function deliverPendingMatchesForUser(
  userId: string,
): Promise<{ attempted: number; delivered: number }> {
  if (!isRealAlertDeliveryConfigured() || !userId) {
    return { attempted: 0, delivered: 0 };
  }

  const db = getAdminDb();
  // Bound the fan-out per request. This function is only called after an
  // authenticated user's own matching run, never for arbitrary supplied IDs.
  const { data, error } = await db
    .from('claim_matches')
    .select('id, claimable_id')
    .eq('user_id', userId)
    .eq('notified', false)
    .in('confidence', ['strong_potential_match', 'possible_match'])
    .order('first_matched_at', { ascending: true })
    .limit(10);
  if (error) throw new Error('alert_matches_load_failed');

  const matches = (data ?? []) as MatchRow[];
  if (matches.length === 0) return { attempted: 0, delivered: 0 };

  const { data: candidates, error: claimablesError } = await db
    .from('claimables')
    .select('id, public_title, slug, publication_status')
    .in('id', matches.map((row) => row.claimable_id))
    .eq('publication_status', 'published');
  if (claimablesError) throw new Error('alert_claimables_load_failed');

  const published = new Map<string, PublishedRow>(
    ((candidates ?? []) as PublishedRow[]).map((row) => [row.id, row]),
  );
  const store = new SupabaseNotificationStore();
  const config = notificationConfigFromEnv();
  let delivered = 0;

  for (const match of matches) {
    const claim = published.get(match.claimable_id);
    if (!claim) continue;
    const result = await deliverNotification(
      {
        userId,
        type: 'new_match',
        title: `Potential match: ${claim.public_title}`,
        body: 'A published opportunity may relate to your interests. Eligibility is not guaranteed. Review the official source.',
        claimableId: claim.id,
        link: `/claimables/${encodeURIComponent(claim.slug)}`,
        dedupKey: buildDedupKey(['new_match', userId, claim.id, 'published-v1']),
      },
      store,
      { appEnv: config.appEnv },
    );
    // The ledger and in-app inbox provide durable, inspectable outcomes. An
    // unsuccessful/suppressed attempt must remain eligible for safe retry.
    if (result.status === 'delivered' || result.status === 'duplicate') {
      const { error: updateError } = await db
        .from('claim_matches')
        .update({ notified: true })
        .eq('id', match.id)
        .eq('user_id', userId);
      if (updateError) throw new Error('alert_match_checkpoint_failed');
      delivered += 1;
    }
  }

  return { attempted: matches.length, delivered };
}
