'use client';

import './globals.css';

/**
 * Root error boundary for the entire app shell. Required by Next.js for
 * uncaught root layout errors; also provides the static 500 fallback.
 * Keeps the calm, token-only visual language — no marketing motion.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary">
        <main
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Something went wrong
          </p>
          <h1 className="text-2xl font-semibold">An unexpected error occurred</h1>
          <p className="max-w-md text-sm text-text-secondary">
            Your data is safe. If the problem persists, use the grievance contact in the privacy
            center.
            {error.digest ? ` Reference: ${error.digest}` : ''}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-trust-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trust-primary"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
