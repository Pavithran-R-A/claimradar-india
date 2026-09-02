/**
 * Claimables Public Repository Layer
 *
 * Server-side data access for the public directory pages. Queries Supabase
 * with a service-role client (server-only — never imported from client
 * components) and exposes ONLY records that satisfy the publication policy:
 *
 *   publication_status = 'published'
 *   AND status in the public-safe set
 *       (verified_claimable | official_update | potential_claimable)
 *
 * Content-integrity rules enforced here:
 *  - No fictional fallback data is ever returned as real. When the database
 *    is unreachable or unconfigured, callers receive an error outcome.
 *  - When the database has no published records, callers receive an honest
 *    empty result.
 *  - Demo records are returned ONLY when `ENABLE_DEMO_DATA=true` is set and
 *    the app is not running in production. Outcomes carrying demo data are
 *    flagged with `demo: true` so pages render a visible label.
 */

import { z } from 'zod';
import { calculateDeadlineStatus } from '@claimradar/shared-types';
import { getAdminDb } from './admin-db';
import { DEMO_CLAIMABLES } from './demo-claimables';

/* -------------------------------------------------------------------------- */
/*  Public types                                                               */
/* -------------------------------------------------------------------------- */

export interface PublishedClaimable {
  id: string;
  slug: string;
  title: string;
  authority: string;
  companyName: string;
  companySlug: string;
  sector: string;
  sectorSlug: string;
  /** Derived display status used by directory UI. */
  status: DisplayStatus;
  /** Human-readable label of the underlying claim status. */
  statusDetail: string;
  statusExplanation: string;
  affectedGroup: string;
  reliefAmount?: string | undefined;
  actionRoute: string;
  /** May be empty when no official claim URL is recorded. */
  officialRouteUrl: string;
  deadlineDate?: string | undefined;
  proofRequirements: string[];
  officialSources: { name: string; url: string; publishedAt: string }[];
  evidenceSummary: string;
  lastCheckedAt: string;
  lastVerifiedAt: string;
  freshnessWarning?: string | undefined;
  publishedAt: string;
  geographicScope?: string | undefined;
  jurisdiction?: string | undefined;
}

export type DisplayStatus = 'open' | 'closing_soon' | 'under_review' | 'closed';

export interface CompanySummary {
  name: string;
  slug: string;
  sector: string;
  activeClaimCount: number;
}

export interface SectorSummary {
  name: string;
  slug: string;
  activeClaimCount: number;
}

export interface StateSummary {
  name: string;
  slug: string;
  claimCount: number;
}

