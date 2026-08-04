import Link from 'next/link';
import type { Metadata } from 'next';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          <svg
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{title}</h1>
        <p className="mt-3 text-base text-text-secondary">{description}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md bg-trust-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
          >
            Back to Home
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function generateComingSoonMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} — Coming Soon — ClaimRadar India`,
    description,
  };
}
