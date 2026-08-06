'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { verifyUnsubscribeToken } from '@/lib/notifications/safety';

export type UnsubscribeResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * One-click email unsubscribe. The HMAC token in the link binds the request to
 * a specific user; the signed-in session must match that user, so a leaked
 * link can never disable somebody else's email. Disabling email only touches
 * notification_preferences (RLS: own row) — never auth or billing state.
 */
export async function unsubscribeFromEmail(formData: FormData): Promise<UnsubscribeResult> {
  const uid = typeof formData.get('uid') === 'string' ? (formData.get('uid') as string) : '';
  const token = typeof formData.get('token') === 'string' ? (formData.get('token') as string) : '';
  const secret = process.env.UNSUBSCRIBE_SECRET;

  if (!secret || !verifyUnsubscribeToken(uid, token, secret)) {
    return {
      ok: false,
      error: 'This unsubscribe link is invalid or has expired. Manage email in Settings instead.',
    };
  }

  const user = await getUser();
  if (!user || user.id !== uid) {
    return {
      ok: false,
      error: 'Sign in with the account that received this email to unsubscribe.',
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: uid, email_enabled: false }, { onConflict: 'user_id' });
  if (error) {
    return { ok: false, error: 'Could not update your preferences right now. Please try again.' };
  }

  revalidatePath('/app/settings');
  return { ok: true, message: 'You will no longer receive email notifications.' };
}
