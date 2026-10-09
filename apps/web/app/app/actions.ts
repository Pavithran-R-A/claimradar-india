'use server';

import { revalidatePath } from 'next/cache';
import { TrackerStatus } from '@claimradar/shared-types';
import { getUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { FREE_TIER_LIMITS } from '@/lib/entitlements';
import { runMatchingForUser } from '@/lib/matching-runner';
import { deliverPendingMatchesForUser } from '@/lib/notifications/dispatch-matches';
import {
  createTrackerSchema,
  deleteTrackerSchema,
  markNotificationReadSchema,
  notificationPreferencesSchema,
  profileUpdateSchema,
  updateTrackerSchema,
  watchCompanyIdSchema,
  watchSectorIdSchema,
} from '@/lib/schemas';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const INVALID_INPUT = 'Invalid input. Please check the form and try again.';

async function requireUserId(): Promise<string | null> {
  const user = await getUser();
  return user?.id ?? null;
}

/* -------------------------------- Watchlist ------------------------------- */

export async function watchCompany(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = watchCompanyIdSchema.safeParse({ companyId: formData.get('companyId') });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();

  // Dedup: do not add the same company twice.
  const { data: existing } = await supabase
    .from('user_company_watchlists')
    .select('id')
    .eq('user_id', userId)
    .eq('company_id', parsed.data.companyId)
    .maybeSingle();
  if (existing) return { ok: true, message: 'Already on your watchlist.' };

  // Free-tier entitlement limit.
  const { count, error: countError } = await supabase
    .from('user_company_watchlists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) return { ok: false, error: 'Could not update your watchlist right now.' };
  if ((count ?? 0) >= FREE_TIER_LIMITS.companyWatchlist) {
    return {
      ok: false,
      error: `Free plan allows up to ${FREE_TIER_LIMITS.companyWatchlist} watched companies.`,
    };
  }

  const { error } = await supabase
    .from('user_company_watchlists')
    .insert({ user_id: userId, company_id: parsed.data.companyId });
  if (error) return { ok: false, error: 'Could not update your watchlist right now.' };

  revalidatePath('/app/watchlist');
  revalidatePath('/app');
  return { ok: true };
}

export async function unwatchCompany(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = watchCompanyIdSchema.safeParse({ companyId: formData.get('companyId') });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('user_company_watchlists')
    .delete()
    .eq('user_id', userId)
    .eq('company_id', parsed.data.companyId);
  if (error) return { ok: false, error: 'Could not update your watchlist right now.' };

  revalidatePath('/app/watchlist');
  revalidatePath('/app');
  return { ok: true };
}

export async function watchSector(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = watchSectorIdSchema.safeParse({ sectorId: formData.get('sectorId') });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from('user_sector_watchlists')
    .select('id')
    .eq('user_id', userId)
    .eq('sector_id', parsed.data.sectorId)
    .maybeSingle();
  if (existing) return { ok: true, message: 'Already on your watchlist.' };

  const { count, error: countError } = await supabase
    .from('user_sector_watchlists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) return { ok: false, error: 'Could not update your watchlist right now.' };
  if ((count ?? 0) >= FREE_TIER_LIMITS.sectorWatchlist) {
    return {
      ok: false,
      error: `Free plan allows up to ${FREE_TIER_LIMITS.sectorWatchlist} watched sectors.`,
    };
  }

  const { error } = await supabase
    .from('user_sector_watchlists')
    .insert({ user_id: userId, sector_id: parsed.data.sectorId });
  if (error) return { ok: false, error: 'Could not update your watchlist right now.' };

  revalidatePath('/app/watchlist');
  revalidatePath('/app');
  return { ok: true };
}

export async function unwatchSector(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = watchSectorIdSchema.safeParse({ sectorId: formData.get('sectorId') });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('user_sector_watchlists')
    .delete()
    .eq('user_id', userId)
    .eq('sector_id', parsed.data.sectorId);
  if (error) return { ok: false, error: 'Could not update your watchlist right now.' };

  revalidatePath('/app/watchlist');
  revalidatePath('/app');
  return { ok: true };
}

/* --------------------------------- Tracker -------------------------------- */

export async function createTracker(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = createTrackerSchema.safeParse({
    claimableId: formData.get('claimableId'),
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from('claim_trackers')
    .select('id')
    .eq('user_id', userId)
    .eq('claimable_id', parsed.data.claimableId)
    .maybeSingle();
  if (existing) return { ok: true, message: 'You are already tracking this claimable.' };

  const { count } = await supabase
    .from('claim_trackers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if ((count ?? 0) >= FREE_TIER_LIMITS.trackers) {
    return {
      ok: false,
      error: `Free plan allows up to ${FREE_TIER_LIMITS.trackers} tracked claimables.`,
    };
  }

  const { error } = await supabase.from('claim_trackers').insert({
    user_id: userId,
    claimable_id: parsed.data.claimableId,
    status: TrackerStatus.Saved,
    notes: parsed.data.notes ?? null,
  });
  if (error) return { ok: false, error: 'Could not start tracking this claimable right now.' };

  revalidatePath('/app/tracker');
  revalidatePath('/app');
  return { ok: true };
}

export async function updateTracker(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = updateTrackerSchema.safeParse({
    trackerId: formData.get('trackerId'),
    status: formData.get('status'),
    notes: formData.has('notes') ? formData.get('notes') || null : undefined,
    externalReference: formData.has('externalReference')
      ? formData.get('externalReference') || null
      : undefined,
  });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const update: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;
  if (parsed.data.externalReference !== undefined) {
    update.external_reference = parsed.data.externalReference;
  }

  const { error } = await supabase
    .from('claim_trackers')
    .update(update)
    .eq('id', parsed.data.trackerId)
    .eq('user_id', userId);
  if (error) return { ok: false, error: 'Could not update this tracker entry right now.' };

  revalidatePath('/app/tracker');
  revalidatePath('/app');
  return { ok: true };
}

export async function deleteTracker(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = deleteTrackerSchema.safeParse({ trackerId: formData.get('trackerId') });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('claim_trackers')
    .delete()
    .eq('id', parsed.data.trackerId)
    .eq('user_id', userId);
  if (error) return { ok: false, error: 'Could not remove this tracker entry right now.' };

  revalidatePath('/app/tracker');
  revalidatePath('/app');
  return { ok: true };
}

/* ------------------------------- Preferences ------------------------------ */

export async function saveNotificationPreferences(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = notificationPreferencesSchema.safeParse({
    emailEnabled: formData.get('emailEnabled') === 'on',
    browserEnabled: formData.get('browserEnabled') === 'on',
    whatsappEnabled: formData.get('whatsappEnabled') === 'on',
    digestFrequency: formData.get('digestFrequency') ?? 'weekly',
  });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: userId,
      email_enabled: parsed.data.emailEnabled,
      browser_enabled: parsed.data.browserEnabled,
      whatsapp_enabled: parsed.data.whatsappEnabled,
      digest_frequency: parsed.data.digestFrequency,
    },
    { onConflict: 'user_id' },
  );
  if (error) return { ok: false, error: 'Could not save your preferences right now.' };

  revalidatePath('/app/settings');
  return { ok: true, message: 'Preferences saved.' };
}

/* --------------------------------- Profile -------------------------------- */

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = profileUpdateSchema.safeParse({
    displayName: formData.get('displayName') || null,
  });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: parsed.data.displayName })
    .eq('id', userId);
  if (error) return { ok: false, error: 'Could not update your profile right now.' };

  revalidatePath('/app/profile');
  return { ok: true, message: 'Profile updated.' };
}

