-- Migration 001: Initial Schema
-- Core tables for ClaimRadar India platform

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Custom Types / Enums
-- =============================================================================

CREATE TYPE claimable_status AS ENUM (
  'detected',
  'official_update',
  'potential_claimable',
  'verified_claimable',
  'refund_ordered',
  'registration_open',
  'proposed_settlement',
  'collective_case_pending',
  'identified_users_only',
  'individual_judgment',
  'monitoring',
  'closed',
  'rejected',
  'uncertain'
);

CREATE TYPE procedural_status AS ENUM (
  'final',
  'interim',
  'proposed',
  'appealed',
  'pending',
  'closed'
);

CREATE TYPE publication_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE source_type AS ENUM (
  'rss',
  'html_listing',
  'html_detail',
  'pdf_index',
  'company_notice',
  'manual'
);

CREATE TYPE trust_level AS ENUM (
  'official',
  'reputable',
  'community',
  'unverified'
);

CREATE TYPE logo_usage_status AS ENUM (
  'none',
  'text_monogram',
  'authorized_logo',
  'pending'
);

-- =============================================================================
-- Sectors
-- =============================================================================

CREATE TABLE sectors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sectors IS 'Industry sectors used to categorise companies and claimables.';

-- =============================================================================
-- Companies
-- =============================================================================

