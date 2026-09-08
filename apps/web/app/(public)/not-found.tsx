import Link from 'next/link';

export default function PublicNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-trust-primary">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-text-secondary">
        This public page does not exist or is not currently published.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-trust-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
        >
          Back to Home
        </Link>
        <Link
          href="/claimables"
          className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          Browse Published Claimables
        </Link>
      </div>
    </div>
  );
}
