-- Migration 010: User Product Schema
-- Authenticated user product support: onboarding responses, tracker status
-- constraints, match confidence domain, and missing privacy tables
-- (user corrections, consent withdrawals, grievance contact log).

-- =============================================================================
-- 1. Claim tracker status domain (8 user-facing statuses)
-- =============================================================================

ALTER TABLE claim_trackers
  ADD CONSTRAINT claim_trackers_status_check CHECK (status IN (
    'saved',
    'reviewing',
    'gathering_proof',
    'submitted_externally',
    'awaiting_response',
    'approved',
    'rejected',
    'closed'
  ));

COMMENT ON CONSTRAINT claim_trackers_status_check ON claim_trackers IS
  'Restricts tracker rows to the eight user-reported statuses. "submitted_externally" is user-reported only — ClaimRadar never files claims on behalf of users.';

-- =============================================================================
-- 2. Claim match confidence domain (deterministic rule outcomes only)
-- =============================================================================

ALTER TABLE claim_matches
  ADD CONSTRAINT claim_matches_confidence_check CHECK (confidence IN (
    'strong_potential_match',
    'possible_match',
    'insufficient_information',
    'not_matched'
  ));

COMMENT ON CONSTRAINT claim_matches_confidence_check ON claim_matches IS
  'Restricts match confidence to the four outcomes of the deterministic rule-based matching engine. No LLM may assign these values.';

-- =============================================================================
-- 3. Onboarding responses (low-risk fields only — never documents)
-- =============================================================================

CREATE TABLE user_onboarding_responses (
  user_id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  companies_used           TEXT[] NOT NULL DEFAULT '{}',
  sectors_used             TEXT[] NOT NULL DEFAULT '{}',
  purchase_period_start    INT,
  purchase_period_end      INT,
  state                    TEXT,
  receipt_availability     TEXT NOT NULL DEFAULT 'unsure'
                           CHECK (receipt_availability IN ('yes', 'no', 'unsure')),
  reference_availability   TEXT NOT NULL DEFAULT 'unsure'
                           CHECK (reference_availability IN ('yes', 'no', 'unsure')),
  notification_preference  TEXT NOT NULL DEFAULT 'email'
                           CHECK (notification_preference IN ('email', 'in_app', 'none')),
  completed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_onboarding_responses IS
  'Low-risk onboarding answers (companies/sectors used, approximate purchase period, state, proof availability, notification preference). Documents and sensitive personal data are intentionally NOT collected.';

-- =============================================================================
-- 4. User correction requests (privacy: right to correction of own data)
-- =============================================================================

CREATE TABLE user_correction_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target        TEXT NOT NULL,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'in_review', 'resolved', 'declined')),
  resolution    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_correction_requests IS
  'User-submitted requests to correct inaccurate personal data held about them (DPDP right to correction).';

CREATE INDEX idx_user_correction_requests_user ON user_correction_requests(user_id);

-- =============================================================================
-- 5. Consent withdrawal requests
-- =============================================================================

CREATE TABLE consent_withdrawal_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type  TEXT NOT NULL,
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processed')),
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE consent_withdrawal_requests IS
  'Explicit consent withdrawal requests (DPDP right to withdraw consent). Each withdrawal is also mirrored as a consent_events row for the audit trail.';

CREATE INDEX idx_consent_withdrawal_requests_user ON consent_withdrawal_requests(user_id);

-- =============================================================================
-- 6. Grievance contact log
-- =============================================================================

CREATE TABLE grievance_contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'acknowledged', 'resolved')),
  resolution    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE grievance_contacts IS
  'Grievance redressal log — user privacy/data grievances tracked for DPDP compliance.';

CREATE INDEX idx_grievance_contacts_user ON grievance_contacts(user_id);

-- =============================================================================
-- 7. updated_at triggers for new tables
-- =============================================================================

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON user_onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON user_correction_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON grievance_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 8. Row Level Security (owner-scoped, following migration 006 patterns)
-- =============================================================================

ALTER TABLE user_onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY uor_select_own ON user_onboarding_responses
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY uor_insert_own ON user_onboarding_responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY uor_update_own ON user_onboarding_responses
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY uor_delete_own ON user_onboarding_responses
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

ALTER TABLE user_correction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY ucrq_select_own ON user_correction_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ucrq_insert_own ON user_correction_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ucrq_select_staff ON user_correction_requests
  FOR SELECT TO authenticated
  USING (is_staff());

CREATE POLICY ucrq_manage_staff ON user_correction_requests
  FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

ALTER TABLE consent_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY cwr_select_own ON consent_withdrawal_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY cwr_insert_own ON consent_withdrawal_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY cwr_select_staff ON consent_withdrawal_requests
  FOR SELECT TO authenticated
  USING (is_staff());

CREATE POLICY cwr_manage_staff ON consent_withdrawal_requests
  FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

ALTER TABLE grievance_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY gc_select_own ON grievance_contacts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY gc_insert_own ON grievance_contacts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY gc_select_staff ON grievance_contacts
  FOR SELECT TO authenticated
  USING (is_staff());

CREATE POLICY gc_manage_staff ON grievance_contacts
  FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- =============================================================================
-- 9. Explicit privileges (mirrors migration 008 grant posture)
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON user_onboarding_responses,
  user_correction_requests, consent_withdrawal_requests, grievance_contacts
  TO authenticated, service_role;

GRANT SELECT ON user_onboarding_responses, user_correction_requests,
  consent_withdrawal_requests, grievance_contacts TO anon;
