/**
 * Deterministic rule-based matching engine.
 *
 * Pure functions only — no database access, no network, and NEVER any LLM
 * involvement. Given the same user profile and claimable, the outcome is
 * always identical. Results map to exactly four outcomes:
 *
 *   strong_potential_match | possible_match | insufficient_information | not_matched
 */

import { MatchConfidence } from '@claimradar/shared-types';

export type MatchOutcome =
  | MatchConfidence.StrongPotentialMatch
  | MatchConfidence.PossibleMatch
  | MatchConfidence.InsufficientInformation
  | MatchConfidence.NotMatched;

export type Availability = 'yes' | 'no' | 'unsure';

/** Low-risk onboarding answers collected from the user (never documents). */
export interface UserProfileForMatching {
  companiesUsed: string[];
  sectorsUsed: string[];
  /** Approximate purchase period as calendar years (inclusive). */
  purchasePeriodStart: number | null;
  purchasePeriodEnd: number | null;
  state: string | null;
  receiptAvailability: Availability;
  referenceAvailability: Availability;
}

/** Public claimable fields needed for matching. */
export interface ClaimableForMatching {
  companyName: string | null;
  companyAliases?: string[];
  sectorName: string | null;
  /** ISO date strings (yyyy-mm-dd) or null. */
  relevantPeriodStart: string | null;
  relevantPeriodEnd: string | null;
  geographicScope: string | null;
  /** Normalised proof requirement keys, e.g. 'receipt', 'transaction_reference'. */
  proofRequirements?: string[];
}

export interface MatchReason {
  code: string;
  label: string;
}

export interface MatchResult {
  outcome: MatchOutcome;
  reasons: MatchReason[];
}

type Signal = 'match' | 'mismatch' | 'unknown';

/* -------------------------------------------------------------------------- */
/*  Normalisation helpers                                                      */
/* -------------------------------------------------------------------------- */

const COMPANY_SUFFIXES = [
  'limited',
  'ltd',
  'private',
  'pvt',
  'incorporated',
  'inc',
  'corporation',
  'corp',
  'company',
  'co',
  'plc',
  'llp',
];

/** Lowercase, collapse whitespace, strip punctuation and corporate suffixes. */
export function normaliseEntityName(raw: string): string {
  const lowered = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = lowered.split(' ').filter(Boolean);
  let lastToken = tokens[tokens.length - 1];
  while (tokens.length > 1 && lastToken !== undefined && COMPANY_SUFFIXES.includes(lastToken)) {
    tokens.pop();
    lastToken = tokens[tokens.length - 1];
  }
  return tokens.join(' ');
}

