-- Migration 012: Supabase Security Advisor Hardening
-- Hardens search_path on trigger/helper functions, moves authorization helpers
-- to non-exposed schema `private`, revokes public EXECUTE privileges, and replaces
-- always-true RLS policy on takedown_requests with strict field constraints.

-- =============================================================================
-- 1. Private Authorization Schema & Helpers
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS private;

COMMENT ON SCHEMA private IS 'Internal security schema — not exposed over PostgREST HTTP API.';

-- Move core authorization logic to private.is_admin() with fixed search_path
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role = 'admin';
END;
$$;

COMMENT ON FUNCTION private.is_admin() IS 'Helper checking if auth.uid() has the admin staff role.';

-- Move core authorization logic to private.is_staff() with fixed search_path
CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role IN ('admin', 'editor', 'legal_reviewer', 'researcher');
END;
$$;

COMMENT ON FUNCTION private.is_staff() IS 'Helper checking if auth.uid() has any recognized staff role.';

-- Grant execution to authenticated users (required for RLS evaluation)
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff() TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_staff() FROM PUBLIC, anon;

-- =============================================================================
-- 2. Update RLS Policies & Public Delegate Helpers
-- =============================================================================

-- Update public.is_admin() to delegate to private.is_admin() with fixed search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN private.is_admin();
END;
$$;

-- Update public.is_staff() to delegate to private.is_staff() with fixed search_path
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN private.is_staff();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

-- Update specific domain table RLS policies to use private helpers directly
DROP POLICY IF EXISTS tr_select_admin ON public.takedown_requests;
DROP POLICY IF EXISTS tr_manage_admin ON public.takedown_requests;

CREATE POLICY tr_select_admin ON public.takedown_requests
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY tr_manage_admin ON public.takedown_requests
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS al_select_admin ON public.audit_logs;
DROP POLICY IF EXISTS al_insert_admin ON public.audit_logs;

CREATE POLICY al_select_admin ON public.audit_logs
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY al_insert_admin ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS en_select_editor ON public.editorial_notes;
DROP POLICY IF EXISTS en_manage_admin ON public.editorial_notes;

CREATE POLICY en_select_editor ON public.editorial_notes
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY en_manage_admin ON public.editorial_notes
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS ra_select_editor ON public.review_assignments;
DROP POLICY IF EXISTS ra_manage_admin ON public.review_assignments;

CREATE POLICY ra_select_editor ON public.review_assignments
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY ra_manage_admin ON public.review_assignments
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS lr_select_editor ON public.legal_reviews;
DROP POLICY IF EXISTS lr_manage_admin ON public.legal_reviews;

CREATE POLICY lr_select_editor ON public.legal_reviews
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY lr_manage_admin ON public.legal_reviews
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS cr_select_admin ON public.correction_requests;
DROP POLICY IF EXISTS cr_manage_admin ON public.correction_requests;

CREATE POLICY cr_select_admin ON public.correction_requests
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY cr_manage_admin ON public.correction_requests
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS claimables_select_admin ON public.claimables;
DROP POLICY IF EXISTS claimables_update_admin ON public.claimables;
DROP POLICY IF EXISTS claimables_insert_admin ON public.claimables;
DROP POLICY IF EXISTS claimables_delete_admin ON public.claimables;

CREATE POLICY claimables_select_admin ON public.claimables
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY claimables_update_admin ON public.claimables
  FOR UPDATE TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

CREATE POLICY claimables_insert_admin ON public.claimables
  FOR INSERT TO authenticated
  WITH CHECK (private.is_staff());

CREATE POLICY claimables_delete_admin ON public.claimables
  FOR DELETE TO authenticated
  USING (private.is_staff());

DROP POLICY IF EXISTS companies_select_admin ON public.companies;
DROP POLICY IF EXISTS companies_manage_admin ON public.companies;

CREATE POLICY companies_select_admin ON public.companies
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY companies_manage_admin ON public.companies
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS sources_select_admin ON public.sources;
DROP POLICY IF EXISTS sources_manage_admin ON public.sources;

CREATE POLICY sources_select_admin ON public.sources
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY sources_manage_admin ON public.sources
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS source_documents_select_admin ON public.source_documents;
DROP POLICY IF EXISTS source_documents_manage_admin ON public.source_documents;

CREATE POLICY source_documents_select_admin ON public.source_documents
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY source_documents_manage_admin ON public.source_documents
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS clusters_select_staff ON public.content_clusters;
DROP POLICY IF EXISTS clusters_manage_staff ON public.content_clusters;

CREATE POLICY clusters_select_staff ON public.content_clusters
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY clusters_manage_staff ON public.content_clusters
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS cluster_members_select_staff ON public.content_cluster_members;
DROP POLICY IF EXISTS cluster_members_manage_staff ON public.content_cluster_members;

CREATE POLICY cluster_members_select_staff ON public.content_cluster_members
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY cluster_members_manage_staff ON public.content_cluster_members
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS uor_select_staff ON public.user_onboarding_responses;
DROP POLICY IF EXISTS uor_manage_staff ON public.user_onboarding_responses;

CREATE POLICY uor_select_staff ON public.user_onboarding_responses
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY uor_manage_staff ON public.user_onboarding_responses
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS ucr_select_staff ON public.user_correction_requests;
DROP POLICY IF EXISTS ucr_manage_staff ON public.user_correction_requests;

CREATE POLICY ucr_select_staff ON public.user_correction_requests
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY ucr_manage_staff ON public.user_correction_requests
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS cwr_select_staff ON public.consent_withdrawal_requests;
DROP POLICY IF EXISTS cwr_manage_staff ON public.consent_withdrawal_requests;

CREATE POLICY cwr_select_staff ON public.consent_withdrawal_requests
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY cwr_manage_staff ON public.consent_withdrawal_requests
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

DROP POLICY IF EXISTS notif_select_staff ON public.notifications;
DROP POLICY IF EXISTS notif_manage_staff ON public.notifications;

CREATE POLICY notif_select_staff ON public.notifications
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY notif_manage_staff ON public.notifications
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

-- =============================================================================
-- 3. Function Search Path Hardening & Privilege Revocation
-- =============================================================================

-- Harden set_updated_at()
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS 'Trigger helper updating the updated_at timestamp column.';

-- Harden prevent_role_escalation()
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT private.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can change profile roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_role_escalation() IS 'Trigger preventing non-admin users from escalating their profile role.';

REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation() FROM PUBLIC, anon, authenticated;

-- Harden handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger on auth.users creating a matching profile row on signup.';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- =============================================================================
-- 4. Harden takedown_requests RLS Policy
-- =============================================================================

DROP POLICY IF EXISTS tr_insert_public ON public.takedown_requests;

CREATE POLICY tr_insert_public ON public.takedown_requests
  FOR INSERT
  WITH CHECK (
    status = 'new'
    AND length(trim(requester_name)) > 0
    AND length(trim(requester_email)) > 3
    AND length(trim(reason)) > 0
  );

COMMENT ON POLICY tr_insert_public ON public.takedown_requests IS 'Restricts public takedown insertions to new status with non-empty fields.';
