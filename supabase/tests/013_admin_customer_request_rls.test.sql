-- pgTAP: ADMIN-only customer correction/grievance triage.
-- Execute against a disposable local Supabase DB AFTER migration.
-- This asserts policy shape; a separate two-identity test must verify runtime
-- cross-account denial and appropriate admin access.
BEGIN;
SELECT plan(8);

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public'
    AND tablename='user_correction_requests'
    AND policyname IN ('ucrq_select_staff','ucrq_manage_staff')
    AND qual = 'private.is_admin()'
), 2, 'Customer correction staff policies now require admin');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public'
    AND tablename='user_correction_requests'
    AND policyname IN ('ucrq_select_staff','ucrq_manage_staff')
    AND coalesce(with_check, 'private.is_admin()') = 'private.is_admin()'
), 2, 'Customer correction staff writes cannot bypass admin WITH CHECK');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public'
    AND tablename='grievance_contacts'
    AND policyname IN ('gc_select_staff','gc_manage_staff')
    AND qual = 'private.is_admin()'
), 2, 'Grievance staff policies now require admin');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public'
    AND tablename='grievance_contacts'
    AND policyname IN ('gc_select_staff','gc_manage_staff')
    AND coalesce(with_check, 'private.is_admin()') = 'private.is_admin()'
), 2, 'Grievance staff writes cannot bypass admin WITH CHECK');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public' AND tablename='user_correction_requests'
    AND policyname='ucrq_select_own' AND qual LIKE '%auth.uid()%'
), 1, 'Customers retain own correction request reads');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public' AND tablename='user_correction_requests'
    AND policyname='ucrq_insert_own' AND with_check LIKE '%auth.uid()%'
), 1, 'Customers retain own correction request inserts');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public' AND tablename='grievance_contacts'
    AND policyname='gc_select_own' AND qual LIKE '%auth.uid()%'
), 1, 'Customers retain own grievance reads');

SELECT is((
  SELECT count(*)::int FROM pg_policies
  WHERE schemaname='public' AND tablename='grievance_contacts'
    AND policyname='gc_insert_own' AND with_check LIKE '%auth.uid()%'
), 1, 'Customers retain own grievance inserts');

SELECT * FROM finish();
ROLLBACK;
