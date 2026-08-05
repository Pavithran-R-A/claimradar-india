import { describe, expect, it } from 'vitest';
import { MatchConfidence } from '@claimradar/shared-types';
import {
  normaliseEntityName,
  scoreMatch,
  type ClaimableForMatching,
  type UserProfileForMatching,
} from '@/lib/matching';

/** Complete onboarding profile used as the base for matrix cases. */
function baseUser(overrides: Partial<UserProfileForMatching> = {}): UserProfileForMatching {
  return {
    companiesUsed: ['Flipkart'],
    sectorsUsed: ['E-commerce'],
    purchasePeriodStart: 2019,
    purchasePeriodEnd: 2021,
    state: 'Karnataka',
    receiptAvailability: 'yes',
    referenceAvailability: 'yes',
    ...overrides,
  };
}

/** Published claimable that should strongly match the base user. */
function baseClaimable(overrides: Partial<ClaimableForMatching> = {}): ClaimableForMatching {
  return {
    companyName: 'Flipkart Private Limited',
    companyAliases: ['Flipkart'],
    sectorName: 'E-commerce',
    relevantPeriodStart: '2018-01-01',
    relevantPeriodEnd: '2022-12-31',
    geographicScope: 'India',
    proofRequirements: ['receipt'],
    ...overrides,
  };
}

describe('normaliseEntityName', () => {
  it('strips corporate suffixes and punctuation', () => {
    expect(normaliseEntityName('Flipkart Private Limited')).toBe('flipkart');
    expect(normaliseEntityName('Air India Ltd.')).toBe('air india');
    expect(normaliseEntityName('  Airtel  ')).toBe('airtel');
  });

  it('keeps meaningful tokens when no suffix is present', () => {
    expect(normaliseEntityName('State Bank of India')).toBe('state bank of india');
  });
});

describe('scoreMatch — insufficient information guard', () => {
  it('returns insufficient_information when user has no companies or sectors', () => {
    const result = scoreMatch(baseUser({ companiesUsed: [], sectorsUsed: [] }), baseClaimable());
    expect(result.outcome).toBe(MatchConfidence.InsufficientInformation);
    expect(result.reasons.some((r) => r.code === 'insufficient_profile')).toBe(true);
  });

  it('returns insufficient_information when user has no purchase period', () => {
    const result = scoreMatch(
      baseUser({ purchasePeriodStart: null, purchasePeriodEnd: null }),
      baseClaimable(),
    );
    expect(result.outcome).toBe(MatchConfidence.InsufficientInformation);
  });
});

describe('scoreMatch — strong potential match', () => {
  it('company + sector + period overlap + proof available', () => {
    const result = scoreMatch(baseUser(), baseClaimable());
    expect(result.outcome).toBe(MatchConfidence.StrongPotentialMatch);
    const codes = result.reasons.map((r) => r.code);
    expect(codes).toContain('company_match');
    expect(codes).toContain('sector_match');
    expect(codes).toContain('period_overlap');
  });

  it('matches company names case-insensitively with suffixes', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: ['flipkart ltd'] }),
      baseClaimable({ companyName: 'Flipkart Private Limited' }),
    );
    expect(result.outcome).toBe(MatchConfidence.StrongPotentialMatch);
  });

  it('matches via company alias when legal name differs', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: ['Flipkart'] }),
      baseClaimable({ companyName: 'Internet Marketplace Ltd', companyAliases: ['Flipkart'] }),
    );
    expect(result.outcome).toBe(MatchConfidence.StrongPotentialMatch);
  });

  it('still strong when claimable period is unknown (no contradiction)', () => {
    const result = scoreMatch(
      baseUser(),
      baseClaimable({ relevantPeriodStart: null, relevantPeriodEnd: null }),
    );
    expect(result.outcome).toBe(MatchConfidence.StrongPotentialMatch);
  });
});

