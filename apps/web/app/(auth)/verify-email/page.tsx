import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
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

      <h2 className="mb-2 text-xl font-semibold text-text-primary">Check Your Email</h2>
      <p className="mb-6 text-sm text-text-secondary">
        We&apos;ve sent you a verification link. Please check your email and click the link to
        verify your account.
      </p>
      <p className="mb-6 text-xs text-text-secondary/70">
        If you don&apos;t see the email, check your spam folder or request a new verification email.
      </p>

      <Link href="/login" className="text-sm font-medium text-trust-primary hover:underline">
        Back to Sign In
      </Link>
    </div>
  );
}
