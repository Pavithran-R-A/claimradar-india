-- Migration 008: Security Fixes
-- Addresses critical security issues from code review.

-- =============================================================================
-- 1. Prevent role escalation via client API
-- =============================================================================

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role cannot be changed via client API';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- =============================================================================
-- 2. Fix is_admin() to only match actual admins
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END; $$;

-- =============================================================================
-- 3. Add is_staff() for editorial/governance access
-- =============================================================================

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'editor', 'legal_reviewer')
  );
END; $$;

-- =============================================================================
-- 4. Update RLS policies: editorial tables use is_staff() instead of is_admin()
-- =============================================================================

-- review_assignments
DROP POLICY IF EXISTS ra_select_editor ON review_assignments;
DROP POLICY IF EXISTS ra_manage_admin ON review_assignments;
CREATE POLICY ra_select_editor ON review_assignments FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY ra_manage_admin ON review_assignments FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- legal_reviews
DROP POLICY IF EXISTS lr_select_editor ON legal_reviews;
DROP POLICY IF EXISTS lr_manage_admin ON legal_reviews;
CREATE POLICY lr_select_editor ON legal_reviews FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY lr_manage_admin ON legal_reviews FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- correction_requests (admin management policies)
DROP POLICY IF EXISTS cr_select_admin ON correction_requests;
DROP POLICY IF EXISTS cr_manage_admin ON correction_requests;
CREATE POLICY cr_select_admin ON correction_requests FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY cr_manage_admin ON correction_requests FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- editorial_notes
DROP POLICY IF EXISTS en_select_editor ON editorial_notes;
DROP POLICY IF EXISTS en_manage_admin ON editorial_notes;
CREATE POLICY en_select_editor ON editorial_notes FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY en_manage_admin ON editorial_notes FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- claimables (staff can manage)
DROP POLICY IF EXISTS claimables_select_admin ON claimables;
DROP POLICY IF EXISTS claimables_update_admin ON claimables;
DROP POLICY IF EXISTS claimables_insert_admin ON claimables;
DROP POLICY IF EXISTS claimables_delete_admin ON claimables;
CREATE POLICY claimables_select_admin ON claimables FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY claimables_update_admin ON claimables FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY claimables_insert_admin ON claimables FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY claimables_delete_admin ON claimables FOR DELETE TO authenticated USING (is_staff());

-- companies (staff can manage)
DROP POLICY IF EXISTS companies_select_admin ON companies;
DROP POLICY IF EXISTS companies_manage_admin ON companies;
CREATE POLICY companies_select_admin ON companies FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY companies_manage_admin ON companies FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- sources (staff can manage)
DROP POLICY IF EXISTS sources_select_admin ON sources;
DROP POLICY IF EXISTS sources_manage_admin ON sources;
CREATE POLICY sources_select_admin ON sources FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY sources_manage_admin ON sources FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- source_documents (staff can manage)
DROP POLICY IF EXISTS source_documents_select_admin ON source_documents;
DROP POLICY IF EXISTS source_documents_manage_admin ON source_documents;
CREATE POLICY source_documents_select_admin ON source_documents FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY source_documents_manage_admin ON source_documents FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- Infrastructure tables remain is_admin() only:
-- crawl_runs, ai_runs, webhook_events, audit_logs — no changes needed.

-- =============================================================================
-- 5. Add claim_matches INSERT and DELETE policies
-- =============================================================================

CREATE POLICY cm_insert_own ON claim_matches
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY cm_delete_own ON claim_matches
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- 6. Auto-update updated_at trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON claimables
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON user_answers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON claim_trackers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON correction_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON takedown_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
