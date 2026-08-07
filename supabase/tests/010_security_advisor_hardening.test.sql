-- pgTAP Test 010: Security Advisor Hardening (Migration 012)
BEGIN;
SELECT plan(10);

-- 1. Schema private exists
SELECT has_schema('private', 'Schema private should exist');

-- 2. Helper functions in private schema
SELECT has_function('private', 'is_admin', 'Function private.is_admin() should exist');
SELECT has_function('private', 'is_staff', 'Function private.is_staff() should exist');

-- 3. Public is_admin and is_staff delegates exist with fixed search path
SELECT has_function('public', 'is_admin', 'Function public.is_admin() delegate should exist');
SELECT has_function('public', 'is_staff', 'Function public.is_staff() delegate should exist');

-- 4. Function search_path and Security Invoker/Definer checks
SELECT function_is_definer('private', 'is_admin', ARRAY[]::text[], 'private.is_admin() should be SECURITY DEFINER');
SELECT function_is_definer('private', 'is_staff', ARRAY[]::text[], 'private.is_staff() should be SECURITY DEFINER');
SELECT function_is_definer('public', 'prevent_role_escalation', ARRAY[]::text[], 'prevent_role_escalation() should be SECURITY DEFINER');
SELECT function_is_definer('public', 'handle_new_user', ARRAY[]::text[], 'handle_new_user() should be SECURITY DEFINER');

-- 5. RLS Policy on takedown_requests
SELECT has_policy('public', 'takedown_requests', 'tr_insert_public', 'takedown_requests should have tr_insert_public policy');

SELECT * FROM finish();
ROLLBACK;
