import type { Metadata } from 'next';
import { brandConfig } from '@claimradar/config';
import { buildCollectionPageJsonLd, buildItemListJsonLd } from '@claimradar/seo';
import {
  applyClaimableFilters,
  getPublishedClaimables,
  getPublishedSectors,
  paginateClaimables,
  type PublishedClaimable,
} from '@/lib/claimables-repository';
import { ClaimableCard } from '@/components/directory/claimable-card';
import {
  ActiveFilterChips,
  FilterFields,
  type DirectoryParams,
} from '@/components/directory/filters';
import { MobileFilterDrawer } from '@/components/directory/mobile-filter-drawer';
import { Pagination } from '@/components/directory/pagination';
import { JsonLd } from '@/components/seo/json-ld';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Claimables Directory — Published Refund & Compensation Records | ClaimKhoj India',
  description:
    'Search and filter published refund, compensation and claim opportunities verified from official Indian sources. Filter by status and sector, sort by deadline.',
  alternates: { canonical: '/claimables' },
};

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 12;

interface ClaimablesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sector?: string;
    sort?: string;
    page?: string;
  }>;
}

function sortClaimables(items: PublishedClaimable[], sort: string): PublishedClaimable[] {
  const list = [...items];
  if (sort === 'deadline') {
    list.sort((a, b) => {
      if (!a.deadlineDate && !b.deadlineDate) return 0;
      if (!a.deadlineDate) return 1;
      if (!b.deadlineDate) return -1;
      return Date.parse(a.deadlineDate) - Date.parse(b.deadlineDate);
    });
  } else if (sort === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    list.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  return list;
}

export default async function ClaimablesPage({ searchParams }: ClaimablesPageProps) {
  const raw = await searchParams;
  const params: DirectoryParams = {
    search: raw.search || (raw as Record<string, string | undefined>).q,
    status: raw.status,
    sector: raw.sector,
    sort: raw.sort,
  };
  const page = parseInt(raw.page || '1', 10) || 1;

  const [allOutcome, sectorsOutcome] = await Promise.all([
    getPublishedClaimables({ limit: 500 }),
    getPublishedSectors(),
  ]);
  const sectors = sectorsOutcome.ok ? sectorsOutcome.data : [];
  const activeCount = [params.search, params.status, params.sector].filter(Boolean).length;

  const publishedItems = allOutcome.ok && !allOutcome.demo ? allOutcome.data.items : [];
  const structuredData = [
    buildCollectionPageJsonLd({
      name: 'ClaimKhoj Claimables Directory',
      url: `${brandConfig.url}/claimables`,
      description: 'Published refund, compensation and claim opportunities verified from official Indian sources.',
    }),
    buildItemListJsonLd({
      name: 'Published ClaimKhoj opportunities',
      url: `${brandConfig.url}/claimables`,
      items: publishedItems.map((claim) => ({
        name: claim.title,
        url: `${brandConfig.url}/claimables/${claim.slug}`,
      })),
    }),
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={structuredData} />
      <header className="max-w-3xl">
        <p className="editorial-kicker">Verified public record</p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-text-primary">
          Claimables Directory
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Published refund, compensation and claim opportunities verified against official sources.
          Only records that pass our publication policy are listed — eligibility is always
          determined by the official scheme, never by us.
        </p>
      </header>

      <form method="GET" action="/claimables" className="mt-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Directory filters">
            <div className="sticky top-24 rounded-md border border-border border-l-2 border-l-trust-primary bg-surface p-5 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-text-primary">Filters</h2>
              <div className="space-y-4">
                <FilterFields idPrefix="desktop" params={params} sectors={sectors} />
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 lg:hidden">
              <MobileFilterDrawer activeCount={activeCount}>
                <FilterFields idPrefix="mobile" params={params} sectors={sectors} />
              </MobileFilterDrawer>
            </div>

            <ActiveFilterChips params={params} sectors={sectors} />

            <div className="mt-6">
              {!allOutcome.ok ? (
                <DataUnavailableNotice message={allOutcome.error} />
              ) : (
                <>
                  {allOutcome.demo && <DemoDataBanner />}
                  <DirectoryResults items={allOutcome.data.items} params={params} page={page} demo={allOutcome.demo} />
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function DirectoryResults({
  items,
  params,
  page,
  demo,
}: {
  items: PublishedClaimable[];
  params: DirectoryParams;
  page: number;
  demo: boolean;
}) {
  const filtered = applyClaimableFilters(items, {
    search: params.search,
    status: params.status,
    sectorSlug: params.sector,
  });
  const sorted = sortClaimables(filtered, params.sort ?? 'newest');
  const pageData = paginateClaimables(sorted, page, PAGE_SIZE);

  if (filtered.length === 0) {
    return (
      <EmptyDirectoryNotice
        title={items.length === 0 ? 'No published claimables yet' : 'No records match your filters'}
        body={items.length === 0
          ? 'Records appear here as soon as they pass our verification and publication policy. Check back soon.'
          : 'Try removing a filter or broadening your search. Published records appear here only after they pass the full publication policy.'}
      />
    );
  }

  const start = (pageData.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(pageData.page * PAGE_SIZE, pageData.total);

  return (
    <>
      <p aria-live="polite" className="mb-4 text-sm text-text-muted">
        Showing <span className="font-semibold text-text-secondary">{start}–{end}</span>{' '}
        of <span className="font-semibold text-text-secondary">{pageData.total}</span> published{' '}
        {pageData.total === 1 ? 'record' : 'records'}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pageData.items.map((claim) => <ClaimableCard key={claim.id} claim={claim} />)}
      </div>

      <Pagination
        basePath="/claimables"
        query={{ search: params.search, status: params.status, sector: params.sector, sort: params.sort }}
        page={pageData.page}
        totalPages={pageData.totalPages}
      />

      {!demo && (
        <p className="mt-8 text-center text-xs text-text-muted">
          Records are verified against official sources before publication. Always confirm details
          on the official website before submitting a claim.
        </p>
      )}
    </>
  );
}
