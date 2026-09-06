-- pgTAP Test 012: Notification Delivery Log RLS Hardening
BEGIN;
SELECT plan(14);

SELECT results_eq(
  $$SELECT relrowsecurity FROM pg_class
    WHERE oid = 'public.notification_delivery_log'::regclass$$,
  ARRAY[true],
  'notification_delivery_log has RLS enabled'
);

SELECT results_eq(
  $$SELECT has_table_privilege('anon', 'public.notification_delivery_log', 'SELECT')$$,
  ARRAY[false],
  'anon has no delivery-log SELECT privilege'
);

SELECT results_eq(
  $$SELECT has_table_privilege('authenticated', 'public.notification_delivery_log', 'SELECT')$$,
  ARRAY[false],
  'authenticated has no delivery-log SELECT privilege'
);

SELECT results_eq(
  $$SELECT has_table_privilege('service_role', 'public.notification_delivery_log', 'SELECT')$$,
  ARRAY[true],
  'service_role may read delivery-log rows'
);

SELECT results_eq(
  $$SELECT has_table_privilege('service_role', 'public.notification_delivery_log', 'INSERT')$$,
  ARRAY[true],
  'service_role may insert delivery-log rows'
);

SELECT results_eq(
  $$SELECT has_table_privilege('service_role', 'public.notification_delivery_log', 'UPDATE')$$,
  ARRAY[true],
  'service_role may update delivery-log rows'
);

SELECT results_eq(
  $$SELECT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notification_delivery_log'
       AND policyname = 'notification_delivery_log_service_role_access'
       AND roles = ARRAY['service_role']::name[]
       AND cmd = 'ALL'
  )$$,
  ARRAY[true],
  'service-role delivery-log policy exists'
);

SELECT results_eq(
  $$SELECT NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notification_delivery_log'
       AND 'anon' = ANY(roles)
  )$$,
  ARRAY[true],
  'anon has no delivery-log policy'
);

SELECT results_eq(
  $$SELECT NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'notification_delivery_log'
       AND 'authenticated' = ANY(roles)
  )$$,
  ARRAY[true],
  'authenticated users have no delivery-log policy'
);

SELECT results_eq(
  $$SELECT indexrelid::regclass::text = 'public.idx_claim_evidence_source_document'
      FROM pg_index
     WHERE indexrelid = 'public.idx_claim_evidence_source_document'::regclass$$,
  ARRAY[true],
  'claim_evidence source_document_id index exists'
);

SELECT results_eq(
  $$SELECT indexrelid::regclass::text = 'public.idx_claim_sources_source_document'
      FROM pg_index
     WHERE indexrelid = 'public.idx_claim_sources_source_document'::regclass$$,
  ARRAY[true],
  'claim_sources source_document_id index exists'
);

SELECT results_eq(
  $$SELECT indexrelid::regclass::text = 'public.idx_notification_delivery_log_notification_id'
      FROM pg_index
     WHERE indexrelid = 'public.idx_notification_delivery_log_notification_id'::regclass$$,
  ARRAY[true],
  'notification_id index exists'
);

SELECT results_eq(
  $$SELECT indexrelid::regclass::text = 'public.idx_correction_requests_submitted_by'
      FROM pg_index
     WHERE indexrelid = 'public.idx_correction_requests_submitted_by'::regclass$$,
  ARRAY[true],
  'correction_requests submitted_by index exists'
);

SELECT results_eq(
  $$SELECT indexrelid::regclass::text = 'public.idx_editorial_notes_author_id'
      FROM pg_index
     WHERE indexrelid = 'public.idx_editorial_notes_author_id'::regclass$$,
  ARRAY[true],
  'editorial_notes author_id index exists'
);

SELECT * FROM finish();
ROLLBACK;
