/**
 * Server-side orchestration of the deterministic matching engine.
 *
 * Loads the user's low-risk onboarding answers and all published claimables,
 * scores each pair with the pure rule engine (lib/matching.ts — never an LLM),
 * and upserts the outcomes into claim_matches. Runs with the user's own
 * Supabase session client so RLS enforces ownership.
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { scoreMatch, type ClaimableForMatching, type UserProfileForMatching } from '@/lib/matching';

interface OnboardingRow {
  user_id: string;
  companies_used: string[];
  sectors_used: string[];
  purchase_period_start: number | null;
  purchase_period_end: number | null;
  state: string | null;
  receipt_availability: 'yes' | 'no' | 'unsure';
  reference_availability: 'yes' | 'no' | 'unsure';
}

interface ClaimableRow {
  id: string;
  company_id: string | null;
  relevant_period_start: string | null;
  relevant_period_end: string | null;
  geographic_scope: string | null;
  proof_requirements: unknown[];
}

interface CompanyRow {
  id: string;
  display_name: string;
  aliases: string[] | null;
  sector_id: string | null;
}

interface SectorRow {
  id: string;
  name: string;
}

export interface MatchingRunResult {
  evaluated: number;
  upserted: number;
}

function toUserProfile(row: OnboardingRow): UserProfileForMatching {
  return {
    companiesUsed: row.companies_used ?? [],
    sectorsUsed: row.sectors_used ?? [],
    purchasePeriodStart: row.purchase_period_start,
    purchasePeriodEnd: row.purchase_period_end,
    state: row.state,
    receiptAvailability: row.receipt_availability,
    referenceAvailability: row.reference_availability,
  };
}

function toProofRequirements(raw: unknown[]): string[] {
  return raw
    .map((entry) => (typeof entry === 'string' ? entry : ''))
    .filter((entry) => entry.length > 0);
}

/**
 * Recompute matches for the current user and persist outcomes.
 * Returns counts on success or a stable error code string on failure.
 */
export async function runMatchingForUser(
  userId: string,
): Promise<{ ok: true; result: MatchingRunResult } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerClient();

  const { data: onboardingRow, error: onboardingError } = await supabase
    .from('user_onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (onboardingError) return { ok: false, error: 'onboarding_load_failed' };
  if (!onboardingRow) return { ok: false, error: 'onboarding_missing' };

  const { data: claimableRows, error: claimablesError } = await supabase
    .from('claimables')
    .select(
      'id, company_id, relevant_period_start, relevant_period_end, geographic_scope, proof_requirements',
    )
    .eq('publication_status', 'published');

  if (claimablesError) return { ok: false, error: 'claimables_load_failed' };

  const claimables = (claimableRows ?? []) as unknown as ClaimableRow[];
  const companyIds = [...new Set(claimables.map((c) => c.company_id).filter((id) => id !== null))];

  const companiesById = new Map<string, CompanyRow>();
  const sectorsById = new Map<string, SectorRow>();

  if (companyIds.length > 0) {
    const { data: companyRows, error: companiesError } = await supabase
      .from('companies')
      .select('id, display_name, aliases, sector_id')
      .in('id', companyIds);
    if (!companiesError && companyRows) {
      for (const row of companyRows as unknown as CompanyRow[]) {
        companiesById.set(row.id, row);
      }
      const sectorIds = [
        ...new Set((companyRows as unknown as CompanyRow[]).map((c) => c.sector_id)),
      ].filter((id): id is string => id !== null);
      if (sectorIds.length > 0) {
        const { data: sectorRows, error: sectorsError } = await supabase
          .from('sectors')
          .select('id, name')
          .in('id', sectorIds);
        if (!sectorsError && sectorRows) {
          for (const row of sectorRows as unknown as SectorRow[]) {
            sectorsById.set(row.id, row);
          }
        }
      }
    }
  }

  const profile = toUserProfile(onboardingRow as unknown as OnboardingRow);
  let upserted = 0;

  for (const claimable of claimables) {
    const company = claimable.company_id ? companiesById.get(claimable.company_id) : undefined;
    const sector = company?.sector_id ? sectorsById.get(company.sector_id) : undefined;

    const target: ClaimableForMatching = {
      companyName: company?.display_name ?? null,
      companyAliases: company?.aliases ?? [],
      sectorName: sector?.name ?? null,
      relevantPeriodStart: claimable.relevant_period_start,
      relevantPeriodEnd: claimable.relevant_period_end,
      geographicScope: claimable.geographic_scope,
      proofRequirements: toProofRequirements(claimable.proof_requirements ?? []),
    };

    const scored = scoreMatch(profile, target);

    const { error: upsertError } = await supabase.from('claim_matches').upsert(
      {
        user_id: userId,
        claimable_id: claimable.id,
        confidence: scored.outcome,
        match_reasons: scored.reasons,
        last_checked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,claimable_id' },
    );

    if (!upsertError) upserted += 1;
  }

  return { ok: true, result: { evaluated: claimables.length, upserted } };
}
