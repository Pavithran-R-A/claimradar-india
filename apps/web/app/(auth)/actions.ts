'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/app-auth';
import { brandConfig } from '@claimradar/config';

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required.'),
});

/** The customer-facing origin must never default to localhost on hosted deployments. */
function authCallbackUrl(next: '/onboarding' | '/reset-password'): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? brandConfig.url;
  const url = new URL('/auth/callback', base);
  url.searchParams.set('next', next);
  return url.toString();
}

const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Email and password are required.' };
  }

  const { email, password } = parsed.data;
  const next = safeNextPath(formData.get('next') as string | null);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authCallbackUrl('/onboarding'),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message: 'Check your email for a verification link to complete your registration.',
  };
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl('/reset-password'),
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message: 'Check your email for a password reset link.',
  };
}

/**
 * Update the password after following a reset link (used by /reset-password).
 */
export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password) {
    return { error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/login');
}

/**
 * Resend the account verification email. Used from the verify-email page when
 * the original message never arrived or its link expired.
 */
export async function resendVerification(formData: FormData) {
  const parsed = emailSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Enter a valid email address.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: parsed.data.email,
    options: {
      emailRedirectTo: authCallbackUrl('/onboarding'),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message:
      'If an unverified account exists for that email, a new verification link is on its way.',
  };
}
