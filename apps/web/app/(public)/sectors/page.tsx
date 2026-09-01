import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { getPublishedSectors } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Sectors Directory — ClaimRadar India',
  description:
    'Browse published refund, compensation and claim opportunities by industry sector, verified from official Indian sources.',
  alternates: { canonical: '/sectors' },
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function SectorsPage() {
  const outcome = await getPublishedSectors();

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Industry sectors
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Published refund, compensation and claim opportunities grouped by the sector of the
          company involved. Each sector page lists the verified records we currently publish for
          that industry.
        </p>
      </header>

      <div className="mt-8">
        {!outcome.ok ? (
          <DataUnavailableNotice message={outcome.error} />
        ) : (
          <>
            {outcome.demo && <DemoDataBanner />}

            {outcome.data.length === 0 ? (
              <EmptyDirectoryNotice
                title="No sectors listed yet"
                body="Sectors appear here only when published records are categorised under them. There are currently no published records in the directory."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {outcome.data.map((sector) => (
                  <Link
                    key={sector.slug}
                    href={`/sectors/${sector.slug}`}
                    className="group rounded-card border border-border bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-base ease-lift hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transform-none"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        aria-hidden
                        className="flex h-10 w-10 items-center justify-center rounded-field bg-ink-900 text-trust-primary"
                      >
                        <Layers className="h-5 w-5" />
                      </span>
                      <span className="rounded bg-background-elevated px-2.5 py-1 text-xs font-semibold text-text-secondary">
                        {sector.activeClaimCount} active
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-text-primary group-hover:text-trust-primary">
                      {sector.name}
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      {sector.activeClaimCount}{' '}
                      {sector.activeClaimCount === 1 ? 'record' : 'records'} currently published
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust-primary">
                      Browse sector records
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
