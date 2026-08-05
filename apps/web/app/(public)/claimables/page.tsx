import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedClaimables, getPublishedSectors } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Public Claimables Directory — Published Official Claims | ClaimRadar India',
  description:
    'Browse published consumer, investor, and banking claimable opportunities backed by official regulator orders and public notices.',
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

interface ClaimablesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    company?: string;
    sector?: string;
    page?: string;
  }>;
}

export default async function ClaimablesPage({ searchParams }: ClaimablesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const result = await getPublishedClaimables({
    search: params.search,
    status: params.status,
    companySlug: params.company,
    sectorSlug: params.sector,
    page,
    limit: 10,
  });
  const sectorsOutcome = await getPublishedSectors();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Public Claimables Directory
        </h1>
        <p className="text-slate-600 max-w-2xl">
          Browse published claimable opportunities extracted from regulator notices and public
          orders. Only records that passed the publication policy are shown.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form
        method="GET"
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Search
          </label>
          <input
            type="text"
            name="search"
            defaultValue={params.search || ''}
            placeholder="Search company or title..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            name="status"
            defaultValue={params.status || ''}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closing_soon">Closing Soon</option>
            <option value="under_review">Under Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Sector
          </label>
          <select
            name="sector"
            defaultValue={params.sector || ''}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">All Sectors</option>
            {sectorsOutcome.ok &&
              sectorsOutcome.data.map((sector) => (
                <option key={sector.slug} value={sector.slug}>
                  {sector.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {!result.ok ? (
        <DataUnavailableNotice message={result.error} />
      ) : (
        <>
          {result.demo && <DemoDataBanner />}

          {/* Directory List */}
          {result.data.items.length === 0 ? (
            <EmptyDirectoryNotice
              title="No published claimables match your criteria"
              body="There are currently no published records matching these filters. Published claimables appear here only after they pass the full publication policy — try clearing your filters or check back later."
            />
          ) : (
            <div className="space-y-4 mb-8">
              {result.data.items.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {claim.sector}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        claim.status === 'closing_soon'
                          ? 'bg-amber-100 text-amber-800'
                          : claim.status === 'under_review'
                            ? 'bg-sky-100 text-sky-800'
                            : claim.status === 'closed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {claim.status === 'closing_soon'
                        ? 'Closing Soon'
                        : claim.status === 'under_review'
                          ? 'Under Review'
                          : claim.status === 'closed'
                            ? 'Closed'
                            : 'Open'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {claim.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {claim.statusExplanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">Company:</span>{' '}
                      {claim.companyName}
                    </div>
                    {claim.deadlineDate && (
                      <div>
                        <span className="font-semibold text-slate-700">Deadline:</span>{' '}
                        {new Date(claim.deadlineDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {result.data.totalPages > 1 && (
                <nav aria-label="Directory pagination" className="flex justify-center gap-2">
                  {Array.from({ length: result.data.totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/claimables?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ''}${params.status ? `&status=${params.status}` : ''}${params.company ? `&company=${params.company}` : ''}${params.sector ? `&sector=${params.sector}` : ''}`}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        p === result.data.page
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
