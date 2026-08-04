-- Migration 005: Editorial & Governance Tables
-- Review workflows, legal reviews, correction/takedown requests, editorial notes, and audit logs.

-- =============================================================================
-- Review Assignments
-- =============================================================================

CREATE TABLE review_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  notes         TEXT
);

COMMENT ON TABLE review_assignments IS 'Editorial review queue — assigns claimables to editors for verification before publication.';

CREATE INDEX idx_review_assignments_claimable ON review_assignments(claimable_id);
CREATE INDEX idx_review_assignments_assignee  ON review_assignments(assigned_to);
CREATE INDEX idx_review_assignments_status    ON review_assignments(status);

-- =============================================================================
-- Legal Reviews
-- =============================================================================

CREATE TABLE legal_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  reviewer_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decision      TEXT NOT NULL,
  findings      TEXT,
  reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE legal_reviews IS 'Formal legal review records — required before a claimable can reach verified_claimable status.';

CREATE INDEX idx_legal_reviews_claimable ON legal_reviews(claimable_id);
CREATE INDEX idx_legal_reviews_reviewer  ON legal_reviews(reviewer_id);

-- =============================================================================
-- Correction Requests
-- =============================================================================

CREATE TABLE correction_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  submitted_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_email TEXT,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new',
  resolution    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE correction_requests IS 'User or external reporter submissions requesting factual corrections to published claimables.';

CREATE INDEX idx_correction_requests_claimable ON correction_requests(claimable_id);
CREATE INDEX idx_correction_requests_status    ON correction_requests(status);

-- =============================================================================
-- Takedown Requests
-- =============================================================================

CREATE TABLE takedown_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id    UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  requester_name  TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  reason          TEXT NOT NULL,
  legal_basis     TEXT,
  status          TEXT NOT NULL DEFAULT 'new',
  resolution      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE takedown_requests IS 'Legal takedown or cease-and-desist requests — tracked for compliance and audit.';

CREATE INDEX idx_takedown_requests_claimable ON takedown_requests(claimable_id);
CREATE INDEX idx_takedown_requests_status    ON takedown_requests(status);

-- =============================================================================
-- Editorial Notes
-- =============================================================================

CREATE TABLE editorial_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE editorial_notes IS 'Internal discussion notes attached to claimables by editorial and legal staff.';

CREATE INDEX idx_editorial_notes_claimable ON editorial_notes(claimable_id);

-- =============================================================================
-- Audit Logs
-- =============================================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID,
  actor_type  TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  changes     JSONB NOT NULL DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail of privileged state changes across all entities (admin actions, status transitions).';

CREATE INDEX idx_audit_logs_actor      ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX idx_audit_logs_created    ON audit_logs(created_at DESC);
