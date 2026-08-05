import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | ClaimRadar India',
  description: 'Set a new password for your ClaimRadar India account.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  // A valid reset link is exchanged by /auth/callback, which establishes a
  // recovery session before redirecting here. If no session is present the
  // link is missing, expired or invalid — render an honest error state.
  let hasRecoverySession = false;
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    hasRecoverySession = Boolean(data.session);
  } catch {
    hasRecoverySession = false;
  }

  if (!hasRecoverySession) {
    return (
      <div>
        <h2 className="mb-2 text-center text-xl font-semibold text-text-primary">
          Reset Link Unavailable
        </h2>
        <p className="mb-6 text-center text-sm text-text-secondary">
          This password reset link is invalid or has expired. For your security, reset links can
          only be used once and for a limited time.
        </p>

        <div className="mb-6 rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          We could not verify a valid reset session. Please request a new reset link.
        </div>

        <Link
          href="/forgot-password"
          className="block w-full rounded-md bg-trust-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-trust-primary-hover"
        >
          Request a New Reset Link
        </Link>

        <div className="mt-4 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-trust-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
