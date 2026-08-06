import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { getPublishedCompanies } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Company Directory — ClaimRadar India',
  description:
    'Explore companies referenced in published refund, compensation and claim records verified from official Indian sources.',
  alternates: { canonical: '/companies' },
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const outcome = await getPublishedCompanies();

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Company directory
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Companies referenced in published refund, compensation and claim records. A company
          appears here only when a verified, published record mentions it.
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
                title="No companies listed yet"
                body="Companies appear here only when a published record references them. There are currently no published records in the directory."
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-text-muted">
                  {outcome.data.length} {outcome.data.length === 1 ? 'company' : 'companies'} in the
                  published directory
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {outcome.data.map((company) => (
                    <Link
                      key={company.slug}
                      href={`/companies/${company.slug}`}
                      className="group rounded-card border border-border bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-base ease-lift hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transform-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-ink-900 text-sm font-bold text-brand-bright"
                        >
                          {company.name.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-base font-semibold text-text-primary group-hover:text-trust-primary">
                            {company.name}
                          </span>
                          <span className="text-xs text-text-muted">{company.sector}</span>
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                        <span className="text-text-muted">
                          <span className="font-semibold text-text-secondary">
                            {company.activeClaimCount}
                          </span>{' '}
                          active {company.activeClaimCount === 1 ? 'record' : 'records'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-trust-primary">
                          View records
                          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-10 flex items-start gap-3 rounded-card border border-border bg-background-elevated p-4 text-xs leading-relaxed text-text-muted">
        <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
        <p>
          <strong className="font-semibold text-text-secondary">Neutral listing disclosure:</strong>{' '}
          listing a company on ClaimRadar India indicates only that an official notice, refund
          scheme or order references the entity. It implies no judgment about the company&apos;s
          conduct, liability or current standing.
        </p>
      </div>
    </div>
  );
}
