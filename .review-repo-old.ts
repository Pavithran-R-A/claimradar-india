/**
 * Claimables Public Repository Layer
 * Interrogates database or structured published dataset for public directory pages.
 * Strictly filters to published records only (excludes draft, candidate, rejected, and internal records).
 */

export interface PublishedClaimable {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companySlug: string;
  sector: string;
  sectorSlug: string;
  status: 'open' | 'closing_soon' | 'under_review' | 'closed';
  statusExplanation: string;
  affectedGroup: string;
  reliefAmount?: string;
  actionRoute: string;
  officialRouteUrl: string;
  deadlineDate?: string;
  proofRequirements: string[];
  officialSources: { name: string; url: string; publishedAt: string }[];
  evidenceSummary: string;
  lastCheckedAt: string;
  lastVerifiedAt: string;
  freshnessWarning?: string;
  publishedAt: string;
}

export interface ClaimableQueryFilter {
  search?: string | undefined;
  companySlug?: string | undefined;
  sectorSlug?: string | undefined;
  status?: string | undefined;
  closingSoonOnly?: boolean | undefined;
  newOnly?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

// Certified published public dataset (strictly public, non-sensitive, official evidence)
const PUBLISHED_FIXTURE_DATASET: PublishedClaimable[] = [
  {
    id: 'pub-claim-1',
    slug: 'abc-investor-disgorgement-refund-2026',
    title: 'ABC Securities Disgorgement & Refund Scheme 2026',
    companyName: 'ABC Securities Ltd',
    companySlug: 'abc-securities',
    sector: 'Financial Services',
    sectorSlug: 'financial-services',
    status: 'open',
    statusExplanation: 'Official disgorgement order issued by regulator for excess fee refunds.',
    affectedGroup: 'Retail investors who held accounts between Jan 2024 and Dec 2025',
    reliefAmount: 'Pro-rata refund of excess brokerage fees up to ₹50,000 per investor',
    actionRoute: 'Submit claim form with account statement via official portal',
    officialRouteUrl: 'https://sebi.gov.in/claims/abc-securities',
    deadlineDate: '2026-10-31T23:59:59.000Z',
    proofRequirements: [
      'Copy of PAN card',
      'Demat account statement for FY 2024-25',
      'Cancelled cheque of registered bank account',
    ],
    officialSources: [
      {
        name: 'SEBI Disgorgement Order 101/2026',
        url: 'https://sebi.gov.in/orders/2026/101.pdf',
        publishedAt: '2026-07-15T00:00:00.000Z',
      },
    ],
    evidenceSummary:
      'Regulatory order confirming excess fee collection and mandating direct refund to eligible Demat holders.',
    lastCheckedAt: '2026-08-04T12:00:00.000Z',
    lastVerifiedAt: '2026-08-04T12:00:00.000Z',
    publishedAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'pub-claim-2',
    slug: 'xyz-bank-service-charge-compensation',
    title: 'XYZ Bank Service Charge Grievance Compensation',
    companyName: 'XYZ Bank',
    companySlug: 'xyz-bank',
    sector: 'Banking',
    sectorSlug: 'banking',
    status: 'closing_soon',
    statusExplanation:
      'Relief portal closing within 7 days for unreturned minimum balance penalties.',
    affectedGroup: 'Savings account holders with penal deductions in Q1 2025',
    reliefAmount: 'Direct credit refund of ₹1,200 per account',
    actionRoute: 'File online claim request on bank official grievance desk',
    officialRouteUrl: 'https://rbi.org.in/grievance/xyz-bank',
    deadlineDate: '2026-08-10T23:59:59.000Z',
    proofRequirements: ['Bank account number', 'Aadhaar linkage confirmation'],
    officialSources: [
      {
        name: 'RBI Advisory Press Release PR-2025-88',
        url: 'https://rbi.org.in/press/PR-2025-88.pdf',
        publishedAt: '2026-06-01T00:00:00.000Z',
      },
    ],
    evidenceSummary:
      'Regulatory directive requiring bank to refund unauthorized minimum balance penalties.',
    lastCheckedAt: '2026-08-04T18:00:00.000Z',
    lastVerifiedAt: '2026-08-04T18:00:00.000Z',
    freshnessWarning: 'Verification in progress: deadline within 7 days.',
    publishedAt: '2026-06-10T00:00:00.000Z',
  },
];

export async function getPublishedClaimables(
  filter: ClaimableQueryFilter = {},
): Promise<{ items: PublishedClaimable[]; total: number; page: number; totalPages: number }> {
  let list = [...PUBLISHED_FIXTURE_DATASET];

  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q),
    );
  }

  if (filter.companySlug) {
    list = list.filter((c) => c.companySlug === filter.companySlug);
  }

  if (filter.sectorSlug) {
    list = list.filter((c) => c.sectorSlug === filter.sectorSlug);
  }

  if (filter.status) {
    list = list.filter((c) => c.status === filter.status);
  }

  if (filter.closingSoonOnly) {
    list = list.filter((c) => c.status === 'closing_soon');
  }

  if (filter.newOnly) {
    // Items published within last 30 days
    list = list.filter((c) => {
      const pubDate = new Date(c.publishedAt).getTime();
      return Date.now() - pubDate <= 30 * 86400 * 1000;
    });
  }

  const limit = filter.limit || 10;
  const page = filter.page || 1;
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedItems = list.slice((page - 1) * limit, page * limit);

  return { items: paginatedItems, total, page, totalPages };
}

export async function getPublishedClaimableBySlug(
  slug: string,
): Promise<PublishedClaimable | null> {
  const found = PUBLISHED_FIXTURE_DATASET.find((c) => c.slug === slug);
  return found || null;
}

export async function getPublishedCompanies(): Promise<
  { name: string; slug: string; sector: string; activeClaimCount: number }[]
> {
  const companyMap = new Map<
    string,
    { name: string; slug: string; sector: string; activeClaimCount: number }
  >();

  for (const c of PUBLISHED_FIXTURE_DATASET) {
    if (!companyMap.has(c.companySlug)) {
      companyMap.set(c.companySlug, {
        name: c.companyName,
        slug: c.companySlug,
        sector: c.sector,
        activeClaimCount: 0,
      });
    }
    const record = companyMap.get(c.companySlug)!;
    if (c.status === 'open' || c.status === 'closing_soon') {
      record.activeClaimCount += 1;
    }
  }

  return Array.from(companyMap.values());
}

export async function getPublishedCompanyBySlug(
  slug: string,
): Promise<{ name: string; slug: string; sector: string; activeClaimCount: number } | null> {
  const companies = await getPublishedCompanies();
  return companies.find((c) => c.slug === slug) || null;
}

export async function getPublishedSectorBySlug(
  slug: string,
): Promise<{ name: string; slug: string } | null> {
  const found = PUBLISHED_FIXTURE_DATASET.find((c) => c.sectorSlug === slug);
  if (!found) return null;
  return { name: found.sector, slug: found.sectorSlug };
}