function namesMatch(a: string, b: string): boolean {
  const na = normaliseEntityName(a);
  const nb = normaliseEntityName(b);
  if (na.length === 0 || nb.length === 0) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function yearOf(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const parsed = Number.parseInt(isoDate.slice(0, 4), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/* -------------------------------------------------------------------------- */
/*  Signal evaluation                                                          */
/* -------------------------------------------------------------------------- */

function evalCompanySignal(user: UserProfileForMatching, claimable: ClaimableForMatching): Signal {
  if (user.companiesUsed.length === 0) return 'unknown';
  if (!claimable.companyName) return 'unknown';
  const candidates = [claimable.companyName, ...(claimable.companyAliases ?? [])];
  return user.companiesUsed.some((used) => candidates.some((c) => namesMatch(used, c)))
    ? 'match'
    : 'mismatch';
}

function evalSectorSignal(user: UserProfileForMatching, claimable: ClaimableForMatching): Signal {
  if (user.sectorsUsed.length === 0) return 'unknown';
  if (!claimable.sectorName) return 'unknown';
  return user.sectorsUsed.some((s) => namesMatch(s, claimable.sectorName as string))
    ? 'match'
    : 'mismatch';
}

function evalPeriodSignal(user: UserProfileForMatching, claimable: ClaimableForMatching): Signal {
  if (user.purchasePeriodStart === null && user.purchasePeriodEnd === null) return 'unknown';
  const claimStart = yearOf(claimable.relevantPeriodStart);
  const claimEnd = yearOf(claimable.relevantPeriodEnd);
  if (claimStart === null && claimEnd === null) return 'unknown';

  const userStart = user.purchasePeriodStart ?? -Number.MAX_SAFE_INTEGER;
  const userEnd = user.purchasePeriodEnd ?? Number.MAX_SAFE_INTEGER;
  const cStart = claimStart ?? -Number.MAX_SAFE_INTEGER;
  const cEnd = claimEnd ?? Number.MAX_SAFE_INTEGER;
  return userStart <= cEnd && userEnd >= cStart ? 'match' : 'mismatch';
}

const NATIONWIDE_SCOPE = /^(india|nationwide|national|all india|pan[-\s]?india)$/i;

function evalLocationSignal(user: UserProfileForMatching, claimable: ClaimableForMatching): Signal {
  if (!user.state) return 'unknown';
  const scope = claimable.geographicScope?.trim();
  if (!scope) return 'unknown';
  if (NATIONWIDE_SCOPE.test(scope)) return 'match';
  return scope.toLowerCase().includes(user.state.trim().toLowerCase()) ? 'match' : 'mismatch';
}

type ProofSignal = 'satisfied' | 'conflict' | 'unknown';

function evalProofSignal(
  user: UserProfileForMatching,
  claimable: ClaimableForMatching,
): ProofSignal {
  const requirements = (claimable.proofRequirements ?? []).map((r) => r.toLowerCase().trim());
  if (requirements.length === 0) return 'unknown';

  let sawUnknown = false;
  for (const requirement of requirements) {
    if (requirement.includes('receipt')) {
      if (user.receiptAvailability === 'no') return 'conflict';
      if (user.receiptAvailability === 'unsure') sawUnknown = true;
    } else if (requirement.includes('reference') || requirement.includes('transaction')) {
      if (user.referenceAvailability === 'no') return 'conflict';
      if (user.referenceAvailability === 'unsure') sawUnknown = true;
    } else {
      sawUnknown = true;
    }
  }
  return sawUnknown ? 'unknown' : 'satisfied';
}

/* -------------------------------------------------------------------------- */
/*  Decision matrix                                                            */
/* -------------------------------------------------------------------------- */

function reason(code: string, label: string): MatchReason {
  return { code, label };
}

/**
 * Score a user profile against a claimable.
 *
 * Decision order:
 *  1. Insufficient profile data (no company/sector interests or no period)
 *  2. Hard mismatch (company AND sector both mismatch) -> not_matched
 *  3. Company + sector + non-conflicting period -> strong_potential_match
 *  4. Weaker corroboration combinations -> possible_match
 *  5. Positive signal but too many unknowns -> insufficient_information
 *  6. Otherwise -> not_matched
 */
export function scoreMatch(
  user: UserProfileForMatching,
  claimable: ClaimableForMatching,
): MatchResult {
  const reasons: MatchReason[] = [];

  const hasInterests = user.companiesUsed.length > 0 || user.sectorsUsed.length > 0;
  const hasPeriod = user.purchasePeriodStart !== null || user.purchasePeriodEnd !== null;

  if (!hasInterests || !hasPeriod) {
    reasons.push(
      reason(
        'insufficient_profile',
        'Your onboarding profile is missing companies/sectors or a purchase period.',
      ),
    );
    return { outcome: MatchConfidence.InsufficientInformation, reasons };
  }

  const company = evalCompanySignal(user, claimable);
  const sector = evalSectorSignal(user, claimable);
  const period = evalPeriodSignal(user, claimable);
  const location = evalLocationSignal(user, claimable);
  const proof = evalProofSignal(user, claimable);

  if (company === 'match') reasons.push(reason('company_match', 'You named this company.'));
  if (sector === 'match') reasons.push(reason('sector_match', 'Sector matches your interests.'));
  if (period === 'match') {
    reasons.push(reason('period_overlap', 'Purchase period overlaps the affected period.'));
  } else if (period === 'mismatch') {
    reasons.push(reason('period_mismatch', 'Purchase period falls outside the affected period.'));
  }
  if (location === 'match') reasons.push(reason('location_match', 'Your state is covered.'));
  if (proof === 'conflict') {
    reasons.push(reason('proof_conflict', 'You reported missing required proof.'));
  } else if (proof === 'satisfied') {
    reasons.push(reason('proof_satisfied', 'Required proof is available.'));
  }

  // Hard mismatch: both concrete identity signals contradict.
  if (company === 'mismatch' && sector === 'mismatch') {
    return { outcome: MatchConfidence.NotMatched, reasons };
  }

  const periodBlocks = period === 'mismatch';
  const proofBlocks = proof === 'conflict';

  // Strong: company + sector agree, period does not contradict, proof available.
  if (company === 'match' && sector === 'match' && !periodBlocks && !proofBlocks) {
    return { outcome: MatchConfidence.StrongPotentialMatch, reasons };
  }

  // Possible: company agreement corroborated by period or location overlap.
  if (company === 'match' && !proofBlocks && (period === 'match' || location === 'match')) {
    return { outcome: MatchConfidence.PossibleMatch, reasons };
  }

  // Possible: sector + period agree when the claimable has no company info.
  if (sector === 'match' && period === 'match' && !proofBlocks && company === 'unknown') {
    return { outcome: MatchConfidence.PossibleMatch, reasons };
  }

  // Possible but weakened: company + sector agree yet period contradicts.
  if (company === 'match' && sector === 'match' && periodBlocks && !proofBlocks) {
    return { outcome: MatchConfidence.PossibleMatch, reasons };
  }

  // A positive identity signal exists but corroboration is missing.
  if (company === 'match' || sector === 'match') {
    reasons.push(
      reason('needs_more_info', 'Add more onboarding detail to strengthen this result.'),
    );
    return { outcome: MatchConfidence.InsufficientInformation, reasons };
  }

  return { outcome: MatchConfidence.NotMatched, reasons };
}
