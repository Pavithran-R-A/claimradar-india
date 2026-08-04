-- pgTAP Test 003: Authenticated User Isolation
BEGIN;
SELECT plan(4);

SET LOCAL ROLE authenticated;

SELECT results_eq(
  'SELECT count(*)::int FROM profiles WHERE id != auth.uid()',
  ARRAY[0],
  'Authenticated user cannot read other user profiles'
);

SELECT results_eq(
  'SELECT count(*)::int FROM claim_trackers WHERE user_id != auth.uid()',
  ARRAY[0],
  'Authenticated user cannot read other user claim trackers'
);

SELECT results_eq(
  'SELECT count(*)::int FROM user_company_watchlists WHERE user_id != auth.uid()',
  ARRAY[0],
  'Authenticated user cannot read other user watchlists'
);

SELECT results_eq(
  'SELECT count(*)::int FROM notification_preferences WHERE user_id != auth.uid()',
  ARRAY[0],
  'Authenticated user cannot read other user notification preferences'
);

SELECT * FROM finish();
ROLLBACK;
