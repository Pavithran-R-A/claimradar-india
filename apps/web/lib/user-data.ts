/**
 * Read-side data access for the authenticated product.
 *
 * All queries run on the user's own session client (anon key + RLS), never a
 * service-role client. Every loader degrades gracefully: when the database is
 * unreachable it returns empty results with `unavailable: true` so pages can
 * render honest empty states instead of failing.
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface LoadStatus {
  /** True when the database could not be reached or returned an error. */
  unavailable: boolean;
}

export interface ClaimableSummary {
  id: string;
  slug: string;
  public_title: string;
  status: string;
  deadline: string | null;
  company_name: string | null;
}

export interface MatchRow {
  id: string;
  claimable_id: string;
  confidence: string;
  match_reasons: { code: string; label: string }[];
  first_matched_at: string;
  last_checked_at: string;
  claimable: ClaimableSummary | null;
}

export interface WatchedCompanyRow {
  id: string;
  created_at: string;
  company_id: string;
  display_name: string;
  slug: string;
}

export interface WatchedSectorRow {
  id: string;
  created_at: string;
  sector_id: string;
  name: string;
  slug: string;
}

export interface TrackerRow {
  id: string;
  claimable_id: string;
  status: string;
  notes: string | null;
  external_reference: string | null;
  updated_at: string;
  created_at: string;
  claimable: ClaimableSummary | null;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface PreferencesRow {
  email_enabled: boolean;
  browser_enabled: boolean;
  whatsapp_enabled: boolean;
  digest_frequency: string;
}

export interface ConsentEventRow {
  id: string;
  consent_type: string;
  granted: boolean;
  created_at: string;
}

export interface ExportRequestRow {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface DeletionRequestRow {
  id: string;
  status: string;
  reason: string | null;
  scheduled_deletion_at: string | null;
  created_at: string;
}

export interface CorrectionRequestRow {
  id: string;
  target: string;
  description: string;
  status: string;
  created_at: string;
}

export interface WithdrawalRequestRow {
  id: string;
  consent_type: string;
  reason: string | null;
  status: string;
  created_at: string;
}

export interface GrievanceRow {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

export interface OnboardingRow {
  companies_used: string[];
  sectors_used: string[];
  purchase_period_start: number | null;
  purchase_period_end: number | null;
  state: string | null;
  receipt_availability: string;
  reference_availability: string;
  notification_preference: string;
}

async function fetchClaimableSummaries(
  claimableIds: string[],
): Promise<Map<string, ClaimableSummary>> {
  const map = new Map<string, ClaimableSummary>();
  if (claimableIds.length === 0) return map;
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('claimables')
    .select('id, slug, public_title, status, deadline, company_id')
    .in('id', claimableIds);
  if (!data) return map;

  const companyIds = [
    ...new Set(
      (data as { company_id: string | null }[]).map((row) => row.company_id).filter(Boolean),
    ),
  ] as string[];

  const companyNames = new Map<string, string>();
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, display_name')
      .in('id', companyIds);
    for (const company of (companies ?? []) as { id: string; display_name: string }[]) {
      companyNames.set(company.id, company.display_name);
    }
  }

  for (const row of data as (ClaimableSummary & { company_id: string | null })[]) {
    map.set(row.id, {
      id: row.id,
      slug: row.slug,
      public_title: row.public_title,
      status: row.status,
      deadline: row.deadline,
      company_name: row.company_id ? (companyNames.get(row.company_id) ?? null) : null,
    });
  }
  return map;
}

/* --------------------------------- Matches -------------------------------- */

export async function getMatches(userId: string): Promise<(MatchRow[] & LoadStatus) | never> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('claim_matches')
      .select('id, claimable_id, confidence, match_reasons, first_matched_at, last_checked_at')
      .eq('user_id', userId)
      .order('last_checked_at', { ascending: false });
    if (error) return Object.assign([], { unavailable: true }) as MatchRow[] & LoadStatus;

    const rows = (data ?? []) as Omit<MatchRow, 'claimable'>[];
    const summaries = await fetchClaimableSummaries(rows.map((r) => r.claimable_id));
    const matches = rows.map((row) => ({
      ...row,
      claimable: summaries.get(row.claimable_id) ?? null,
    }));
    return Object.assign(matches, { unavailable: false }) as MatchRow[] & LoadStatus;
  } catch {
    return Object.assign([], { unavailable: true }) as MatchRow[] & LoadStatus;
  }
}

/* -------------------------------- Watchlist ------------------------------- */

export interface WatchlistData extends LoadStatus {
  companies: WatchedCompanyRow[];
  sectors: WatchedSectorRow[];
}

