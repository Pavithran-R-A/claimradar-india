-- pgTAP Test 011: Profile Update and Helper Hardening
BEGIN;
SELECT plan(23);

-- Authenticated users may update only display_name on profiles.
SELECT results_eq(
  $$SELECT has_table_privilege('authenticated', 'public.profiles', 'UPDATE')$$,
  ARRAY[false],
  'authenticated has no table-wide UPDATE privilege on profiles'
);

SELECT results_eq(
  $$SELECT has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE')$$,
  ARRAY[true],
  'authenticated may update display_name'
);

SELECT results_eq(
  $$SELECT has_column_privilege('authenticated', 'public.profiles', 'subscription_tier', 'UPDATE')$$,
  ARRAY[false],
  'authenticated may not update subscription_tier'
);

SELECT results_eq(
  $$SELECT has_column_privilege('authenticated', 'public.profiles', 'email_verified_at', 'UPDATE')$$,
  ARRAY[false],
  'authenticated may not update email_verified_at'
);

SELECT results_eq(
  $$SELECT has_column_privilege('authenticated', 'public.profiles', 'onboarding_completed', 'UPDATE')$$,
  ARRAY[false],
  'authenticated may not update onboarding_completed'
);

-- The existing role-protection trigger remains installed and hardened.
SELECT has_trigger(
  'public',
  'profiles',
  'trg_prevent_role_escalation',
  'role escalation trigger remains installed'
);
SELECT is_definer(
  'public',
  'prevent_role_escalation',
  'role escalation helper remains SECURITY DEFINER'
);

-- SECURITY DEFINER helpers use an empty search_path.
SELECT results_eq(
  $$SELECT p.proconfig @> ARRAY['search_path=']::text[]
      FROM pg_proc AS p
      JOIN pg_namespace AS n ON n.oid = p.pronamespace
     WHERE n.nspname = 'private' AND p.proname = 'is_admin' AND p.pronargs = 0$$,
  ARRAY[true],
  'private.is_admin has an empty search_path'
);

SELECT results_eq(
  $$SELECT p.proconfig @> ARRAY['search_path=']::text[]
      FROM pg_proc AS p
      JOIN pg_namespace AS n ON n.oid = p.pronamespace
     WHERE n.nspname = 'private' AND p.proname = 'is_staff' AND p.pronargs = 0$$,
  ARRAY[true],
  'private.is_staff has an empty search_path'
);

SELECT results_eq(
  $$SELECT p.proconfig @> ARRAY['search_path=']::text[]
      FROM pg_proc AS p
      JOIN pg_namespace AS n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = 'handle_new_user' AND p.pronargs = 0$$,
  ARRAY[true],
  'handle_new_user has an empty search_path'
);

SELECT results_eq(
  $$SELECT p.proconfig @> ARRAY['search_path=']::text[]
      FROM pg_proc AS p
      JOIN pg_namespace AS n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = 'prevent_role_escalation' AND p.pronargs = 0$$,
  ARRAY[true],
  'prevent_role_escalation has an empty search_path'
);

-- RLS helpers are callable only by required application roles.
SELECT results_eq(
  $$SELECT has_function_privilege('authenticated', 'private.is_admin()', 'EXECUTE')$$,
  ARRAY[true],
  'authenticated may execute private.is_admin'
);
SELECT results_eq(
  $$SELECT has_function_privilege('anon', 'private.is_admin()', 'EXECUTE')$$,
  ARRAY[false],
  'anon may not execute private.is_admin'
);
SELECT results_eq(
  $$SELECT has_function_privilege('service_role', 'private.is_admin()', 'EXECUTE')$$,
  ARRAY[true],
  'service_role may execute private.is_admin'
);
SELECT results_eq(
  $$SELECT has_function_privilege('authenticated', 'private.is_staff()', 'EXECUTE')$$,
  ARRAY[true],
  'authenticated may execute private.is_staff'
);
SELECT results_eq(
  $$SELECT has_function_privilege('anon', 'private.is_staff()', 'EXECUTE')$$,
  ARRAY[false],
  'anon may not execute private.is_staff'
);
SELECT results_eq(
  $$SELECT has_function_privilege('service_role', 'private.is_staff()', 'EXECUTE')$$,
  ARRAY[true],
  'service_role may execute private.is_staff'
);

-- Trigger-only helpers are not directly executable by API roles.
SELECT results_eq(
  $$SELECT has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')$$,
  ARRAY[false],
  'authenticated may not execute handle_new_user directly'
);
SELECT results_eq(
  $$SELECT has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')$$,
  ARRAY[false],
  'anon may not execute handle_new_user directly'
);
SELECT results_eq(
  $$SELECT has_function_privilege('service_role', 'public.handle_new_user()', 'EXECUTE')$$,
  ARRAY[false],
  'service_role may not execute handle_new_user directly'
);
SELECT results_eq(
  $$SELECT has_function_privilege('authenticated', 'public.prevent_role_escalation()', 'EXECUTE')$$,
  ARRAY[false],
  'authenticated may not execute prevent_role_escalation directly'
);
SELECT results_eq(
  $$SELECT has_function_privilege('anon', 'public.prevent_role_escalation()', 'EXECUTE')$$,
  ARRAY[false],
  'anon may not execute prevent_role_escalation directly'
);
SELECT results_eq(
  $$SELECT has_function_privilege('service_role', 'public.prevent_role_escalation()', 'EXECUTE')$$,
  ARRAY[false],
  'service_role may not execute prevent_role_escalation directly'
);

SELECT * FROM finish();
ROLLBACK;
