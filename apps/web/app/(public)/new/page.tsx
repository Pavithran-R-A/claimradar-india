import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getPublishedClaimables } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';
import { formatIstDate } from '@/lib/dates';

export const metadata: Metadata = {
  title: 'Newly Published Claimables — ClaimKhoj India',
  description:
    'Recently published refund, compensation and claim opportunities verified from official Indian sources.',
  alternates: { canonical: '/new' },
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function NewPage() {
  const outcome = await getPublishedClaimables({ newOnly: true, limit: 50 });
  const items = outcome.ok
    ? [...outcome.data.items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    : [];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          <Sparkles aria-hidden className="h-7 w-7 text-trust-primary" />
          Newly published
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Records published within the last 30 days, newest first. Each one passed our verification
          and publication policy before appearing here.
        </p>
      </header>

      <div className="mt-8">
        {!outcome.ok ? (
          <DataUnavailableNotice message={outcome.error} />
        ) : (
          <>
            {outcome.demo && <DemoDataBanner />}

            {items.length === 0 ? (
              <EmptyDirectoryNotice
                title="Nothing new in the last 30 days"
                body="No records were published in the last 30 days. New records appear here as soon as they pass the publication policy."
              />
            ) : (
              <div className="space-y-3">
                {items.map((claim) => (
                  <div key={claim.id}>
                    <p className="mb-1.5 text-xs font-medium text-text-muted">
                      Published{' '}
                      <time dateTime={claim.publishedAt} className="text-text-secondary">
                        {formatIstDate(claim.publishedAt) ?? claim.publishedAt}
                      </time>
                    </p>
                    <ClaimableRow claim={claim} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/register"
          className="inline-flex h-11 items-center rounded-field bg-trust-primary px-6 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
        >
          Get notified about new records
        </Link>
      </div>
    </div>
  );
}
