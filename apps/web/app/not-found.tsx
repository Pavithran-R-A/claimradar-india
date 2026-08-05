import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-trust-primary">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-text-secondary">
        The page you are looking for does not exist, may have been moved, or is not currently
        published. We never serve placeholder content in place of genuine records.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-trust-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
        >
          Back to Home
        </Link>
        <Link
          href="/claimables"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          Browse Published Claimables
        </Link>
      </div>
    </div>
  );
}
