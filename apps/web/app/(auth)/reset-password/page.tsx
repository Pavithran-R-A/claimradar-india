import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | ClaimKhoj India',
  description: 'Set a new password for your ClaimKhoj India account.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  // A valid reset link is exchanged by /auth/callback, which establishes a
  // recovery session before redirecting here. If no session is present the
  // link is missing, expired or invalid: render an honest error state.
  let hasRecoverySession = false;
  let sessionCheckUnavailable = false;
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.getSession();
    sessionCheckUnavailable = Boolean(error);
    hasRecoverySession = Boolean(data.session);
  } catch {
    sessionCheckUnavailable = true;
  }

  if (sessionCheckUnavailable) {
    return (
      <div>
        <h1 className="mb-2 text-center text-xl font-semibold text-text-primary">
          Reset link check unavailable
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          We could not check this reset link. Please try again shortly.
        </p>
        <Link href="/forgot-password" className="text-trust-primary hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div>
        <h1 className="mb-2 text-center text-xl font-semibold text-text-primary">
          Reset link unavailable
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          This reset link cannot establish a recovery session. Request a new one to continue.
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
