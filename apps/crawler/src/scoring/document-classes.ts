/**
 * Semantic Document Classes and Actionability Categories for ClaimRadar India.
 *
 * Implements layered deterministic document classification to ensure high-precision
 * claim opportunity detection without false positives from administrative or enforcement noise.
 */

export enum SemanticDocumentClass {
  // Actionable claim mechanisms
  CreditorClaimInvitation = 'creditor_claim_invitation',
  ConsumerRefundProgram = 'consumer_refund_program',
  InvestorRefundProgram = 'investor_refund_program',
  CompensationProgram = 'compensation_program',
  PublicClaimNotice = 'public_claim_notice',

  // Non-actionable / administrative / enforcement noise
  RegulatoryPenaltyOnly = 'regulatory_penalty_only',
  EnforcementOrderOnly = 'enforcement_order_only',
  ResolutionPlanEoi = 'resolution_plan_eoi',
  AuctionNotice = 'auction_notice',
  IndividualJudgment = 'individual_judgment',
  GeneralPressRelease = 'general_press_release',
  InformationalNotice = 'informational_notice',
  Unknown = 'unknown',
}

export enum ActionabilityCategory {
  TrueActionable = 'TRUE_ACTIONABLE',
  NonActionable = 'NON_ACTIONABLE',
  Expired = 'EXPIRED',
  Duplicate = 'DUPLICATE',
  InformationalOnly = 'INFORMATIONAL_ONLY',
  Unproven = 'UNPROVEN',
  NeedsEditorialReview = 'NEEDS_EDITORIAL_REVIEW',
}

export interface SemanticClassificationResult {
  documentClass: SemanticDocumentClass;
  actionability: ActionabilityCategory;
  isActionableClass: boolean;
  ruleMatched: string;
  reasoning: string;
  hasExplicitRestitutionRoute: boolean;
}

export interface ClassificationInput {
  text: string;
  title?: string;
  source?: string;
}

/**
 * Layered semantic classification of legal/regulatory documents.
 */
