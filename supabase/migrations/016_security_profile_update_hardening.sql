-- Migration 016: Harden profile updates and SECURITY DEFINER helpers
-- Authenticated users may edit display_name only. Billing, verification,
-- onboarding, and role state remain server-controlled.

-- =============================================================================
-- 1. Restrict authenticated profile updates to display_name
-- =============================================================================

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE UPDATE (subscription_tier, email_verified_at, onboarding_completed)
  ON TABLE public.profiles
  FROM authenticated;
GRANT UPDATE (display_name) ON TABLE public.profiles TO authenticated;

-- =============================================================================
-- 2. Restore strict SECURITY DEFINER search paths
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Trigger on auth.users creating matching profile row on signup.';

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role = 'admin';
END;
$$;

COMMENT ON FUNCTION private.is_admin() IS
  'Helper checking if auth.uid() has the admin staff role.';

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role IN ('admin', 'editor', 'legal_reviewer', 'researcher');
END;
$$;

COMMENT ON FUNCTION private.is_staff() IS
  'Helper checking if auth.uid() has any recognized staff role.';

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF pg_catalog.current_setting('request.jwt.claim.role', true) = 'service_role'
       OR current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
      RETURN NEW;
    END IF;

    IF NOT private.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can change profile roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_role_escalation() IS
  'Trigger preventing non-admin users from escalating their profile role.';

-- =============================================================================
-- 3. Restore least-privilege EXECUTE grants
-- =============================================================================

-- Trigger-only helpers need no API EXECUTE privilege.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated, service_role, postgres;
REVOKE EXECUTE ON FUNCTION public.prevent_role_escalation()
  FROM PUBLIC, anon, authenticated, service_role, postgres;

-- RLS helpers require authenticated and service_role callers only.
REVOKE EXECUTE ON FUNCTION private.is_admin()
  FROM PUBLIC, anon, postgres;
REVOKE EXECUTE ON FUNCTION private.is_staff()
  FROM PUBLIC, anon, postgres;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff() TO authenticated, service_role;