export interface ClaimableQueryFilter {
  search?: string | undefined;
  companySlug?: string | undefined;
  sectorSlug?: string | undefined;
  status?: string | undefined;
  closingSoonOnly?: boolean | undefined;
  newOnly?: boolean | undefined;
  stateSlug?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ClaimablesPage {
  items: PublishedClaimable[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Discriminated result of a repository call.
 * `demo: true` means every record in `data` is clearly-labelled demo data.
 */
export type RepositoryOutcome<T> =
  { ok: true; data: T; demo: boolean } | { ok: false; error: string; demo: false };

/* -------------------------------------------------------------------------- */
/*  Publication policy (public-safe set)                                       */
/* -------------------------------------------------------------------------- */

/**
 * Claim statuses that may appear on the public site once a record is
 * published. Matches docs/publication-policy.md and docs/claim-taxonomy.md:
 * the pipeline auto-publishes official_update / potential_claimable, and
 * verified_claimable is reached only through editorial + legal sign-off.
 */
export const PUBLIC_SAFE_STATUSES = [
  'verified_claimable',
  'official_update',
  'potential_claimable',
] as const;

export type PublicSafeStatus = (typeof PUBLIC_SAFE_STATUSES)[number];

/** Pure publication gate used by the repository and unit tests. */
export function isPubliclyPublishable(
  status: string | null | undefined,
  publicationStatus: string | null | undefined,
): status is PublicSafeStatus {
  if (publicationStatus !== 'published') return false;
  return (PUBLIC_SAFE_STATUSES as readonly string[]).includes(status ?? '');
}

const STATUS_DETAIL_LABELS: Record<PublicSafeStatus, string> = {
  verified_claimable: 'Verified claimable',
  official_update: 'Official update',
  potential_claimable: 'Potential claimable',
};

/* -------------------------------------------------------------------------- */
/*  Display-status derivation                                                  */
/* -------------------------------------------------------------------------- */

const NEW_WINDOW_MS = 30 * 86400 * 1000;
const STALE_VERIFICATION_MS = 14 * 86400 * 1000;

export function deriveDisplayStatus(params: {
  claimStatus: string;
  deadline: string | null | undefined;
  now?: Date;
}): DisplayStatus {
  if (params.claimStatus === 'closed') return 'closed';
  if (params.deadline) {
    const deadlineCalc = calculateDeadlineStatus(params.deadline, { clockDate: params.now });
    if (deadlineCalc.status === 'EXPIRED') return 'closed';
    if (deadlineCalc.isClosingSoon) return 'closing_soon';
  }
  if (params.claimStatus === 'potential_claimable') return 'under_review';
  return 'open';
}

/* -------------------------------------------------------------------------- */
/*  Row validation & mapping (Zod at the DB boundary)                          */
/* -------------------------------------------------------------------------- */

const sourceLinkSchema = z.object({
  source_documents: z
    .object({
      canonical_url: z.string().min(1),
      title: z.string().nullable().optional(),
      published_at: z.string().nullable().optional(),
    })
    .nullable(),
});

const claimableRowSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  public_title: z.string().min(1),
  summary: z.string().nullable(),
  status: z.string(),
  authority: z.string().nullable(),
  jurisdiction: z.string().nullable(),
  affected_group: z.string().nullable(),
  geographic_scope: z.string().nullable(),
  relief_description: z.string().nullable(),
  official_amount: z.union([z.string(), z.number()]).nullable(),
  amount_currency: z.string().nullable(),
  proof_requirements: z.array(z.string()),
  action_required: z.string().nullable(),
  official_claim_url: z.string().nullable(),
  deadline: z.string().nullable(),
  first_published_at: z.string().nullable(),
  last_verified_at: z.string().nullable(),
  updated_at: z.string(),
  companies: z
    .object({
      display_name: z.string(),
      slug: z.string(),
      sectors: z.object({ name: z.string(), slug: z.string() }).nullable(),
    })
    .nullable(),
  claim_sources: z.array(sourceLinkSchema),
});

export type ClaimableRow = z.infer<typeof claimableRowSchema>;

function formatReliefAmount(row: ClaimableRow): string | undefined {
  if (row.relief_description) return row.relief_description;
  if (row.official_amount === null || row.official_amount === undefined) return undefined;
  const currency = row.amount_currency ?? 'INR';
  return currency === 'INR' ? `₹${row.official_amount}` : `${currency} ${row.official_amount}`;
}

function buildStatusExplanation(row: ClaimableRow): string {
  if (row.summary) return row.summary;
  const authority = row.authority ? ` by ${row.authority}` : '';
  switch (row.status) {
    case 'verified_claimable':
      return `Verified claimable confirmed through the full publication pipeline${authority}.`;
    case 'official_update':
      return `Official update confirmed from an authoritative source${authority}.`;
    case 'potential_claimable':
      return `Potential claim pathway identified from official sources${authority}. Follow the official route to confirm eligibility.`;
    default:
      return 'Published claim record.';
  }
}

function buildFreshnessWarning(row: ClaimableRow, now: Date): string | undefined {
  if (row.deadline) {
    const deadlineCalc = calculateDeadlineStatus(row.deadline, { clockDate: now });
    if (deadlineCalc.isClosingSoon) {
      return 'Deadline falls within 7 days. Re-verify directly with the official source before acting.';
    }
  }
  if (!row.last_verified_at) {
    return 'Verification timestamp unavailable. Re-check the linked official sources before acting.';
  }
  const verifiedMs = new Date(row.last_verified_at).getTime();
  if (!Number.isNaN(verifiedMs) && now.getTime() - verifiedMs > STALE_VERIFICATION_MS) {
    return 'Last verified more than 14 days ago. Re-check the linked official sources before acting.';
  }
  return undefined;
}

/** Maps a validated database row to the public view model. Pure + testable. */
export function mapClaimableRow(row: ClaimableRow, now: Date = new Date()): PublishedClaimable {
  const company = row.companies;
  const sector = company?.sectors ?? null;
  const displayStatus = deriveDisplayStatus({
    claimStatus: row.status,
    deadline: row.deadline,
    now,
  });
  const safeStatus = (
    (PUBLIC_SAFE_STATUSES as readonly string[]).includes(row.status)
      ? row.status
      : 'official_update'
  ) as PublicSafeStatus;

  return {
    id: row.id,
    slug: row.slug,
    title: row.public_title,
    authority: row.authority ?? 'Issuing authority',
    companyName: company?.display_name ?? 'Unknown entity',
    companySlug: company?.slug ?? '',
    sector: sector?.name ?? 'Unspecified sector',
    sectorSlug: sector?.slug ?? 'unspecified',
    status: displayStatus,
    statusDetail: STATUS_DETAIL_LABELS[safeStatus],
    statusExplanation: buildStatusExplanation(row),
    affectedGroup: row.affected_group ?? 'See the linked official source for eligibility details.',
    reliefAmount: formatReliefAmount(row),
    actionRoute:
      row.action_required ??
      'Follow the official claim or grievance route of the issuing authority.',
    officialRouteUrl: row.official_claim_url ?? '',
    deadlineDate: row.deadline ?? undefined,
    proofRequirements: row.proof_requirements,
    officialSources: row.claim_sources
      .filter((link) => link.source_documents !== null)
      .map((link) => {
        const doc = link.source_documents;
        return {
          name: doc?.title || doc?.canonical_url || 'Official source document',
          url: doc?.canonical_url ?? '',
          publishedAt: doc?.published_at ?? '',
        };
      })
      .filter((src) => src.url.length > 0),
    evidenceSummary: row.summary ?? '',
    lastCheckedAt: row.updated_at,
    lastVerifiedAt: row.last_verified_at ?? row.updated_at,
    freshnessWarning: buildFreshnessWarning(row, now),
    publishedAt: row.first_published_at ?? row.updated_at,
    geographicScope: row.geographic_scope ?? undefined,
    jurisdiction: row.jurisdiction ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Pure filtering / pagination / association derivation                       */
/* -------------------------------------------------------------------------- */

/** Indian states + union territories recognised by the /states directory. */
export const INDIAN_STATES: { name: string; slug: string }[] = [
  { name: 'Andhra Pradesh', slug: 'andhra-pradesh' },
  { name: 'Assam', slug: 'assam' },
  { name: 'Bihar', slug: 'bihar' },
  { name: 'Chhattisgarh', slug: 'chhattisgarh' },
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Goa', slug: 'goa' },
  { name: 'Gujarat', slug: 'gujarat' },
  { name: 'Haryana', slug: 'haryana' },
  { name: 'Himachal Pradesh', slug: 'himachal-pradesh' },
  { name: 'Jharkhand', slug: 'jharkhand' },
  { name: 'Karnataka', slug: 'karnataka' },
  { name: 'Kerala', slug: 'kerala' },
  { name: 'Madhya Pradesh', slug: 'madhya-pradesh' },
  { name: 'Maharashtra', slug: 'maharashtra' },
  { name: 'Odisha', slug: 'odisha' },
  { name: 'Punjab', slug: 'punjab' },
  { name: 'Rajasthan', slug: 'rajasthan' },
  { name: 'Tamil Nadu', slug: 'tamil-nadu' },
  { name: 'Telangana', slug: 'telangana' },
  { name: 'Uttar Pradesh', slug: 'uttar-pradesh' },
  { name: 'Uttarakhand', slug: 'uttarakhand' },
  { name: 'West Bengal', slug: 'west-bengal' },
];

function stateMatches(state: { name: string }, item: PublishedClaimable): boolean {
  const haystack = `${item.geographicScope ?? ''} ${item.jurisdiction ?? ''}`.toLowerCase();
  return haystack.includes(state.name.toLowerCase());
}

export function applyClaimableFilters(
  items: PublishedClaimable[],
  filter: ClaimableQueryFilter,
  now: Date = new Date(),
): PublishedClaimable[] {
  let list = items;

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
    list = list.filter((c) => {
      if (c.status === 'closed') return false;
      if (!c.deadlineDate) return false;
      return calculateDeadlineStatus(c.deadlineDate, { clockDate: now }).isClosingSoon;
    });
  }
  if (filter.newOnly) {
    list = list.filter((c) => {
      const publishedMs = new Date(c.publishedAt).getTime();
      return !Number.isNaN(publishedMs) && now.getTime() - publishedMs <= NEW_WINDOW_MS;
    });
  }
  if (filter.stateSlug) {
    const state = INDIAN_STATES.find((s) => s.slug === filter.stateSlug);
    list = state ? list.filter((c) => stateMatches(state, c)) : [];
  }
  return list;
}

export function paginateClaimables(
  items: PublishedClaimable[],
  page = 1,
  limit = 10,
): ClaimablesPage {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  return {
    items: items.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    total,
    page: safePage,
    totalPages,
  };
}

/** Companies derived strictly from published claimables (no standalone rows). */
export function deriveCompanies(items: PublishedClaimable[]): CompanySummary[] {
  const map = new Map<string, CompanySummary>();
  for (const c of items) {
    if (!c.companySlug) continue;
    const existing = map.get(c.companySlug);
    if (!existing) {
      map.set(c.companySlug, {
        name: c.companyName,
        slug: c.companySlug,
        sector: c.sector,
        activeClaimCount: c.status === 'closed' ? 0 : 1,
      });
    } else if (c.status !== 'closed') {
      existing.activeClaimCount += 1;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Sectors derived strictly from published claimables. */
export function deriveSectors(items: PublishedClaimable[]): SectorSummary[] {
  const map = new Map<string, SectorSummary>();
  for (const c of items) {
    const existing = map.get(c.sectorSlug);
    if (!existing) {
      map.set(c.sectorSlug, {
        name: c.sector,
        slug: c.sectorSlug,
        activeClaimCount: c.status === 'closed' ? 0 : 1,
      });
    } else if (c.status !== 'closed') {
      existing.activeClaimCount += 1;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** States derived from geographic scope / jurisdiction of published records. */
export function deriveStates(items: PublishedClaimable[]): StateSummary[] {
  return INDIAN_STATES.map((state) => ({
    name: state.name,
    slug: state.slug,
    claimCount: items.filter((c) => stateMatches(state, c)).length,
  }))
    .filter((state) => state.claimCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* -------------------------------------------------------------------------- */
/*  Database access (service-role, server-only)                                */
/* -------------------------------------------------------------------------- */

interface DbQueryOutcome {
  data: unknown;
  error: { message: string } | null;
}

/** Minimal structural view of the service-role Supabase client. */
export interface DbQueryBuilder extends PromiseLike<DbQueryOutcome> {
  eq(column: string, value: string): DbQueryBuilder;
  in(column: string, values: readonly string[]): DbQueryBuilder;
}

export interface DbClient {
  from(table: string): {
    select(columns: string): DbQueryBuilder;
  };
}

export type DbClientFactory = () => DbClient;

const CLAIMABLES_SELECT = `
  id, slug, public_title, summary, status, authority, jurisdiction,
  affected_group, geographic_scope, relief_description, official_amount,
  amount_currency, proof_requirements, action_required, official_claim_url,
  deadline, first_published_at, last_verified_at, updated_at,
  companies ( display_name, slug, sectors ( name, slug ) ),
  claim_sources ( source_documents ( canonical_url, title, published_at ) )
` as const;

function defaultDbClientFactory(): DbClient {
  // getAdminDb() is an intentional typed-boundary (see lib/admin-db.ts);
  // it throws when Supabase env vars are missing, which the caller converts
  // into an honest error outcome.
  return getAdminDb() as DbClient;
}

let dbClientFactory: DbClientFactory = defaultDbClientFactory;

/** Test hook: inject a fake client. Never used in application code. */
export function __setDbClientFactoryForTests(factory: DbClientFactory): void {
  dbClientFactory = factory;
}

/** Test hook: restore the real client factory. */
export function __resetDbClientFactoryForTests(): void {
  dbClientFactory = defaultDbClientFactory;
}

type RowsOutcome = { ok: true; rows: ClaimableRow[] } | { ok: false; error: string };

async function fetchPublishedRows(): Promise<RowsOutcome> {
  let client: DbClient;
  try {
    client = dbClientFactory();
  } catch {
    return {
      ok: false,
      error:
        'The claims database is not configured for this deployment. Published claimables will appear once the data pipeline is connected.',
    };
  }

  let outcome: DbQueryOutcome;
  try {
    outcome = await client
      .from('claimables')
      .select(CLAIMABLES_SELECT.replace(/\s+/g, ' ').trim())
      .eq('publication_status', 'published')
      .in('status', PUBLIC_SAFE_STATUSES);
  } catch {
    return {
      ok: false,
      error: 'The claims database is currently unreachable. Please try again shortly.',
    };
  }

  if (outcome.error) {
    return {
      ok: false,
      error: 'The claims database returned an error while loading published records.',
    };
  }

  if (!Array.isArray(outcome.data)) {
    return { ok: true, rows: [] };
  }

  const rows: ClaimableRow[] = [];
  for (const raw of outcome.data) {
    const parsed = claimableRowSchema.safeParse(normaliseRow(raw));
    if (parsed.success) {
      if (isPubliclyPublishable(parsed.data.status, 'published')) {
        rows.push(parsed.data);
      }
    } else {
      // Skip malformed rows rather than guessing at their content.
      console.warn('[claimables-repository] Skipping malformed claimable row', parsed.error.issues);
    }
  }
  return { ok: true, rows };
}

/** Applies defensive defaults to loosely-typed JSONB/nullable columns. */
function normaliseRow(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  const record = raw as Record<string, unknown>;
  return {
    ...record,
    proof_requirements: Array.isArray(record.proof_requirements) ? record.proof_requirements : [],
    claim_sources: Array.isArray(record.claim_sources) ? record.claim_sources : [],
  };
}

/* -------------------------------------------------------------------------- */
/*  Demo-data gating                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Demo records are permitted only behind an explicit flag AND never in a
 * production build. Pages still render a visible "Demo data" banner.
 */
export function isDemoDataEnabled(): boolean {
  return process.env.ENABLE_DEMO_DATA === 'true' && process.env.NODE_ENV !== 'production';
}

/* -------------------------------------------------------------------------- */
/*  Public repository API                                                      */
/* -------------------------------------------------------------------------- */

async function loadAllPublished(): Promise<
  | { ok: true; items: PublishedClaimable[]; demo: boolean }
  | { ok: false; error: string; demo: false }
> {
  const rows = await fetchPublishedRows();

  if (rows.ok && rows.rows.length > 0) {
    return { ok: true, items: rows.rows.map((row) => mapClaimableRow(row)), demo: false };
  }

  if (isDemoDataEnabled()) {
    return { ok: true, items: DEMO_CLAIMABLES, demo: true };
  }

  if (!rows.ok) {
    return { ok: false, error: rows.error, demo: false };
  }
  return { ok: true, items: [], demo: false };
}

export async function getPublishedClaimables(
  filter: ClaimableQueryFilter = {},
): Promise<RepositoryOutcome<ClaimablesPage>> {
  const loaded = await loadAllPublished();
  if (!loaded.ok) return loaded;

  const filtered = applyClaimableFilters(loaded.items, filter);
  const pageData = paginateClaimables(filtered, filter.page ?? 1, filter.limit ?? 10);
  return { ok: true, data: pageData, demo: loaded.demo };
}

export async function getPublishedClaimableBySlug(
  slug: string,
): Promise<RepositoryOutcome<PublishedClaimable | null>> {
  const loaded = await loadAllPublished();
  if (!loaded.ok) return loaded;
  return { ok: true, data: loaded.items.find((c) => c.slug === slug) ?? null, demo: loaded.demo };
}

export async function getPublishedCompanies(): Promise<RepositoryOutcome<CompanySummary[]>> {
  const loaded = await loadAllPublished();
  if (!loaded.ok) return loaded;
  return { ok: true, data: deriveCompanies(loaded.items), demo: loaded.demo };
}

export async function getPublishedCompanyBySlug(
  slug: string,
): Promise<RepositoryOutcome<CompanySummary | null>> {
  const companies = await getPublishedCompanies();
  if (!companies.ok) return companies;
  return {
    ok: true,
    data: companies.data.find((c) => c.slug === slug) ?? null,
    demo: companies.demo,
  };
}

export async function getPublishedSectors(): Promise<RepositoryOutcome<SectorSummary[]>> {
  const loaded = await loadAllPublished();
  if (!loaded.ok) return loaded;
  return { ok: true, data: deriveSectors(loaded.items), demo: loaded.demo };
}

export async function getPublishedSectorBySlug(
  slug: string,
): Promise<RepositoryOutcome<SectorSummary | null>> {
  const sectors = await getPublishedSectors();
  if (!sectors.ok) return sectors;
  return { ok: true, data: sectors.data.find((s) => s.slug === slug) ?? null, demo: sectors.demo };
}

export async function getPublishedStates(): Promise<RepositoryOutcome<StateSummary[]>> {
  const loaded = await loadAllPublished();
  if (!loaded.ok) return loaded;
  return { ok: true, data: deriveStates(loaded.items), demo: loaded.demo };
}

export async function getPublishedStateBySlug(
  slug: string,
): Promise<RepositoryOutcome<StateSummary | null>> {
  const states = await getPublishedStates();
  if (!states.ok) return states;
  return { ok: true, data: states.data.find((s) => s.slug === slug) ?? null, demo: states.demo };
}
