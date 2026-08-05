import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedCompanies } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Company Directory — ClaimRadar India',
  description: 'Explore companies associated with official published refund and claim notices.',
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  const outcome = await getPublishedCompanies();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Company Directory</h1>
        <p className="text-slate-600 max-w-2xl">
          Companies referenced in published regulatory refund, disgorgement, or grievance orders.
        </p>
      </div>

      {!outcome.ok ? (
        <DataUnavailableNotice message={outcome.error} />
      ) : (
        <>
          {outcome.demo && <DemoDataBanner />}

          {outcome.data.length === 0 ? (
            <EmptyDirectoryNotice
              title="No companies listed yet"
              body="Companies appear here only when a published claimable record references them. There are currently no published records in the directory."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {outcome.data.map((comp) => (
                <div
                  key={comp.slug}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 mb-3 inline-block">
                    {comp.sector}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{comp.name}</h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Active Claimables:{' '}
                    <span className="font-semibold text-slate-800">{comp.activeClaimCount}</span>
                  </p>
                  <Link
                    href={`/companies/${comp.slug}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Company Profile &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
        <strong>Neutral Listing Disclosure:</strong> Listing a company on ClaimRadar India indicates
        only that an official regulatory notice, refund scheme, or disgorgement order references the
        entity. It implies no judgment regarding current corporate standing.
      </div>
    </div>
  );
}
