-- Migration 002: Ingestion Pipeline Tables
-- Tables supporting the crawler, AI extraction, validation, and publication pipeline.

-- =============================================================================
-- Crawl Runs
-- =============================================================================

CREATE TABLE crawl_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'running',
  sources_attempted   INT NOT NULL DEFAULT 0,
  sources_succeeded   INT NOT NULL DEFAULT 0,
  documents_discovered INT NOT NULL DEFAULT 0,
  candidates_created  INT NOT NULL DEFAULT 0,
  ai_budget_used      INT NOT NULL DEFAULT 0,
  metadata            JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE crawl_runs IS 'Top-level record for each scheduled or manual crawler execution.';

CREATE INDEX idx_crawl_runs_started ON crawl_runs(started_at DESC);

-- =============================================================================
-- Crawl Run Sources
-- =============================================================================

CREATE TABLE crawl_run_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id  UUID NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
  source_id     UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',
  documents_found INT NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
);

COMMENT ON TABLE crawl_run_sources IS 'Per-source results within a crawl run — tracks which sources were attempted and their outcome.';

CREATE INDEX idx_crawl_run_sources_run    ON crawl_run_sources(crawl_run_id);
CREATE INDEX idx_crawl_run_sources_source ON crawl_run_sources(source_id);

-- =============================================================================
-- Crawl Errors
-- =============================================================================

CREATE TABLE crawl_errors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id  UUID NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
  source_id     UUID REFERENCES sources(id) ON DELETE SET NULL,
  error_type    TEXT NOT NULL,
  error_message TEXT NOT NULL,
  url           TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE crawl_errors IS 'Individual error records surfaced during crawl runs for diagnostics.';

CREATE INDEX idx_crawl_errors_run    ON crawl_errors(crawl_run_id);
CREATE INDEX idx_crawl_errors_source ON crawl_errors(source_id);

-- =============================================================================
-- Candidate Documents
-- =============================================================================

CREATE TABLE candidate_documents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_run_id          UUID REFERENCES crawl_runs(id) ON DELETE SET NULL,
  source_document_id    UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  keyword_score         INT NOT NULL DEFAULT 0,
  ai_extraction_status  TEXT NOT NULL DEFAULT 'pending',
  ai_provider           TEXT,
  ai_model              TEXT,
  ai_prompt_version     TEXT,
  ai_schema_version     TEXT,
  ai_raw_output         JSONB,
  ai_extracted_data     JSONB,
  ai_confidence         DOUBLE PRECISION,
  ai_duration_ms        INT,
  ai_token_count        INT,
  ai_error_category     TEXT,
  ai_retry_count        INT NOT NULL DEFAULT 0,
  second_pass_status    TEXT NOT NULL DEFAULT 'pending',
  second_pass_output    JSONB,
  validation_status     TEXT NOT NULL DEFAULT 'pending',
  publication_decision  TEXT NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE candidate_documents IS 'Documents flagged as potential claimables, tracked through AI extraction, validation, and publication decision.';

CREATE INDEX idx_candidate_documents_run       ON candidate_documents(crawl_run_id);
CREATE INDEX idx_candidate_documents_source    ON candidate_documents(source_document_id);
CREATE INDEX idx_candidate_documents_extraction ON candidate_documents(ai_extraction_status);
CREATE INDEX idx_candidate_documents_decision  ON candidate_documents(publication_decision);

-- =============================================================================
-- AI Runs
-- =============================================================================

CREATE TABLE ai_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_document_id UUID NOT NULL REFERENCES candidate_documents(id) ON DELETE CASCADE,
  pass_number           INT NOT NULL DEFAULT 1,
  provider              TEXT NOT NULL,
  model                 TEXT NOT NULL,
  prompt_version        TEXT,
  schema_version        TEXT,
  input_tokens          INT,
  output_tokens         INT,
  duration_ms           INT,
  result_status         TEXT NOT NULL,
  error_category        TEXT,
  raw_output            JSONB,
  structured_output     JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_runs IS 'Per-invocation log of every AI call made during extraction and second-pass review.';

CREATE INDEX idx_ai_runs_candidate ON ai_runs(candidate_document_id);
CREATE INDEX idx_ai_runs_status    ON ai_runs(result_status);

-- =============================================================================
-- Validation Results
-- =============================================================================

CREATE TABLE validation_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_document_id UUID NOT NULL REFERENCES candidate_documents(id) ON DELETE CASCADE,
  validator_name        TEXT NOT NULL,
  passed                BOOLEAN NOT NULL,
  details               JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE validation_results IS 'Outcome of each deterministic validator run against a candidate document.';

CREATE INDEX idx_validation_results_candidate ON validation_results(candidate_document_id);

-- =============================================================================
-- Publication Events
-- =============================================================================

CREATE TABLE publication_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id          UUID REFERENCES claimables(id) ON DELETE SET NULL,
  candidate_document_id UUID REFERENCES candidate_documents(id) ON DELETE SET NULL,
  action                TEXT NOT NULL,
  previous_status       claimable_status,
  new_status            claimable_status,
  actor_type            TEXT NOT NULL,
  actor_id              UUID,
  reason                TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE publication_events IS 'Audit trail of every status transition in the publication pipeline.';

CREATE INDEX idx_publication_events_claimable  ON publication_events(claimable_id);
CREATE INDEX idx_publication_events_candidate  ON publication_events(candidate_document_id);
CREATE INDEX idx_publication_events_created    ON publication_events(created_at DESC);

-- =============================================================================
-- Source Health Events
-- =============================================================================

CREATE TABLE source_health_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id   UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  check_type  TEXT NOT NULL,
  status      TEXT NOT NULL,
  details     JSONB NOT NULL DEFAULT '{}',
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE source_health_events IS 'Health check results for each monitored source (robots.txt, availability, terms compliance).';

CREATE INDEX idx_source_health_events_source ON source_health_events(source_id);
CREATE INDEX idx_source_health_events_checked ON source_health_events(checked_at DESC);
