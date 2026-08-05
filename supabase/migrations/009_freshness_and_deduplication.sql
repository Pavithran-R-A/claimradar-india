-- Migration 009: Freshness & Provenance Deduplication Tables and Columns
-- Supports database-level source health, content change tracking, canonical clustering, and review age metrics.

-- =============================================================================
-- 1. Content Clusters (Provenance-Safe Deduplication)
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_clusters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_hash TEXT NOT NULL UNIQUE,
  cluster_title  TEXT,
  canonical_url  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE content_clusters IS 'Groups identical or canonical source documents under a SHA-256 hash cluster while preserving distinct URL provenance.';

CREATE TABLE IF NOT EXISTS content_cluster_members (
  cluster_id         UUID NOT NULL REFERENCES content_clusters(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  assigned_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cluster_id, source_document_id)
);

COMMENT ON TABLE content_cluster_members IS 'Junction linking individual official source documents to their assigned content cluster.';

CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster ON content_cluster_members(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_doc ON content_cluster_members(source_document_id);

-- =============================================================================
-- 2. Source Freshness Columns on Sources & Claimables
-- =============================================================================

ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS health_state TEXT NOT NULL DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS last_content_change_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error_category TEXT;

ALTER TABLE claimables
  ADD COLUMN IF NOT EXISTS deadline_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_age_days INT NOT NULL DEFAULT 0;

-- =============================================================================
-- 3. Row Level Security Policies
-- =============================================================================

ALTER TABLE content_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cluster_members ENABLE ROW LEVEL SECURITY;

-- Anonymous users cannot access ingestion clusters
DROP POLICY IF EXISTS clusters_select_staff ON content_clusters;
DROP POLICY IF EXISTS clusters_manage_staff ON content_clusters;
CREATE POLICY clusters_select_staff ON content_clusters FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY clusters_manage_staff ON content_clusters FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS cluster_members_select_staff ON content_cluster_members;
DROP POLICY IF EXISTS cluster_members_manage_staff ON content_cluster_members;
CREATE POLICY cluster_members_select_staff ON content_cluster_members FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY cluster_members_manage_staff ON content_cluster_members FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

REVOKE ALL ON content_clusters, content_cluster_members FROM anon, authenticated, service_role;
GRANT SELECT ON content_clusters, content_cluster_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_clusters, content_cluster_members TO authenticated, service_role;
