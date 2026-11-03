-- Restrict sensitive signed-in customer support tickets to ADMIN staff only.
-- Prior policies used private.is_staff(), allowing researcher/editor/legal_reviewer
-- to read and manage all users' corrections and grievances via the Data API.
-- The /admin/customer-requests UI and server actions explicitly require admin.
-- This migration aligns database-side access with that narrower authorization.
--
-- Customer-owned INSERT and SELECT policies are intentionally unchanged.
-- No data changes, notification sends, user-role changes or publication writes.
--
-- Requires reviewed production backup and an explicit, tracked migration push
-- before it can protect the hosted database. Do not apply via ad hoc SQL.

DROP POLICY IF EXISTS ucrq_select_staff ON public.user_correction_requests;
DROP POLICY IF EXISTS ucrq_manage_staff ON public.user_correction_requests;

CREATE POLICY ucrq_select_staff ON public.user_correction_requests
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY ucrq_manage_staff ON public.user_correction_requests
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS gc_select_staff ON public.grievance_contacts;
DROP POLICY IF EXISTS gc_manage_staff ON public.grievance_contacts;

CREATE POLICY gc_select_staff ON public.grievance_contacts
  FOR SELECT TO authenticated
  USING (private.is_admin());

CREATE POLICY gc_manage_staff ON public.grievance_contacts
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());