CREATE TABLE companies (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name         TEXT,
  display_name       TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  aliases            TEXT[] DEFAULT '{}',
  sector_id          UUID REFERENCES sectors(id) ON DELETE SET NULL,
  official_domain    TEXT,
  description        TEXT,
  logo_url           TEXT,
  logo_usage_status  logo_usage_status NOT NULL DEFAULT 'none',
  publication_status publication_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE companies IS 'Companies referenced in claimables — targets of claims, refunds, or regulatory actions.';

CREATE INDEX idx_companies_sector_id        ON companies(sector_id);
CREATE INDEX idx_companies_publication      ON companies(publication_status);

-- =============================================================================
-- Sources
-- =============================================================================

CREATE TABLE sources (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  domain                TEXT NOT NULL,
  base_url              TEXT,
  source_type           source_type NOT NULL,
  adapter_name          TEXT NOT NULL,
  trust_level           trust_level NOT NULL DEFAULT 'official',
  enabled               BOOLEAN NOT NULL DEFAULT true,
  fetch_frequency_hours INT NOT NULL DEFAULT 24,
  rate_limit_per_minute INT NOT NULL DEFAULT 10,
  robots_checked_at     TIMESTAMPTZ,
  terms_checked_at      TIMESTAMPTZ,
  last_run_at           TIMESTAMPTZ,
  last_success_at       TIMESTAMPTZ,
  failure_count         INT NOT NULL DEFAULT 0,
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE sources IS 'External data sources (RSS feeds, government portals, company notices) monitored by the crawler.';

CREATE INDEX idx_sources_enabled    ON sources(enabled);
CREATE INDEX idx_sources_trust      ON sources(trust_level);

-- =============================================================================
-- Source Documents
-- =============================================================================

CREATE TABLE source_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id         UUID REFERENCES sources(id) ON DELETE SET NULL,
  canonical_url     TEXT NOT NULL,
  source_identifier TEXT,
  title             TEXT,
  published_at      TIMESTAMPTZ,
  retrieved_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_hash      TEXT NOT NULL,
  etag              TEXT,
  last_modified     TEXT,
  mime_type         TEXT,
  language          TEXT NOT NULL DEFAULT 'en',
  raw_text          TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending',
  raw_storage_path  TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE source_documents IS 'Raw documents retrieved from sources, before AI extraction.';

CREATE UNIQUE INDEX idx_source_documents_url_hash  ON source_documents(source_id, content_hash);
CREATE INDEX idx_source_documents_content_hash     ON source_documents(content_hash);
CREATE INDEX idx_source_documents_source_id        ON source_documents(source_id);
CREATE INDEX idx_source_documents_extraction       ON source_documents(extraction_status);

-- =============================================================================
-- Claimables
-- =============================================================================

CREATE TABLE claimables (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  slug                 TEXT NOT NULL UNIQUE,
  public_title         TEXT NOT NULL,
  legal_case_title     TEXT,
  case_number          TEXT,
  summary              TEXT,
  status               claimable_status NOT NULL DEFAULT 'detected',
  procedural_status    procedural_status NOT NULL DEFAULT 'pending',
  authority            TEXT,
  jurisdiction         TEXT,
  affected_group       TEXT,
  geographic_scope     TEXT,
  relevant_period_start DATE,
  relevant_period_end   DATE,
  relief_type          TEXT,
  relief_description   TEXT,
  official_amount      NUMERIC,
  amount_currency      TEXT NOT NULL DEFAULT 'INR',
  proof_requirements   JSONB NOT NULL DEFAULT '[]',
  action_required      TEXT,
  official_claim_url   TEXT,
  deadline             TIMESTAMPTZ,
  appeal_status        TEXT,
  claimability_score   INT NOT NULL DEFAULT 0,
  confidence           INT NOT NULL DEFAULT 0,
  publication_status   publication_status NOT NULL DEFAULT 'draft',
  first_published_at   TIMESTAMPTZ,
  last_verified_at     TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE claimables IS 'Core entity — claimable opportunities detected from sources (refunds, settlements, regulatory awards).';

CREATE INDEX idx_claimables_company_id        ON claimables(company_id);
CREATE INDEX idx_claimables_status            ON claimables(status);
CREATE INDEX idx_claimables_deadline          ON claimables(deadline);
CREATE INDEX idx_claimables_publication       ON claimables(publication_status);
CREATE INDEX idx_claimables_last_verified     ON claimables(last_verified_at);
CREATE INDEX idx_claimables_search            ON claimables USING gin(to_tsvector('english', COALESCE(public_title, '') || ' ' || COALESCE(summary, '')));

-- =============================================================================
-- Claim Sources (junction)
-- =============================================================================

CREATE TABLE claim_sources (
  claimable_id      UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  source_role       TEXT NOT NULL DEFAULT 'supporting',
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (claimable_id, source_document_id)
);

COMMENT ON TABLE claim_sources IS 'Links claimables to the source documents that support them.';

-- =============================================================================
-- Claim Evidence
-- =============================================================================

CREATE TABLE claim_evidence (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id      UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  supports_field    TEXT NOT NULL,
  evidence_text     TEXT NOT NULL,
  source_location   TEXT,
  verified          BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE claim_evidence IS 'Extracted evidence snippets that support specific fields of a claimable.';

CREATE INDEX idx_claim_evidence_claimable ON claim_evidence(claimable_id);

-- =============================================================================
-- Eligibility Rules
-- =============================================================================

CREATE TABLE eligibility_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  rule_key      TEXT NOT NULL,
  operator      TEXT NOT NULL,
  expected_value TEXT,
  question_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  required      BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE eligibility_rules IS 'Structured eligibilityibility criteria users must satisfy to qualify for a claimable.';

CREATE INDEX idx_eligibility_rules_claimable ON eligibility_rules(claimable_id);

-- =============================================================================
-- Claim Versions (audit trail)
-- =============================================================================

CREATE TABLE claim_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id    UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  version_number  INT NOT NULL,
  snapshot        JSONB NOT NULL,
  change_reason   TEXT,
  actor_type      TEXT NOT NULL,
  actor_id        UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE claim_versions IS 'Immutable version history of claimable snapshots for audit and rollback.';

CREATE INDEX idx_claim_versions_claimable ON claim_versions(claimable_id);
CREATE UNIQUE INDEX idx_claim_versions_unique ON claim_versions(claimable_id, version_number);
