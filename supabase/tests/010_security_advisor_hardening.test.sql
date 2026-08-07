-- pgTAP Test 010: Security Advisor Hardening (Migrations 012 & 013)
BEGIN;
SELECT plan(7);

-- 1. Schema private exists
SELECT has_schema('private', 'Schema private should exist');

-- 2. Helper functions in private schema
SELECT has_function('private', 'is_admin', 'Function private.is_admin() should exist');
SELECT has_function('private', 'is_staff', 'Function private.is_staff() should exist');

-- 3. Public functions dropped
SELECT hasnt_function('public', 'is_admin', 'Function public.is_admin() should be dropped');
SELECT hasnt_function('public', 'is_staff', 'Function public.is_staff() should be dropped');

-- 4. Security Definer checks
SELECT is_definer('private', 'is_admin', 'private.is_admin() should be SECURITY DEFINER');
SELECT is_definer('private', 'is_staff', 'private.is_staff() should be SECURITY DEFINER');

SELECT * FROM finish();
ROLLBACK;