export async function getWatchlist(userId: string): Promise<WatchlistData> {
  const empty: WatchlistData = { companies: [], sectors: [], unavailable: true };
  try {
    const supabase = await getSupabaseServerClient();
    const [companyWatch, sectorWatch] = await Promise.all([
      supabase
        .from('user_company_watchlists')
        .select('id, company_id, created_at')
        .eq('user_id', userId),
      supabase
        .from('user_sector_watchlists')
        .select('id, sector_id, created_at')
        .eq('user_id', userId),
    ]);
    if (companyWatch.error || sectorWatch.error) return empty;

    const companyRows = (companyWatch.data ?? []) as {
      id: string;
      company_id: string;
      created_at: string;
    }[];
    const sectorRows = (sectorWatch.data ?? []) as {
      id: string;
      sector_id: string;
      created_at: string;
    }[];

    const companyDetails = new Map<string, { display_name: string; slug: string }>();
    if (companyRows.length > 0) {
      const { data } = await supabase
        .from('companies')
        .select('id, display_name, slug')
        .in(
          'id',
          companyRows.map((r) => r.company_id),
        );
      for (const row of (data ?? []) as { id: string; display_name: string; slug: string }[]) {
        companyDetails.set(row.id, row);
      }
    }

    const sectorDetails = new Map<string, { name: string; slug: string }>();
    if (sectorRows.length > 0) {
      const { data } = await supabase
        .from('sectors')
        .select('id, name, slug')
        .in(
          'id',
          sectorRows.map((r) => r.sector_id),
        );
      for (const row of (data ?? []) as { id: string; name: string; slug: string }[]) {
        sectorDetails.set(row.id, row);
      }
    }

    return {
      unavailable: false,
      companies: companyRows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        company_id: row.company_id,
        display_name: companyDetails.get(row.company_id)?.display_name ?? 'Unknown company',
        slug: companyDetails.get(row.company_id)?.slug ?? '',
      })),
      sectors: sectorRows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        sector_id: row.sector_id,
        name: sectorDetails.get(row.sector_id)?.name ?? 'Unknown sector',
        slug: sectorDetails.get(row.sector_id)?.slug ?? '',
      })),
    };
  } catch {
    return empty;
  }
}

/* --------------------------------- Tracker -------------------------------- */

export async function getTrackers(userId: string): Promise<(TrackerRow[] & LoadStatus) | never> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('claim_trackers')
      .select('id, claimable_id, status, notes, external_reference, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) return Object.assign([], { unavailable: true }) as TrackerRow[] & LoadStatus;

    const rows = (data ?? []) as Omit<TrackerRow, 'claimable'>[];
    const summaries = await fetchClaimableSummaries(rows.map((r) => r.claimable_id));
    const trackers = rows.map((row) => ({
      ...row,
      claimable: summaries.get(row.claimable_id) ?? null,
    }));
    return Object.assign(trackers, { unavailable: false }) as TrackerRow[] & LoadStatus;
  } catch {
    return Object.assign([], { unavailable: true }) as TrackerRow[] & LoadStatus;
  }
}

/* ------------------------------- Notifications ---------------------------- */

export async function getNotifications(
  userId: string,
): Promise<(NotificationRow[] & LoadStatus) | never> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return Object.assign([], { unavailable: true }) as NotificationRow[] & LoadStatus;
    return Object.assign((data ?? []) as NotificationRow[], {
      unavailable: false,
    }) as NotificationRow[] & LoadStatus;
  } catch {
    return Object.assign([], { unavailable: true }) as NotificationRow[] & LoadStatus;
  }
}

/* ------------------------------- Preferences ------------------------------ */

export async function getNotificationPreferences(
  userId: string,
): Promise<(PreferencesRow & LoadStatus) | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('email_enabled, browser_enabled, whatsapp_enabled, digest_frequency')
      .eq('user_id', userId)
      .maybeSingle();
    if (error)
      return {
        email_enabled: true,
        browser_enabled: false,
        whatsapp_enabled: false,
        digest_frequency: 'weekly',
        unavailable: true,
      };
    if (!data) return null;
    return { ...(data as PreferencesRow), unavailable: false };
  } catch {
    return {
      email_enabled: true,
      browser_enabled: false,
      whatsapp_enabled: false,
      digest_frequency: 'weekly',
      unavailable: true,
    };
  }
}

/* ---------------------------------- Misc ---------------------------------- */

export interface DirectoryOption {
  id: string;
  name: string;
  slug: string;
}