export function classifyDocumentSemantics(
  input: ClassificationInput,
): SemanticClassificationResult {
  const text = (input.text ?? '').toLowerCase();
  const title = (input.title ?? '').toLowerCase();
  const combined = `${title} ${text}`;

  // ---------------------------------------------------------------------------
  // Check for explicit consumer/investor/creditor restitution/claim routes
  // ---------------------------------------------------------------------------
  const hasExplicitRestitutionRoute =
    combined.includes('repay depositors') ||
    combined.includes('repayment of deposits') ||
    combined.includes('refund to depositors') ||
    combined.includes('refund to customers') ||
    combined.includes('reimbursement to customers') ||
    combined.includes('portal for claims') ||
    combined.includes('submit claim') ||
    combined.includes('submit a claim') ||
    combined.includes('submit claim applications') ||
    combined.includes('invitation of claims') ||
    combined.includes('file claim') ||
    combined.includes('proof of claim') ||
    combined.includes('last date for submission of claims') ||
    combined.includes('investor refund portal') ||
    combined.includes('citrus check inns') ||
    combined.includes('royal twinkle') ||
    combined.includes('sahara refund') ||
    combined.includes('pacl refund') ||
    combined.includes('for refund (phase') ||
    combined.includes('public notice for refund') ||
    combined.includes('disgorgement distribution') ||
    combined.includes('unclaimed deposit') ||
    combined.includes('unclaimed dividend') ||
    combined.includes('unclaimed amount');

  // ---------------------------------------------------------------------------
  // LAYER 1: Source-type / administrative exclusion rules
  // ---------------------------------------------------------------------------
  if (
    combined.includes('consumer awareness program') ||
    combined.includes('consumer outreach program') ||
    combined.includes('consumer education workshop') ||
    combined.includes('awareness campaign') ||
    combined.includes('outreach event') ||
    combined.includes('workshop at')
  ) {
    return {
      documentClass: SemanticDocumentClass.InformationalNotice,
      actionability: ActionabilityCategory.InformationalOnly,
      isActionableClass: false,
      ruleMatched: 'LAYER_1_AWARENESS_EVENT',
      reasoning: 'Educational or awareness event with no individual remedy route.',
      hasExplicitRestitutionRoute: false,
    };
  }

  if (
    combined.includes('recruitment') ||
    combined.includes('vacancy') ||
    combined.includes('tender notice') ||
    combined.includes('procurement of') ||
    combined.includes('appointment of') ||
    combined.includes('speech by') ||
    combined.includes('conference on')
  ) {
    return {
      documentClass: SemanticDocumentClass.InformationalNotice,
      actionability: ActionabilityCategory.NonActionable,
      isActionableClass: false,
      ruleMatched: 'LAYER_1_ADMINISTRATIVE_NOTICE',
      reasoning: 'Administrative, hiring, procurement or speech record.',
      hasExplicitRestitutionRoute: false,
    };
  }

  // ---------------------------------------------------------------------------
  // LAYER 2 & 3: Hard False-Positive Rule — RBI Monetary Penalties
  // ---------------------------------------------------------------------------
  const isRbiPenalty =
    title.includes('rbi imposes monetary penalty') ||
    title.includes('imposes monetary penalty on') ||
    title.includes('monetary penalty on') ||
    combined.includes('rbi imposes monetary penalty') ||
    (combined.includes('monetary penalty') &&
      combined.includes('deficiencies in regulatory compliance')) ||
    combined.includes('not intended to pronounce upon the validity of any transaction');

  if (isRbiPenalty) {
    if (hasExplicitRestitutionRoute) {
      return {
        documentClass: SemanticDocumentClass.ConsumerRefundProgram,
        actionability: ActionabilityCategory.TrueActionable,
        isActionableClass: true,
        ruleMatched: 'RBI_PENALTY_WITH_EXPLICIT_RESTITUTION',
        reasoning: 'RBI action with explicit depositor/customer restitution mechanism established.',
        hasExplicitRestitutionRoute: true,
      };
    }
    return {
      documentClass: SemanticDocumentClass.RegulatoryPenaltyOnly,
      actionability: ActionabilityCategory.NonActionable,
      isActionableClass: false,
      ruleMatched: 'RBI_MONETARY_PENALTY_ONLY',
      reasoning:
        'Standard regulatory penalty for compliance deficiencies without a customer remedy route.',
      hasExplicitRestitutionRoute: false,
    };
  }

  // Check for RBI customer/depositor restitution directive (non-penalty)
  if (
    combined.includes('reserve bank of india') &&
    (combined.includes('repay depositors') ||
      combined.includes('repayment of deposits') ||
      combined.includes('refund to depositors') ||
      combined.includes('refund to customers'))
  ) {
    return {
      documentClass: SemanticDocumentClass.ConsumerRefundProgram,
      actionability: ActionabilityCategory.TrueActionable,
      isActionableClass: true,
      ruleMatched: 'RBI_DEPOSITOR_REFUND_DIRECTIVE',
      reasoning: 'RBI directive establishing a depositor refund or customer repayment process.',
      hasExplicitRestitutionRoute: true,
    };
  }

  // ---------------------------------------------------------------------------
  // LAYER 2 & 3: Hard False-Positive Rule — IBBI Form G (EOI)
  // ---------------------------------------------------------------------------
  const isFormGEoi =
    title.includes('form g') ||
    title.includes('expression of interest') ||
    combined.includes('expression of interest from prospective resolution applicants') ||
    combined.includes('prospective resolution applicant') ||
    combined.includes('invitation for expression of interest') ||
    combined.includes('receipt of expression of interest') ||
    combined.includes('invitation of resolution plans');

  const isIbbiCreditorNotice =
    (combined.includes('corporate insolvency') ||
      combined.includes('voluntary liquidation') ||
      combined.includes('ibbi')) &&
    (title.includes('claims deadline') ||
      title.includes('public announcement of corporate insolvency') ||
      title.includes('public announcement of voluntary liquidation') ||
      combined.includes('form a') ||
      combined.includes('form b') ||
      combined.includes('form c') ||
      combined.includes('invitation of claims from creditors') ||
      combined.includes('submission of claims by creditors') ||
      (combined.includes('notice inviting proof of claim') &&
        (combined.includes('creditor') || combined.includes('claimant'))));

  if (isFormGEoi && !isIbbiCreditorNotice) {
    return {
      documentClass: SemanticDocumentClass.ResolutionPlanEoi,
      actionability: ActionabilityCategory.InformationalOnly,
      isActionableClass: false,
      ruleMatched: 'IBBI_FORM_G_EOI_ONLY',
      reasoning:
        'IBBI Form G / Expression of Interest is for prospective resolution applicants, not a creditor proof-of-claim route.',
      hasExplicitRestitutionRoute: false,
    };
  }

  // ---------------------------------------------------------------------------
  // LAYER 2 & 3: Hard False-Positive Rule — Generic SEBI / Regulators Enforcement
  // ---------------------------------------------------------------------------
  const isGenericSebiEnforcement =
    title.includes('adjudication order') ||
    title.includes('settlement order') ||
    title.includes('consent order') ||
    title.includes('recovery certificate') ||
    combined.includes('adjudication order in respect of') ||
    combined.includes('adjudication order in the matter of') ||
    combined.includes('settlement order in respect of') ||
    combined.includes('settlement order in the matter of') ||
    combined.includes('release order for recovery certificate') ||
    combined.includes('settlement proceedings in the matter of') ||
    combined.includes('illiquid stock options');

  if (isGenericSebiEnforcement && !hasExplicitRestitutionRoute) {
    return {
      documentClass: SemanticDocumentClass.EnforcementOrderOnly,
      actionability: ActionabilityCategory.NonActionable,
      isActionableClass: false,
      ruleMatched: 'SEBI_GENERIC_ENFORCEMENT_ORDER',
      reasoning:
        'Generic regulatory enforcement, adjudication, or settlement order without an investor refund or claimant route.',
      hasExplicitRestitutionRoute: false,
    };
  }

  // ---------------------------------------------------------------------------
  // LAYER 2 & 3: Actionable True Positive Classes
  // ---------------------------------------------------------------------------
  // 1. IBBI Creditor Claim Invitation (CIRP / Liquidation)
  if (isIbbiCreditorNotice) {
    return {
      documentClass: SemanticDocumentClass.CreditorClaimInvitation,
      actionability: ActionabilityCategory.TrueActionable,
      isActionableClass: true,
      ruleMatched: 'IBBI_CREDITOR_CLAIM_INVITATION',
      reasoning:
        'Authoritative creditor claim announcement under IBC with defined submission route.',
      hasExplicitRestitutionRoute: true,
    };
  }

  // 2. SEBI / Capital Markets Investor Refund Program
  if (
    combined.includes('for refund (phase') ||
    combined.includes('investor refund portal') ||
    combined.includes('public notice for refund') ||
    (combined.includes('public notice in the matter of') && combined.includes('refund')) ||
    combined.includes('disgorgement distribution')
  ) {
    return {
      documentClass: SemanticDocumentClass.InvestorRefundProgram,
      actionability: ActionabilityCategory.TrueActionable,
      isActionableClass: true,
      ruleMatched: 'SEBI_INVESTOR_REFUND_NOTICE',
      reasoning:
        'Official public investor refund scheme or disgorgement distribution portal notice.',
      hasExplicitRestitutionRoute: true,
    };
  }

  // 3. Consumer / Telecom / Utility Refund Program (TRAI / Consumer Commissions)
  if (
    combined.includes('tariff refund') ||
    combined.includes('overcharge directive') ||
    combined.includes('refund to telecom subscribers') ||
    (combined.includes('consumer commission') && combined.includes('refund')) ||
    (combined.includes('ncdrc') &&
      (combined.includes('refund') || combined.includes('compensation'))) ||
    (combined.includes('trai') && combined.includes('refund'))
  ) {
    return {
      documentClass: SemanticDocumentClass.ConsumerRefundProgram,
      actionability: ActionabilityCategory.TrueActionable,
      isActionableClass: true,
      ruleMatched: 'CONSUMER_OR_TELECOM_REFUND_DIRECTIVE',
      reasoning:
        'Regulator or consumer commission directive ordering customer refunds or compensation.',
      hasExplicitRestitutionRoute: true,
    };
  }

  // 4. Statutory Unclaimed Asset Portal / Scheme (IEPF, UDGAM)
  if (
    combined.includes('iepf') ||
    combined.includes('unclaimed deposit') ||
    combined.includes('unclaimed dividend') ||
    combined.includes('unclaimed amount')
  ) {
    return {
      documentClass: SemanticDocumentClass.PublicClaimNotice,
      actionability: ActionabilityCategory.TrueActionable,
      isActionableClass: true,
      ruleMatched: 'STATUTORY_UNCLAIMED_ASSET_ROUTE',
      reasoning: 'Statutory unclaimed financial asset or deposit recovery mechanism.',
      hasExplicitRestitutionRoute: true,
    };
  }

  // 5. General consumer restitution match
  if (
    hasExplicitRestitutionRoute ||
    combined.includes('refund') ||
    combined.includes('reimburse') ||
    combined.includes('compensation') ||
    combined.includes('disgorgement') ||
    combined.includes('restitution')
  ) {
    return {
      documentClass: SemanticDocumentClass.PublicClaimNotice,
      actionability: ActionabilityCategory.NeedsEditorialReview,
      isActionableClass: true,
      ruleMatched: 'PROBABLE_CLAIM_MECHANISM_MATCH',
      reasoning:
        'Contains claimant remedy language; evaluated for keyword density and editorial review.',
      hasExplicitRestitutionRoute: true,
    };
  }

  return {
    documentClass: SemanticDocumentClass.GeneralPressRelease,
    actionability: ActionabilityCategory.InformationalOnly,
    isActionableClass: false,
    ruleMatched: 'GENERAL_INFORMATIONAL_PRESS_RELEASE',
    reasoning: 'General informational press release or notification without public claimant route.',
    hasExplicitRestitutionRoute: false,
  };
}
