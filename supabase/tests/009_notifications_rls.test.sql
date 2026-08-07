BEGIN;
SELECT plan(5);

-- Test 1: Notification delivery log table exists
SELECT has_table('public', 'notification_delivery_log', 'notification_delivery_log table exists');

-- Test 2: Notification delivery log primary key is id
SELECT col_is_pk('public', 'notification_delivery_log', 'id', 'notification_delivery_log primary key is id');

-- Set role to anon for RLS tests
SET LOCAL ROLE anon;

-- Test 3: Anonymous cannot read notification_delivery_log
SELECT results_eq(
  'SELECT count(*)::int FROM notification_delivery_log',
  ARRAY[0],
  'Anonymous users cannot read notification delivery log'
);

-- Test 4: Anonymous cannot read notifications
SELECT results_eq(
  'SELECT count(*)::int FROM notifications',
  ARRAY[0],
  'Anonymous users cannot read notifications'
);

-- Test 5: Anonymous cannot insert notification_delivery_log
SELECT throws_ok(
  'INSERT INTO notification_delivery_log (user_id, notification_type, channel, dedup_key) VALUES (''00000000-0000-0000-0000-000000000000'', ''new_match'', ''email'', ''test-key'')',
  '42501',
  NULL,
  'Anonymous users cannot insert notification delivery log'
);

SELECT * FROM finish();
ROLLBACK;
