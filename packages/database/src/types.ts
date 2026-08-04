/**
 * Database type definitions matching the Supabase migration schema.
 * Normally auto-generated via `supabase gen types typescript`, created manually for now.
 */

export type ClaimableStatus =
  | 'detected'
  | 'official_update'
  | 'potential_claimable'
  | 'verified_claimable'
  | 'refund_ordered'
  | 'registration_open'
  | 'proposed_settlement'
  | 'collective_case_pending'
  | 'identified_users_only'
  | 'individual_judgment'
  | 'monitoring'
  | 'closed'
  | 'rejected'
  | 'uncertain';

export type ProceduralStatus = 'final' | 'interim' | 'proposed' | 'appealed' | 'pending' | 'closed';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export type SourceType =
  'rss' | 'html_listing' | 'html_detail' | 'pdf_index' | 'company_notice' | 'manual';

export type TrustLevel = 'official' | 'reputable' | 'community' | 'unverified';

export type LogoUsageStatus = 'none' | 'text_monogram' | 'authorized_logo' | 'pending';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  subscription_tier: string;
  onboarding_completed: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  legal_name: string | null;
  display_name: string;
  slug: string;
  aliases: string[];
  sector_id: string | null;
  official_domain: string | null;
  description: string | null;
  logo_url: string | null;
  logo_usage_status: LogoUsageStatus;
  publication_status: PublicationStatus;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Claimable {
  id: string;
  company_id: string | null;
  slug: string;
  public_title: string;
  legal_case_title: string | null;
  case_number: string | null;
  summary: string | null;
  status: ClaimableStatus;
  procedural_status: ProceduralStatus;
  authority: string | null;
  jurisdiction: string | null;
  affected_group: string | null;
  geographic_scope: string | null;
  relevant_period_start: string | null;
  relevant_period_end: string | null;
  relief_type: string | null;
  relief_description: string | null;
  official_amount: number | null;
  amount_currency: string;
  proof_requirements: unknown[];
  action_required: string | null;
  official_claim_url: string | null;
  deadline: string | null;
  appeal_status: string | null;
  claimability_score: number;
  confidence: number;
  publication_status: PublicationStatus;
  first_published_at: string | null;
  last_verified_at: string | null;
  closed_at: string | null;
  deadline_verified_at?: string | null;
  review_age_days?: number;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  base_url: string | null;
  source_type: SourceType;
  adapter_name: string;
  trust_level: TrustLevel;
  enabled: boolean;
  fetch_frequency_hours: number;
  rate_limit_per_minute: number;
  robots_checked_at: string | null;
  terms_checked_at: string | null;
  last_run_at: string | null;
  last_success_at: string | null;
  failure_count: number;
  health_state?: string;
  last_content_change_at?: string | null;
  last_error_category?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContentCluster {
  id: string;
  canonical_hash: string;
  cluster_title: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentClusterMember {
  cluster_id: string;
  source_document_id: string;
  assigned_at: string;
}

export interface UserCompanyWatchlist {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
}

export interface UserSectorWatchlist {
  id: string;
  user_id: string;
  sector_id: string;
  created_at: string;
}

export interface ClaimMatch {
  id: string;
  user_id: string;
  claimable_id: string;
  confidence: string;
  match_reasons: unknown[];
  first_matched_at: string;
  last_checked_at: string;
  notified: boolean;
}

export interface ClaimTracker {
  id: string;
  user_id: string;
  claimable_id: string;
  status: string;
  notes: string | null;
  external_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  claimable_id: string | null;
  read_at: string | null;
  sent_at: string | null;
  delivery_status: string;
  created_at: string;
}

export interface SourceDocument {
  id: string;
  source_id: string | null;
  canonical_url: string;
  source_identifier: string | null;
  title: string | null;
  published_at: string | null;
  retrieved_at: string;
  content_hash: string;
  etag: string | null;
  last_modified: string | null;
  mime_type: string | null;
  language: string;
  raw_text: string | null;
  extraction_status: string;
  raw_storage_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CrawlRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  sources_attempted: number;
  sources_succeeded: number;
  documents_discovered: number;
  candidates_created: number;
  ai_budget_used: number;
  metadata: Record<string, unknown>;
}

export interface CrawlRunSource {
  id: string;
  crawl_run_id: string;
  source_id: string;
  status: string;
  documents_found: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface CrawlError {
  id: string;
  crawl_run_id: string;
  source_id: string | null;
  error_type: string;
  error_message: string;
  url: string | null;
  occurred_at: string;
}

export interface CandidateDocument {
  id: string;
  crawl_run_id: string | null;
  source_document_id: string;
  keyword_score: number;
  ai_extraction_status: string;
  ai_provider: string | null;
  ai_model: string | null;
  ai_prompt_version: string | null;
  ai_schema_version: string | null;
  ai_raw_output: Record<string, unknown> | null;
  ai_extracted_data: Record<string, unknown> | null;
  ai_confidence: number | null;
  ai_duration_ms: number | null;
  ai_token_count: number | null;
  ai_error_category: string | null;
  ai_retry_count: number;
  second_pass_status: string;
  second_pass_output: Record<string, unknown> | null;
  validation_status: string;
  publication_decision: string;
  created_at: string;
}

export interface AiRun {
  id: string;
  candidate_document_id: string;
  pass_number: number;
  provider: string;
  model: string;
  prompt_version: string | null;
  schema_version: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number | null;
  result_status: string;
  error_category: string | null;
  raw_output: Record<string, unknown> | null;
  structured_output: Record<string, unknown> | null;
  created_at: string;
}

export interface ValidationResult {
  id: string;
  candidate_document_id: string;
  validator_name: string;
  passed: boolean;
  details: Record<string, unknown>;
  created_at: string;
}

export interface PublicationEvent {
  id: string;
  claimable_id: string | null;
  candidate_document_id: string | null;
  action: string;
  previous_status: ClaimableStatus | null;
  new_status: ClaimableStatus | null;
  actor_type: string;
  actor_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface SourceHealthEvent {
  id: string;
  source_id: string;
  check_type: string;
  status: string;
  details: Record<string, unknown>;
  checked_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Company>;
      };
      sectors: {
        Row: Sector;
        Insert: Omit<Sector, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Sector>;
      };
      claimables: {
        Row: Claimable;
        Insert: Omit<Claimable, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Claimable>;
      };
      sources: {
        Row: Source;
        Insert: Omit<Source, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Source>;
      };
      user_company_watchlists: {
        Row: UserCompanyWatchlist;
        Insert: Omit<UserCompanyWatchlist, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserCompanyWatchlist>;
      };
      user_sector_watchlists: {
        Row: UserSectorWatchlist;
        Insert: Omit<UserSectorWatchlist, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserSectorWatchlist>;
      };
      claim_matches: {
        Row: ClaimMatch;
        Insert: Omit<ClaimMatch, 'id' | 'first_matched_at' | 'last_checked_at'> & {
          id?: string;
          first_matched_at?: string;
          last_checked_at?: string;
        };
        Update: Partial<ClaimMatch>;
      };
      claim_trackers: {
        Row: ClaimTracker;
        Insert: Omit<ClaimTracker, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ClaimTracker>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Notification>;
      };
      source_documents: {
        Row: SourceDocument;
        Insert: Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'> & {
          id?: string;
          created_at?: string;
          retrieved_at?: string;
        };
        Update: Partial<SourceDocument>;
      };
      crawl_runs: {
        Row: CrawlRun;
        Insert: Omit<CrawlRun, 'id' | 'started_at'> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<CrawlRun>;
      };
      crawl_run_sources: {
        Row: CrawlRunSource;
        Insert: Omit<CrawlRunSource, 'id'> & { id?: string };
        Update: Partial<CrawlRunSource>;
      };
      crawl_errors: {
        Row: CrawlError;
        Insert: Omit<CrawlError, 'id' | 'occurred_at'> & {
          id?: string;
          occurred_at?: string;
        };
        Update: Partial<CrawlError>;
      };
      candidate_documents: {
        Row: CandidateDocument;
        Insert: Omit<CandidateDocument, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CandidateDocument>;
      };
      ai_runs: {
        Row: AiRun;
        Insert: Omit<AiRun, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AiRun>;
      };
      validation_results: {
        Row: ValidationResult;
        Insert: Omit<ValidationResult, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ValidationResult>;
      };
      publication_events: {
        Row: PublicationEvent;
        Insert: Omit<PublicationEvent, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PublicationEvent>;
      };
      source_health_events: {
        Row: SourceHealthEvent;
        Insert: Omit<SourceHealthEvent, 'id' | 'checked_at'> & {
          id?: string;
          checked_at?: string;
        };
        Update: Partial<SourceHealthEvent>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      claimable_status: ClaimableStatus;
      procedural_status: ProceduralStatus;
      publication_status: PublicationStatus;
      source_type: SourceType;
      trust_level: TrustLevel;
      logo_usage_status: LogoUsageStatus;
    };
  };
}
