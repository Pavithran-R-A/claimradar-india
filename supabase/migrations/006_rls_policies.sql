-- Migration 006: Row Level Security Policies
-- Enables RLS on every user-facing table and creates role-based access policies.

-- =============================================================================
-- Helper: is_admin() — SECURITY DEFINER for fast role checks
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'editor', 'legal_reviewer')
  );
END;
$$;

COMMENT ON FUNCTION is_admin() IS 'Returns true when the current authenticated user has admin, editor, or legal_reviewer role.';

-- =============================================================================
-- Profiles
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY profiles_select_admin ON profiles
  FOR SELECT TO authenticated
  USING (is_admin());

-- =============================================================================
-- Sectors (public read)
-- =============================================================================

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY sectors_select_all ON sectors
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY sectors_manage_admin ON sectors
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Companies
-- =============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_select_published ON companies
  FOR SELECT TO authenticated, anon
  USING (publication_status = 'published');

CREATE POLICY companies_select_admin ON companies
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY companies_manage_admin ON companies
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Sources (admin only)
-- =============================================================================

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY sources_select_admin ON sources
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY sources_manage_admin ON sources
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Source Documents (admin only)
-- =============================================================================

ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY source_documents_select_admin ON source_documents
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY source_documents_manage_admin ON source_documents
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Claimables
-- =============================================================================

ALTER TABLE claimables ENABLE ROW LEVEL SECURITY;

CREATE POLICY claimables_select_published ON claimables
  FOR SELECT TO authenticated, anon
  USING (publication_status = 'published');

CREATE POLICY claimables_select_admin ON claimables
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY claimables_update_admin ON claimables
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY claimables_insert_admin ON claimables
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY claimables_delete_admin ON claimables
  FOR DELETE TO authenticated
  USING (is_admin());

-- =============================================================================
-- Claim Sources (follows claimables visibility)
-- =============================================================================

ALTER TABLE claim_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY claim_sources_select_published ON claim_sources
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM claimables
      WHERE claimables.id = claim_sources.claimable_id
        AND claimables.publication_status = 'published'
    )
  );

CREATE POLICY claim_sources_manage_admin ON claim_sources
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Claim Evidence
-- =============================================================================

ALTER TABLE claim_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY claim_evidence_select_published ON claim_evidence
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM claimables
      WHERE claimables.id = claim_evidence.claimable_id
        AND claimables.publication_status = 'published'
    )
  );

CREATE POLICY claim_evidence_manage_admin ON claim_evidence
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Eligibility Rules
-- =============================================================================

ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY eligibility_rules_select_published ON eligibility_rules
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM claimables
      WHERE claimables.id = eligibility_rules.claimable_id
        AND claimables.publication_status = 'published'
    )
  );

CREATE POLICY eligibility_rules_manage_admin ON eligibility_rules
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Claim Versions (admin only)
-- =============================================================================

ALTER TABLE claim_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY claim_versions_select_admin ON claim_versions
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY claim_versions_insert_admin ON claim_versions
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- =============================================================================
-- User Company Watchlists
-- =============================================================================

ALTER TABLE user_company_watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY ucw_select_own ON user_company_watchlists
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ucw_insert_own ON user_company_watchlists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ucw_update_own ON user_company_watchlists
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ucw_delete_own ON user_company_watchlists
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- User Sector Watchlists
-- =============================================================================

ALTER TABLE user_sector_watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY usw_select_own ON user_sector_watchlists
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY usw_insert_own ON user_sector_watchlists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY usw_update_own ON user_sector_watchlists
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY usw_delete_own ON user_sector_watchlists
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- User Answers
-- =============================================================================

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY ua_select_own ON user_answers
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ua_insert_own ON user_answers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ua_update_own ON user_answers
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ua_delete_own ON user_answers
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Claim Matches (read only for owner)
-- =============================================================================

ALTER TABLE claim_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY cm_select_own ON claim_matches
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY cm_update_own ON claim_matches
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Claim Trackers
-- =============================================================================

ALTER TABLE claim_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_select_own ON claim_trackers
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ct_insert_own ON claim_trackers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ct_update_own ON claim_trackers
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ct_delete_own ON claim_trackers
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Notification Preferences
-- =============================================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY np_select_own ON notification_preferences
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY np_insert_own ON notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY np_update_own ON notification_preferences
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Notifications
-- =============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY n_select_own ON notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY n_update_own ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Consent Events
-- =============================================================================

ALTER TABLE consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY ce_select_own ON consent_events
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ce_insert_own ON consent_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Account Export Requests
-- =============================================================================

ALTER TABLE account_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY aer_select_own ON account_export_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY aer_insert_own ON account_export_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Account Deletion Requests
-- =============================================================================

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY adr_select_own ON account_deletion_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY adr_insert_own ON account_deletion_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =============================================================================
-- Billing Tables (admin + owner)
-- =============================================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_select_all ON plans
  FOR SELECT TO authenticated, anon
  USING (enabled = true);

CREATE POLICY plans_manage_admin ON plans
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subs_select_own ON subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY subs_select_admin ON subscriptions
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY subs_manage_admin ON subscriptions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY pc_select_own ON payment_customers
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY pc_manage_admin ON payment_customers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY pe_select_own ON payment_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = payment_events.subscription_id
        AND subscriptions.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY pe_select_admin ON payment_events
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY pe_manage_admin ON payment_events
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY we_admin ON webhook_events
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY ent_select_own ON entitlements
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ent_manage_admin ON entitlements
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Ingestion Pipeline Tables (admin only)
-- =============================================================================

ALTER TABLE crawl_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY crawl_runs_admin ON crawl_runs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE crawl_run_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY crawl_run_sources_admin ON crawl_run_sources FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE crawl_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY crawl_errors_admin ON crawl_errors FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY candidate_documents_admin ON candidate_documents FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_runs_admin ON ai_runs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY validation_results_admin ON validation_results FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE publication_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY publication_events_admin ON publication_events FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE source_health_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY source_health_events_admin ON source_health_events FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- Editorial & Governance Tables (admin/editor only)
-- =============================================================================

ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY ra_select_editor ON review_assignments FOR SELECT TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY ra_manage_admin ON review_assignments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE legal_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY lr_select_editor ON legal_reviews FOR SELECT TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY lr_manage_admin ON legal_reviews FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY cr_insert_authenticated ON correction_requests
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = (SELECT auth.uid()));

CREATE POLICY cr_select_own ON correction_requests
  FOR SELECT TO authenticated
  USING (submitted_by = (SELECT auth.uid()));

CREATE POLICY cr_select_admin ON correction_requests
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY cr_manage_admin ON correction_requests
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE takedown_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY tr_insert_public ON takedown_requests
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY tr_select_admin ON takedown_requests
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY tr_manage_admin ON takedown_requests
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

ALTER TABLE editorial_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY en_select_editor ON editorial_notes FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY en_manage_admin ON editorial_notes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY al_select_admin ON audit_logs FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY al_insert_admin ON audit_logs FOR INSERT TO authenticated WITH CHECK (is_admin());
