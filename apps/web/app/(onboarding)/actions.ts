'use server';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { runMatchingForUser } from '@/lib/matching-runner';
import { onboardingSchema } from '@/lib/schemas';

export interface OnboardingActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Persist low-risk onboarding answers, apply the notification preference,
 * record the processing consent event, mark onboarding complete and kick off
 * the deterministic matching run. Documents are never requested.
 */
export async function completeOnboarding(formData: FormData): Promise<OnboardingActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get('payload') ?? '{}'));
  } catch {
    return { ok: false, error: 'Invalid submission. Please try again.' };
  }

  const parsed = onboardingSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? 'Invalid input. Please check the form.',
    };
  }

  const input = parsed.data;
  const supabase = await getSupabaseServerClient();

  const { error: onboardingError } = await supabase.from('user_onboarding_responses').upsert(
    {
      user_id: user.id,
      companies_used: input.companiesUsed,
      sectors_used: input.sectorsUsed,
      purchase_period_start: input.purchasePeriodStart,
      purchase_period_end: input.purchasePeriodEnd,
      state: input.state,
      receipt_availability: input.receiptAvailability,
      reference_availability: input.referenceAvailability,
      notification_preference: input.notificationPreference,
    },
    { onConflict: 'user_id' },
  );
  if (onboardingError) {
    return { ok: false, error: 'Could not save your answers. Please try again.' };
  }

  const emailEnabled = input.notificationPreference === 'email';
  const browserEnabled = input.notificationPreference === 'in_app';
  await supabase.from('notification_preferences').upsert(
    {
      user_id: user.id,
      email_enabled: emailEnabled,
      browser_enabled: browserEnabled,
      whatsapp_enabled: false,
      digest_frequency: input.notificationPreference === 'none' ? 'never' : 'weekly',
    },
    { onConflict: 'user_id' },
  );

  // Immutable consent audit trail for processing onboarding data.
  await supabase.from('consent_events').insert({
    user_id: user.id,
    consent_type: 'onboarding_data_processing',
    granted: true,
    details: { source: 'onboarding_flow' },
  });

  // The self-scoped SECURITY DEFINER function enforces authenticated ownership,
  // verified email and saved answers, without depending on a web service-role key.
  const { data: completed, error: profileError } = await supabase.rpc(
    'complete_my_onboarding',
  );
  if (profileError || completed !== true) {
    console.error('[onboarding] secure completion failed', {
      code: profileError?.code ?? 'precondition_failed',
    });
    return { ok: false, error: 'Could not finish setup. Please try again.' };
  }

  // Best-effort first matching run; failures never block onboarding.
  await runMatchingForUser(user.id);

  redirect('/app');
}
