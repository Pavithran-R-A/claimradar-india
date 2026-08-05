'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  consentWithdrawalSchema,
  correctionRequestSchema,
  deletionRequestSchema,
  grievanceSchema,
} from '@/lib/schemas';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const INVALID_INPUT = 'Invalid input. Please check the form and try again.';
const DB_UNAVAILABLE = 'This is temporarily unavailable. Please try again later.';

async function requireUserId(): Promise<string | null> {
  const user = await getUser();
  return user?.id ?? null;
}

/* --------------------------- Correction requests -------------------------- */

export async function submitCorrectionRequest(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = correctionRequestSchema.safeParse({
    target: formData.get('target'),
    description: formData.get('description'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? INVALID_INPUT };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('user_correction_requests').insert({
    user_id: userId,
    target: parsed.data.target,
    description: parsed.data.description,
  });
  if (error) return { ok: false, error: DB_UNAVAILABLE };

  revalidatePath('/app/privacy');
  return { ok: true, message: 'Correction request submitted. Our team will review it.' };
}

/* ----------------------------- Consent withdrawal ------------------------- */

export async function withdrawConsent(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = consentWithdrawalSchema.safeParse({
    consentType: formData.get('consentType'),
    reason: formData.get('reason') || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? INVALID_INPUT };
  }

  const supabase = await getSupabaseServerClient();
  const { error: requestError } = await supabase.from('consent_withdrawal_requests').insert({
    user_id: userId,
    consent_type: parsed.data.consentType,
    reason: parsed.data.reason ?? null,
  });
  if (requestError) return { ok: false, error: DB_UNAVAILABLE };

  // Mirror into the immutable consent audit trail.
  await supabase.from('consent_events').insert({
    user_id: userId,
    consent_type: parsed.data.consentType,
    granted: false,
    details: { source: 'privacy_center', reason: parsed.data.reason ?? null },
  });

  revalidatePath('/app/privacy');
  return { ok: true, message: 'Consent withdrawal recorded.' };
}

/* ------------------------------ Account export ---------------------------- */

export async function requestAccountExport(): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const supabase = await getSupabaseServerClient();

  // One pending export request at a time.
  const { data: existing } = await supabase
    .from('account_export_requests')
    .select('id, status')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return { ok: true, message: 'An export request is already in progress.' };
  }

  const { error } = await supabase.from('account_export_requests').insert({ user_id: userId });
  if (error) return { ok: false, error: DB_UNAVAILABLE };

  revalidatePath('/app/privacy');
  return { ok: true, message: 'Export requested. You will be notified when it is ready.' };
}

/* ----------------------------- Account deletion --------------------------- */

export async function requestAccountDeletion(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = deletionRequestSchema.safeParse({
    reason: formData.get('reason') || undefined,
    confirmed: formData.get('confirmed') === 'true' ? true : undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? INVALID_INPUT };
  }

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from('account_deletion_requests')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['pending', 'scheduled'])
    .maybeSingle();
  if (existing) {
    return { ok: true, message: 'A deletion request is already in progress.' };
  }

  const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('account_deletion_requests').insert({
    user_id: userId,
    reason: parsed.data.reason ?? null,
    scheduled_deletion_at: scheduledDeletionAt,
  });
  if (error) return { ok: false, error: DB_UNAVAILABLE };

  revalidatePath('/app/privacy');
  return {
    ok: true,
    message: 'Deletion requested. Your account is scheduled for deletion in 30 days.',
  };
}

/* ------------------------------ Grievance log ----------------------------- */

export async function submitGrievance(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: 'You must be signed in.' };

  const parsed = grievanceSchema.safeParse({
    subject: formData.get('subject'),
    message: formData.get('message'),
    contactEmail: formData.get('contactEmail'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? INVALID_INPUT };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from('grievance_contacts').insert({
    user_id: userId,
    subject: parsed.data.subject,
    message: parsed.data.message,
    contact_email: parsed.data.contactEmail,
  });
  if (error) return { ok: false, error: DB_UNAVAILABLE };

  revalidatePath('/app/privacy');
  return { ok: true, message: 'Grievance logged. We will respond to your contact email.' };
}
