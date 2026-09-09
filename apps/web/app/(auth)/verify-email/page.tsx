import Link from 'next/link';
import { ResendVerificationForm } from './resend-form';

interface VerifyEmailPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const linkExpired = params.error === 'link_expired';
  const linkInvalid = params.error === 'link_invalid';

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-trust-primary/10">
          <svg
            className="h-6 w-6 text-trust-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        {linkExpired ? (
          <>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Link Expired</h2>
            <p className="text-sm text-text-secondary">
              That verification link has expired for security reasons. Request a fresh one below —
              it takes just a moment.
            </p>
          </>
        ) : linkInvalid ? (
          <>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Link Not Valid</h2>
            <p className="text-sm text-text-secondary">
              That verification link could not be verified (it may have already been used). Request
              a new one below.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Check Your Email</h2>
            <p className="text-sm text-text-secondary">
              We&apos;ve sent you a verification link. Please check your email and click the link to
              verify your account.
            </p>
          </>
        )}
      </div>

      {(linkExpired || linkInvalid) && (
        <div className="mb-6 rounded-md border border-deadline/20 bg-deadline-background p-3 text-sm text-deadline">
          {linkExpired
            ? 'Verification links expire after a short window. The new link below replaces it.'
            : 'If you already verified your account, simply sign in instead.'}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-border bg-background/40 p-4">
        <p className="mb-3 text-sm font-medium text-text-primary">
          Didn&apos;t get it, or link failed?
        </p>
        <ResendVerificationForm />
      </div>

      <p className="mb-4 text-center text-xs text-text-secondary">
        If you don&apos;t see the email, check your spam folder. Links are single-use and expire
        shortly after being sent.
      </p>

      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-trust-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
