-- pgTAP Test 004: Staff & Admin Role Privileges
BEGIN;
SELECT plan(3);

SELECT has_function('public', 'is_staff', 'is_staff helper function exists');
SELECT has_function('public', 'is_admin', 'is_admin helper function exists');

SELECT is_definer('public', 'is_staff', 'is_staff is SECURITY DEFINER');

SELECT * FROM finish();
ROLLBACK;
