-- pgTAP Test 002: Anonymous Public RLS Access
BEGIN;
SELECT plan(6);

-- Set role to anon
SET LOCAL ROLE anon;

SELECT results_eq(
  'SELECT count(*)::int FROM claimables WHERE publication_status = ''draft''',
  ARRAY[0],
  'Anonymous users cannot read draft claimables'
);

SELECT results_eq(
  'SELECT count(*)::int FROM candidate_documents',
  ARRAY[0],
  'Anonymous users cannot read candidate documents'
);

SELECT results_eq(
  'SELECT count(*)::int FROM ai_runs',
  ARRAY[0],
  'Anonymous users cannot read AI runs'
);

SELECT throws_ok(
  'INSERT INTO claimables (slug, public_title) VALUES (''test'', ''test'')',
  '42501',
  NULL,
  'Anonymous users cannot insert claimables'
);

SELECT throws_ok(
  'UPDATE claimables SET public_title = ''hack'' WHERE id = ''00000000-0000-0000-0000-000000000000''',
  '42501',
  NULL,
  'Anonymous users cannot update claimables'
);

SELECT throws_ok(
  'DELETE FROM claimables WHERE id = ''00000000-0000-0000-0000-000000000000''',
  '42501',
  NULL,
  'Anonymous users cannot delete claimables'
);

SELECT * FROM finish();
ROLLBACK;
