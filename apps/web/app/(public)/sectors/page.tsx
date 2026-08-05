import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedSectors } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Sectors Directory — ClaimRadar India',
  description: 'Browse published claimable opportunities by industry sector.',
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function SectorsPage() {
  const outcome = await getPublishedSectors();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Industry Sectors</h1>
        <p className="text-slate-600">Browse published claim opportunities by market sector.</p>
      </div>

      {!outcome.ok ? (
        <DataUnavailableNotice message={outcome.error} />
      ) : (
        <>
          {outcome.demo && <DemoDataBanner />}

          {outcome.data.length === 0 ? (
            <EmptyDirectoryNotice
              title="No sectors listed yet"
              body="Sectors appear here only when published claimable records are categorised under them. There are currently no published records in the directory."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {outcome.data.map((sec) => (
                <div
                  key={sec.slug}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{sec.name}</h2>
                  <p className="text-xs text-slate-500 mb-4">
                    {sec.activeClaimCount} Active{' '}
                    {sec.activeClaimCount === 1 ? 'Opportunity' : 'Opportunities'}
                  </p>
                  <Link
                    href={`/sectors/${sec.slug}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Browse Sector Claims &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
