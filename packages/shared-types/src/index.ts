export enum ClaimableStatus {
  Detected = 'detected',
  OfficialUpdate = 'official_update',
  PotentialClaimable = 'potential_claimable',
  VerifiedClaimable = 'verified_claimable',
  RefundOrdered = 'refund_ordered',
  RegistrationOpen = 'registration_open',
  ProposedSettlement = 'proposed_settlement',
  CollectiveCasePending = 'collective_case_pending',
  IdentifiedUsersOnly = 'identified_users_only',
  IndividualJudgment = 'individual_judgment',
  Monitoring = 'monitoring',
  Closed = 'closed',
  Rejected = 'rejected',
  Uncertain = 'uncertain',
}

export enum ProceduralStatus {
  Final = 'final',
  Interim = 'interim',
  Proposed = 'proposed',
  Appealed = 'appealed',
  Pending = 'pending',
  Closed = 'closed',
}

export enum UserRole {
  User = 'user',
  Researcher = 'researcher',
  Editor = 'editor',
  LegalReviewer = 'legal_reviewer',
  Admin = 'admin',
}

export enum PublicationStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum SourceType {
  RSS = 'rss',
  HTMLListing = 'html_listing',
  HTMLDetail = 'html_detail',
  PDFIndex = 'pdf_index',
  CompanyNotice = 'company_notice',
  Manual = 'manual',
}

export enum MatchConfidence {
  StrongPotentialMatch = 'strong_potential_match',
  PossibleMatch = 'possible_match',
  InsufficientInformation = 'insufficient_information',
  NotMatched = 'not_matched',
}

export enum TrackerStatus {
  Saved = 'saved',
  Reviewing = 'reviewing',
  GatheringProof = 'gathering_proof',
  SubmittedExternally = 'submitted_externally',
  AwaitingResponse = 'awaiting_response',
  Approved = 'approved',
  Rejected = 'rejected',
  Closed = 'closed',
}

export interface Company {
  id: string;
  legalName: string;
  displayName: string;
  slug: string;
  cin?: string;
  sector?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claimable {
  id: string;
  companyId: string;
  slug: string;
  publicTitle: string;
  status: ClaimableStatus;
  proceduralStatus?: ProceduralStatus;
  summary?: string;
  affectedGroup?: string;
  reliefType?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  sourceType: SourceType;
  adapterType: string;
  isActive: boolean;
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const LEGAL_SAFETY = {
  BLOCKED_STATUSES_FOR_PUBLICATION: [ClaimableStatus.IndividualJudgment],
  REQUIRED_EVIDENCE_FIELDS: [
    'affected_group',
    'relief_type',
    'official_amount',
    'deadline',
    'action_required',
    'official_claim_url',
    'procedural_status',
    'appeal_or_pending_issue',
  ],
  MAX_CONFIDENCE: 0.95,
  OFFICIAL_DOMAINS: [
    'pib.gov.in',
    'sebi.gov.in',
    'rbi.org.in',
    'nclt.gov.in',
    'ncdrc.nic.in',
    'mca.gov.in',
    'cci.gov.in',
    'irdai.gov.in',
    'caipc.gov.in',
  ],
} as const;

export * from './deadlines.js';