/* ------------------------------- Notifications ---------------------------- */

export async function markNotificationRead(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = markNotificationReadSchema.safeParse({
    notificationId: formData.get('notificationId'),
  });
  if (!parsed.success) return { ok: false, error: INVALID_INPUT };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', parsed.data.notificationId)
    .eq('user_id', userId);
  if (error) return { ok: false, error: 'Could not update this notification right now.' };

  revalidatePath('/app/notifications');
  return { ok: true };
}

/* --------------------------------- Matches -------------------------------- */

export async function refreshMatches(): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const run = await runMatchingForUser(userId);
  if (!run.ok) {
    if (run.error === 'onboarding_missing') {
      return { ok: false, error: 'Complete onboarding first to compute matches.' };
    }
    return { ok: false, error: 'Matching is temporarily unavailable. Please try again later.' };
  }

  // Notifications cannot block an otherwise successful matching refresh.
  // The dispatcher fails closed outside explicitly enabled production.
  try {
    await deliverPendingMatchesForUser(userId);
  } catch {
    console.warn('[matches] notification dispatch deferred');
  }

  revalidatePath('/app/matches');
  revalidatePath('/app');
  return {
    ok: true,
    message: `Checked ${run.result.evaluated} published claimables; saved ${run.result.upserted} results.`,
  };
}
