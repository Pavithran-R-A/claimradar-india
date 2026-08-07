-- pgTAP Test 004: Staff & Admin Role Privileges
BEGIN;
SELECT plan(3);

SELECT has_function('private', 'is_staff', 'is_staff helper function exists in private schema');
SELECT has_function('private', 'is_admin', 'is_admin helper function exists in private schema');

SELECT is_definer('private', 'is_staff', 'is_staff is SECURITY DEFINER');

SELECT * FROM finish();
ROLLBACK;
