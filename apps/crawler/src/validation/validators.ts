import type { Extraction } from '@claimradar/claim-schema';
import { LEGAL_SAFETY } from '@claimradar/shared-types';
import type { EvidenceVerification } from './evidence.js';

export interface ValidatorResult {
  name: string;
  passed: boolean;
  severity: 'block' | 'warn' | 'info';
  reason: string;
  details: Record<string, unknown>;
}

// 1. Evidence backing — every non-null field must have evidence
export function evidenceBackingValidator(
  extraction: Extraction,
  evidenceResults: EvidenceVerification[],
): ValidatorResult {
  const fieldsWithEvidence = new Set(evidenceResults.filter((r) => r.found).map((r) => r.field));
  const missing: string[] = [];
  for (const [key, value] of Object.entries(extraction)) {
    if (
      key === 'evidence' ||
      key === 'confidence' ||
      key === 'is_relevant' ||
      key === 'amount_currency'
    )
      continue;
    if (value !== null && value !== undefined && !fieldsWithEvidence.has(key)) {
      missing.push(key);
    }
  }
  return {
    name: 'evidence_backing',
    passed: missing.length === 0,
    severity: 'block',
    reason:
      missing.length === 0
        ? 'All non-null fields have evidence'
        : `Fields without evidence: ${missing.join(', ')}`,
    details: { missing },
  };
}

// 2. Individual judgment guard — hard reject individual court judgments
export function individualJudgmentGuard(extraction: Extraction): ValidatorResult {
  const indicators: string[] = [];
  const group = extraction.affected_group?.toLowerCase() ?? '';
  const docType = extraction.document_type?.toLowerCase() ?? '';

  // Check for individual name patterns (no group descriptors)
  const groupDescriptors = [
    'all',
    'customers',
    'consumers',
    'investors',
    'employees',
    'users',
    'members',
    'holders',
    'policyholders',
    'deposits',
    'class',
    'group',
  ];
  const hasGroupDescriptor = groupDescriptors.some((d) =>
    new RegExp('\\b' + d + '\\b', 'i').test(group),
  );

  if (group && !hasGroupDescriptor && group.split(' ').length <= 4) {
    indicators.push(`affected_group appears individual: "${extraction.affected_group}"`);
  }
  if (docType.includes('individual')) {
    indicators.push(`document_type contains "individual"`);
  }

  return {
    name: 'individual_judgment_guard',
    passed: indicators.length === 0,
    severity: 'block',
    reason:
      indicators.length === 0
        ? 'Not an individual judgment'
        : `Individual judgment detected: ${indicators.join('; ')}`,
    details: { indicators },
  };
}

// 3. Domain allowlist — source must be in official domains
export function domainAllowlistValidator(sourceDomain: string): ValidatorResult {
  const allowed = LEGAL_SAFETY.OFFICIAL_DOMAINS.some((d) => {
    return sourceDomain === d || sourceDomain.endsWith('.' + d);
  });
  return {
    name: 'domain_allowlist',
    passed: allowed,
    severity: 'warn',
    reason: allowed
      ? 'Source domain is in official allowlist'
      : `Domain "${sourceDomain}" not in official allowlist`,
    details: { sourceDomain, officialDomains: LEGAL_SAFETY.OFFICIAL_DOMAINS },
  };
}

// 4. Source trust level — must be official or reputable
export function sourceTrustLevelValidator(trustLevel: string): ValidatorResult {
  const allowed = ['official', 'reputable'];
  const passed = allowed.includes(trustLevel);
  return {
    name: 'source_trust_level',
    passed,
    severity: 'warn',
    reason: passed
      ? `Trust level "${trustLevel}" is acceptable`
      : `Trust level "${trustLevel}" is not official or reputable`,
    details: { trustLevel, allowedLevels: allowed },
  };
}

// 5. Group vs individual — detect if relief is for a defined group
export function groupVsIndividualValidator(extraction: Extraction): ValidatorResult {
  const group = extraction.affected_group?.toLowerCase() ?? '';
  if (!group) {
    return {
      name: 'group_vs_individual',
      passed: true,
      severity: 'block',
      reason: 'No affected group specified — skipped',
      details: {},
    };
  }

  const groupSignals = [
    'all ',
    'every ',
    'each ',
    'class',
    'group',
    'collective',
    'consumers',
    'customers',
    'investors',
    'employees',
    'users',
    'members',
    'holders',
    'policyholders',
    'deposits',
    'affected persons',
  ];
  const individualSignals = [
    'mr.',
    'mrs.',
    'ms.',
    'dr.',
    'shri',
    'smt.',
    'petitioner',
    'complainant',
    'applicant',
  ];

  const hasGroupSignal = groupSignals.some((s) => group.includes(s));
  const hasIndividualSignal = individualSignals.some((s) => group.includes(s));

  const isIndividual = hasIndividualSignal && !hasGroupSignal;

  return {
    name: 'group_vs_individual',
    passed: !isIndividual,
    severity: 'block',
    reason: isIndividual
      ? `Relief appears to be for an individual: "${extraction.affected_group}"`
      : 'Relief is for a group',
    details: { affectedGroup: extraction.affected_group, hasGroupSignal, hasIndividualSignal },
  };
}

