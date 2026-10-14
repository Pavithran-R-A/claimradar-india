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
import { OfficialNoticesPreview } from '@/components/directory/official-notices-preview';
import { OfficialRecoveryRoutes } from '@/components/directory/official-recovery-routes';
import {
  ActiveFilterChips,
  FilterFields,
  type DirectoryParams,
} from '@/components/directory/filters';
import { MobileFilterDrawer } from '@/components/directory/mobile-filter-drawer';
import { Pagination } from '@/components/directory/pagination';
import { JsonLd } from '@/components/seo/json-ld';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sortClaimablesByPreference, type ClaimPreference } from '@/lib/claimable-preferences';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Find Refunds, Unclaimed Money & Claim Opportunities | ClaimKhoj India',
  description:
    'Find official recovery routes for bank deposits, insurance, dividends, tax refunds, EPF and consumer disputes, plus independently reviewed refund notices.',
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

function sortClaimables(
  items: PublishedClaimable[],
  sort: string,
  prefs: ClaimPreference,
): PublishedClaimable[] {
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
    return sortClaimablesByPreference(list, prefs);
  }
  return list;
}

/** Viewer preferences are optional ranking hints, never access controls or filters. */
async function getViewerPreferences(): Promise<ClaimPreference> {
  const empty: ClaimPreference = { companies: [], sectors: [] };
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return empty;
    const { data, error } = await supabase
      .from('user_onboarding_responses')
      .select('companies_used, sectors_used')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !data) return empty;
    return {
      companies: Array.isArray(data.companies_used) ? data.companies_used : [],
      sectors: Array.isArray(data.sectors_used) ? data.sectors_used : [],
    };
  } catch {
    return empty; // Public directory remains available even if personalization fails.
  }
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
  const viewerPreferences = await getViewerPreferences();
  const sectors = sectorsOutcome.ok ? sectorsOutcome.data : [];
  const activeCount = [params.search, params.status, params.sector].filter(Boolean).length;

  const publishedItems = allOutcome.ok && !allOutcome.demo ? allOutcome.data.items : [];
  const structuredData = [
    buildCollectionPageJsonLd({
      name: 'ClaimKhoj Claimables Directory',
      url: `${brandConfig.url}/claimables`,
      description:
        'Published refund, compensation and claim opportunities verified from official Indian sources.',
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
        <p className="editorial-kicker">India money recovery guide</p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-text-primary">
          Find refunds and unclaimed money
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Start with the official route for your situation. Below, you can also review government
          refund notices and any independently approved ClaimKhoj claim opportunities. ClaimKhoj
          cannot determine your eligibility, and claims are completed on official portals.
        </p>
      </header>

      <OfficialRecoveryRoutes search={params.search ?? ''} />

      {!allOutcome.ok ? (
        <div className="mt-9">
          <DataUnavailableNotice message={allOutcome.error} />
        </div>
      ) : !allOutcome.demo && allOutcome.data.items.length === 0 ? (
        <div className="mt-10">
          <form
            method="GET"
            action="/claimables"
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="monitored-notice-search"
                className="mb-2 block text-sm font-semibold text-text-primary"
              >
                Search monitored government refund notices
              </label>
              <input
                id="monitored-notice-search"
                name="search"
                type="search"
                defaultValue={params.search ?? ''}
                placeholder="Search by company or refund matter"
                className="h-11 w-full rounded-field border border-border bg-surface px-3 text-sm text-text-primary"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-field bg-trust-primary px-5 text-sm font-semibold text-white hover:bg-trust-primary-hover"
            >
              Search notices
            </button>
          </form>
          <div className="mt-5">
            <OfficialNoticesPreview search={params.search ?? ''} />
          </div>
        </div>
      ) : (
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
                {allOutcome.demo && <DemoDataBanner />}
                <DirectoryResults
                  items={allOutcome.data.items}
                  params={params}
                  page={page}
                  demo={allOutcome.demo}
                  preferences={viewerPreferences}
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function DirectoryResults({
  items,
  params,
  page,
  demo,
  preferences,
}: {
  items: PublishedClaimable[];
  params: DirectoryParams;
  page: number;
  demo: boolean;
  preferences: ClaimPreference;
}) {
  const filtered = applyClaimableFilters(items, {
    search: params.search,
    status: params.status,
    sectorSlug: params.sector,
  });
  const sorted = sortClaimables(filtered, params.sort ?? 'newest', preferences);
  const pageData = paginateClaimables(sorted, page, PAGE_SIZE);

  if (filtered.length === 0) {
    return (
      <EmptyDirectoryNotice
        title={items.length === 0 ? 'No published claimables yet' : 'No records match your filters'}
        body={
          items.length === 0
            ? 'Records appear here as soon as they pass our verification and publication policy. Check back soon.'
            : 'Try removing a filter or broadening your search. Published records appear here only after they pass the full publication policy.'
        }
      />
    );
  }

  const start = (pageData.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(pageData.page * PAGE_SIZE, pageData.total);

  return (
    <>
      <p aria-live="polite" className="mb-4 text-sm text-text-muted">
        Showing{' '}
        <span className="font-semibold text-text-secondary">
          {start}–{end}
        </span>{' '}
        of <span className="font-semibold text-text-secondary">{pageData.total}</span> published{' '}
        {pageData.total === 1 ? 'record' : 'records'}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pageData.items.map((claim) => (
          <ClaimableCard key={claim.id} claim={claim} />
        ))}
      </div>

      <Pagination
        basePath="/claimables"
        query={{
          search: params.search,
          status: params.status,
          sector: params.sector,
          sort: params.sort,
        }}
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