export async function getPublishedCompanies(): Promise<DirectoryOption[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('companies')
      .select('id, display_name, slug')
      .eq('publication_status', 'published')
      .order('display_name')
      .limit(100);
    return ((data ?? []) as { id: string; display_name: string; slug: string }[]).map((row) => ({
      id: row.id,
      name: row.display_name,
      slug: row.slug,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedClaimableOptions(): Promise<DirectoryOption[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('claimables')
      .select('id, public_title, slug')
      .eq('publication_status', 'published')
      .order('updated_at', { ascending: false })
      .limit(100);
    return ((data ?? []) as { id: string; public_title: string; slug: string }[]).map((row) => ({
      id: row.id,
      name: row.public_title,
      slug: row.slug,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedSectors(): Promise<DirectoryOption[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.from('sectors').select('id, name, slug').order('name');
    return ((data ?? []) as DirectoryOption[]).length > 0 ? (data as DirectoryOption[]) : [];
  } catch {
    return [];
  }
}

/** Recently updated published claimables — surfaced as source-change summary. */
export async function getRecentlyChangedClaimables(
  limit = 5,
): Promise<(ClaimableSummary[] & LoadStatus) | never> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('claimables')
      .select('id, slug, public_title, status, deadline, company_id')
      .eq('publication_status', 'published')
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) return Object.assign([], { unavailable: true }) as ClaimableSummary[] & LoadStatus;

    const rows = (data ?? []) as (ClaimableSummary & { company_id: string | null })[];
    const companyIds = [...new Set(rows.map((r) => r.company_id).filter(Boolean))] as string[];
    const companyNames = new Map<string, string>();
    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, display_name')
        .in('id', companyIds);
      for (const company of (companies ?? []) as { id: string; display_name: string }[]) {
        companyNames.set(company.id, company.display_name);
      }
    }
    const summaries = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      public_title: row.public_title,
      status: row.status,
      deadline: row.deadline,
      company_name: row.company_id ? (companyNames.get(row.company_id) ?? null) : null,
    }));
    return Object.assign(summaries, { unavailable: false }) as ClaimableSummary[] & LoadStatus;
  } catch {
    return Object.assign([], { unavailable: true }) as ClaimableSummary[] & LoadStatus;
  }
}

/* --------------------------------- Privacy -------------------------------- */

export interface PrivacyData extends LoadStatus {
  consentEvents: ConsentEventRow[];
  exportRequests: ExportRequestRow[];
  deletionRequests: DeletionRequestRow[];
  correctionRequests: CorrectionRequestRow[];
  withdrawalRequests: WithdrawalRequestRow[];
  grievances: GrievanceRow[];
}

export async function getPrivacyData(userId: string): Promise<PrivacyData> {
  const unavailable: PrivacyData = {
    unavailable: true,
    consentEvents: [],
    exportRequests: [],
    deletionRequests: [],
    correctionRequests: [],
    withdrawalRequests: [],
    grievances: [],
  };
  try {
    const supabase = await getSupabaseServerClient();
    const [consent, exports, deletions, corrections, withdrawals, grievances] = await Promise.all([
      supabase
        .from('consent_events')
        .select('id, consent_type, granted, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('account_export_requests')
        .select('id, status, created_at, completed_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('account_deletion_requests')
        .select('id, status, reason, scheduled_deletion_at, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_correction_requests')
        .select('id, target, description, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('consent_withdrawal_requests')
        .select('id, consent_type, reason, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('grievance_contacts')
        .select('id, subject, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);
    if (
      consent.error ||
      exports.error ||
      deletions.error ||
      corrections.error ||
      withdrawals.error ||
      grievances.error
    ) {
      return unavailable;
    }
    return {
      unavailable: false,
      consentEvents: (consent.data ?? []) as ConsentEventRow[],
      exportRequests: (exports.data ?? []) as ExportRequestRow[],
      deletionRequests: (deletions.data ?? []) as DeletionRequestRow[],
      correctionRequests: (corrections.data ?? []) as CorrectionRequestRow[],
      withdrawalRequests: (withdrawals.data ?? []) as WithdrawalRequestRow[],
      grievances: (grievances.data ?? []) as GrievanceRow[],
    };
  } catch {
    return unavailable;
  }
}

/* --------------------------------- Profile -------------------------------- */

export interface ProfileRow extends LoadStatus {
  display_name: string | null;
  onboarding_completed: boolean;
}

export async function getProfile(userId: string): Promise<ProfileRow> {
  const fallback: ProfileRow = {
    display_name: null,
    onboarding_completed: false,
    unavailable: true,
  };
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, onboarding_completed')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return fallback;
    return { ...(data as Omit<ProfileRow, 'unavailable'>), unavailable: false };
  } catch {
    return fallback;
  }
}

/* -------------------------------- Onboarding ------------------------------ */

export async function getOnboarding(userId: string): Promise<OnboardingRow | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from('user_onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return (data as OnboardingRow | null) ?? null;
  } catch {
    return null;
  }
}