describe('scoreMatch — possible match', () => {
  it('company match with unknown sector but overlapping period', () => {
    const result = scoreMatch(baseUser({ sectorsUsed: [] }), baseClaimable());
    expect(result.outcome).toBe(MatchConfidence.PossibleMatch);
  });

  it('sector + period match when claimable has no company info', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: [] }),
      baseClaimable({ companyName: null, companyAliases: [] }),
    );
    expect(result.outcome).toBe(MatchConfidence.PossibleMatch);
  });

  it('company + sector agree but period contradicts (weakened to possible)', () => {
    const result = scoreMatch(
      baseUser({ purchasePeriodStart: 2005, purchasePeriodEnd: 2007 }),
      baseClaimable(),
    );
    expect(result.outcome).toBe(MatchConfidence.PossibleMatch);
    expect(result.reasons.some((r) => r.code === 'period_mismatch')).toBe(true);
  });

  it('company match + location match with unknown sector and unknown period', () => {
    const result = scoreMatch(
      baseUser({ sectorsUsed: [], purchasePeriodStart: 2020, purchasePeriodEnd: 2020 }),
      baseClaimable({
        sectorName: null,
        relevantPeriodStart: null,
        relevantPeriodEnd: null,
        geographicScope: 'Karnataka and Tamil Nadu',
      }),
    );
    expect(result.outcome).toBe(MatchConfidence.PossibleMatch);
    expect(result.reasons.some((r) => r.code === 'location_match')).toBe(true);
  });
});

describe('scoreMatch — insufficient information (partial profile)', () => {
  it('company match but all corroborating signals unknown', () => {
    const result = scoreMatch(
      baseUser({
        sectorsUsed: [],
        state: null,
        purchasePeriodStart: 2020,
        purchasePeriodEnd: 2020,
      }),
      baseClaimable({
        sectorName: null,
        relevantPeriodStart: null,
        relevantPeriodEnd: null,
        geographicScope: null,
        proofRequirements: [],
      }),
    );
    expect(result.outcome).toBe(MatchConfidence.InsufficientInformation);
    expect(result.reasons.some((r) => r.code === 'needs_more_info')).toBe(true);
  });

  it('sector match alone without period or company corroboration', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: [], state: null }),
      baseClaimable({
        companyName: null,
        companyAliases: [],
        relevantPeriodStart: null,
        relevantPeriodEnd: null,
        geographicScope: null,
        proofRequirements: [],
      }),
    );
    expect(result.outcome).toBe(MatchConfidence.InsufficientInformation);
  });
});

describe('scoreMatch — not matched', () => {
  it('company and sector both mismatch', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: ['Air India'], sectorsUsed: ['Airlines'] }),
      baseClaimable(),
    );
    expect(result.outcome).toBe(MatchConfidence.NotMatched);
  });

  it('company mismatch with unknown sector', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: ['Air India'], sectorsUsed: [] }),
      baseClaimable(),
    );
    expect(result.outcome).toBe(MatchConfidence.NotMatched);
  });

  it('no positive signals at all', () => {
    const result = scoreMatch(
      baseUser({ companiesUsed: ['Some Other Co'], sectorsUsed: ['Banking'] }),
      baseClaimable({ companyName: 'Flipkart', sectorName: 'E-commerce' }),
    );
    expect(result.outcome).toBe(MatchConfidence.NotMatched);
  });
});

describe('scoreMatch — proof availability rules', () => {
  it('proof conflict demotes strong to a blocked result (not strong)', () => {
    const result = scoreMatch(
      baseUser({ receiptAvailability: 'no' }),
      baseClaimable({ proofRequirements: ['receipt'] }),
    );
    expect(result.outcome).not.toBe(MatchConfidence.StrongPotentialMatch);
    expect(result.reasons.some((r) => r.code === 'proof_conflict')).toBe(true);
  });

  it('proof conflict on a possible-match path keeps it out of possible', () => {
    const result = scoreMatch(
      baseUser({ sectorsUsed: [], receiptAvailability: 'no' }),
      baseClaimable({ proofRequirements: ['receipt'] }),
    );
    expect(result.outcome).toBe(MatchConfidence.InsufficientInformation);
  });

  it('unsure proof does not block a strong match', () => {
    const result = scoreMatch(
      baseUser({ receiptAvailability: 'unsure' }),
      baseClaimable({ proofRequirements: ['receipt'] }),
    );
    expect(result.outcome).toBe(MatchConfidence.StrongPotentialMatch);
  });

  it('transaction reference conflict is detected', () => {
    const result = scoreMatch(
      baseUser({ referenceAvailability: 'no' }),
      baseClaimable({ proofRequirements: ['transaction_reference'] }),
    );
    expect(result.reasons.some((r) => r.code === 'proof_conflict')).toBe(true);
  });
});

describe('scoreMatch — determinism', () => {
  it('returns identical outcomes across repeated calls', () => {
    const user = baseUser();
    const claimable = baseClaimable();
    const first = scoreMatch(user, claimable);
    for (let i = 0; i < 5; i += 1) {
      expect(scoreMatch(user, claimable)).toEqual(first);
    }
  });
});
