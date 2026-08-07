-- Migration 013: Security Advisor Follow-up — Repoint All RLS Policies to Private Helpers & Drop Public Wrappers
-- Repoints all remaining table RLS policies across schema to private.is_admin() and private.is_staff(),
-- allowing public.is_admin() and public.is_staff() helper functions to be completely dropped.

-- =============================================================================
-- 1. Repoint Migration 001 Tables (Initial Schema)
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (private.is_admin());

-- Sectors
DROP POLICY IF EXISTS sectors_manage_admin ON public.sectors;
CREATE POLICY sectors_manage_admin ON public.sectors
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Claim Sources
DROP POLICY IF EXISTS claim_sources_manage_admin ON public.claim_sources;
CREATE POLICY claim_sources_manage_admin ON public.claim_sources
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Claim Evidence
DROP POLICY IF EXISTS claim_evidence_manage_admin ON public.claim_evidence;
CREATE POLICY claim_evidence_manage_admin ON public.claim_evidence
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Eligibility Rules
DROP POLICY IF EXISTS eligibility_rules_manage_admin ON public.eligibility_rules;
CREATE POLICY eligibility_rules_manage_admin ON public.eligibility_rules
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Claim Versions
DROP POLICY IF EXISTS claim_versions_select_admin ON public.claim_versions;
DROP POLICY IF EXISTS claim_versions_insert_admin ON public.claim_versions;

CREATE POLICY claim_versions_select_admin ON public.claim_versions
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY claim_versions_insert_admin ON public.claim_versions
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin());

-- =============================================================================
-- 2. Repoint Migration 002 Tables (Ingestion Tables)
-- =============================================================================

-- Crawl Runs
DROP POLICY IF EXISTS crawl_runs_admin ON public.crawl_runs;
CREATE POLICY crawl_runs_admin ON public.crawl_runs
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Crawl Run Sources
DROP POLICY IF EXISTS crawl_run_sources_admin ON public.crawl_run_sources;
CREATE POLICY crawl_run_sources_admin ON public.crawl_run_sources
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Crawl Errors
DROP POLICY IF EXISTS crawl_errors_admin ON public.crawl_errors;
CREATE POLICY crawl_errors_admin ON public.crawl_errors
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Candidate Documents
DROP POLICY IF EXISTS candidate_documents_admin ON public.candidate_documents;
CREATE POLICY candidate_documents_admin ON public.candidate_documents
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- AI Runs
DROP POLICY IF EXISTS ai_runs_admin ON public.ai_runs;
CREATE POLICY ai_runs_admin ON public.ai_runs
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Validation Results
DROP POLICY IF EXISTS validation_results_admin ON public.validation_results;
CREATE POLICY validation_results_admin ON public.validation_results
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Publication Events
DROP POLICY IF EXISTS publication_events_admin ON public.publication_events;
CREATE POLICY publication_events_admin ON public.publication_events
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Source Health Events
DROP POLICY IF EXISTS source_health_events_admin ON public.source_health_events;
CREATE POLICY source_health_events_admin ON public.source_health_events
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- =============================================================================
-- 3. Repoint Migration 004 Tables (Billing Tables)
-- =============================================================================

-- Plans
DROP POLICY IF EXISTS plans_manage_admin ON public.plans;
CREATE POLICY plans_manage_admin ON public.plans
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Subscriptions
DROP POLICY IF EXISTS subs_select_admin ON public.subscriptions;
DROP POLICY IF EXISTS subs_manage_admin ON public.subscriptions;

CREATE POLICY subs_select_admin ON public.subscriptions
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY subs_manage_admin ON public.subscriptions
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Payment Customers
DROP POLICY IF EXISTS pc_manage_admin ON public.payment_customers;
CREATE POLICY pc_manage_admin ON public.payment_customers
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Payment Events
DROP POLICY IF EXISTS pe_select_admin ON public.payment_events;
DROP POLICY IF EXISTS pe_manage_admin ON public.payment_events;

CREATE POLICY pe_select_admin ON public.payment_events
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY pe_manage_admin ON public.payment_events
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Webhook Events
DROP POLICY IF EXISTS we_admin ON public.webhook_events;
CREATE POLICY we_admin ON public.webhook_events
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- Entitlements
DROP POLICY IF EXISTS ent_manage_admin ON public.entitlements;
CREATE POLICY ent_manage_admin ON public.entitlements
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- =============================================================================
-- 4. Repoint Migration 010 Tables (User Product Tables)
-- =============================================================================

-- User Correction Requests
DROP POLICY IF EXISTS ucrq_select_staff ON public.user_correction_requests;
DROP POLICY IF EXISTS ucrq_manage_staff ON public.user_correction_requests;
DROP POLICY IF EXISTS ucr_select_staff ON public.user_correction_requests;
DROP POLICY IF EXISTS ucr_manage_staff ON public.user_correction_requests;

CREATE POLICY ucrq_select_staff ON public.user_correction_requests
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY ucrq_manage_staff ON public.user_correction_requests
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

-- Grievance Contacts
DROP POLICY IF EXISTS gc_select_staff ON public.grievance_contacts;
DROP POLICY IF EXISTS gc_manage_staff ON public.grievance_contacts;

CREATE POLICY gc_select_staff ON public.grievance_contacts
  FOR SELECT TO authenticated
  USING (private.is_staff());

CREATE POLICY gc_manage_staff ON public.grievance_contacts
  FOR ALL TO authenticated
  USING (private.is_staff())
  WITH CHECK (private.is_staff());

-- =============================================================================
-- 5. Drop Public SECURITY DEFINER Function Wrappers
-- =============================================================================

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_staff();