// 6. Final vs proposed — detect tentative wording
export function finalVsProposedValidator(extraction: Extraction): ValidatorResult {
  const proposedSignals = [
    'proposed',
    'draft',
    'preliminary',
    'tentative',
    'subject to approval',
    'pending approval',
  ];
  const fieldsToCheck = [
    extraction.document_type ?? '',
    extraction.relief_description ?? '',
    extraction.procedural_status ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const detected = proposedSignals.filter((s) => fieldsToCheck.includes(s));
  const isProposed = detected.length > 0;

  return {
    name: 'final_vs_proposed',
    passed: !isProposed,
    severity: 'warn',
    reason: isProposed
      ? `Proposed/tentative language detected: ${detected.join(', ')}`
      : 'No proposed/tentative language detected',
    details: { detectedSignals: detected },
  };
}

// 7. Appeal or stay — detect pending appeals
export function appealOrStayValidator(extraction: Extraction): ValidatorResult {
  const appealSignals = [
    'appeal filed',
    'stay granted',
    'suspended pending review',
    'appeal pending',
    'under appeal',
    'stay order',
  ];
  const text = (extraction.appeal_or_pending_issue ?? '').toLowerCase();
  const detected = appealSignals.filter((s) => text.includes(s));
  const hasAppeal = detected.length > 0;

  return {
    name: 'appeal_or_stay',
    passed: !hasAppeal,
    severity: 'warn',
    reason: hasAppeal
      ? `Pending appeal/stay detected: ${detected.join(', ')}`
      : 'No pending appeals detected',
    details: { detectedSignals: detected },
  };
}

// 8. Deadline — must be parseable, future, and ≤5 years
export function deadlineValidator(extraction: Extraction): ValidatorResult {
  if (!extraction.deadline) {
    return {
      name: 'deadline',
      passed: true,
      severity: 'block',
      reason: 'No deadline specified — skipped',
      details: {},
    };
  }

  const parsed = new Date(extraction.deadline);
  if (isNaN(parsed.getTime())) {
    return {
      name: 'deadline',
      passed: false,
      severity: 'block',
      reason: `Unparseable deadline: "${extraction.deadline}"`,
      details: { deadline: extraction.deadline },
    };
  }

  const now = new Date();
  if (parsed < now) {
    return {
      name: 'deadline',
      passed: false,
      severity: 'block',
      reason: `Deadline has expired: ${extraction.deadline}`,
      details: { deadline: extraction.deadline, expired: true },
    };
  }

  const fiveYears = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
  if (parsed > fiveYears) {
    return {
      name: 'deadline',
      passed: false,
      severity: 'block',
      reason: `Deadline is more than 5 years away: ${extraction.deadline}`,
      details: { deadline: extraction.deadline },
    };
  }

  return {
    name: 'deadline',
    passed: true,
    severity: 'block',
    reason: 'Deadline is valid',
    details: { deadline: extraction.deadline },
  };
}

// 9. Amount support — official_amount must have evidence when an amount is claimed
export function amountSupportValidator(
  evidenceResults: EvidenceVerification[],
  officialAmount: number | string | null | undefined,
): ValidatorResult {
  // No amount extracted — nothing to support, so evidence is not required
  if (officialAmount === null || officialAmount === undefined) {
    return {
      name: 'amount_support',
      passed: true,
      severity: 'block',
      reason: 'No amount claimed — evidence not required',
      details: { hasAmount: false },
    };
  }
  const amountEvidence = evidenceResults.find((r) => r.field === 'official_amount' && r.found);
  return {
    name: 'amount_support',
    passed: !!amountEvidence,
    severity: 'block',
    reason: amountEvidence
      ? 'Amount has evidence backing'
      : 'Amount field has no verified evidence',
    details: { hasAmount: true, hasAmountEvidence: !!amountEvidence },
  };
}

// 10. Claim URL support — official_claim_url must exist in source
export function claimUrlSupportValidator(evidenceResults: EvidenceVerification[]): ValidatorResult {
  const urlEvidence = evidenceResults.find((r) => r.field === 'official_claim_url' && r.found);
  return {
    name: 'claim_url_support',
    passed: !!urlEvidence,
    severity: 'warn',
    reason: urlEvidence ? 'Claim URL has evidence backing' : 'Claim URL has no verified evidence',
    details: { hasUrlEvidence: !!urlEvidence },
  };
}

// 11. Source freshness — document should not be older than 90 days
export function sourceFreshnessValidator(documentDate: string | null): ValidatorResult {
  if (!documentDate) {
    return {
      name: 'source_freshness',
      passed: false,
      severity: 'info',
      reason: 'No document date provided',
      details: {},
    };
  }
  const parsed = new Date(documentDate);
  if (isNaN(parsed.getTime())) {
    return {
      name: 'source_freshness',
      passed: false,
      severity: 'info',
      reason: `Unparseable document date: "${documentDate}"`,
      details: { documentDate },
    };
  }
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const fresh = parsed >= ninetyDaysAgo;
  return {
    name: 'source_freshness',
    passed: fresh,
    severity: 'info',
    reason: fresh ? 'Document is within 90 days' : 'Document is older than 90 days',
    details: { documentDate, fresh },
  };
}
