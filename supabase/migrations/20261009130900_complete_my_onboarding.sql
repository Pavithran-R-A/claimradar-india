-- Repair customer onboarding finalization without requiring a privileged web API key.
-- Only a confirmed, authenticated user who has already saved onboarding answers
-- can mark their own profile as complete. Never updates role or another profile.
CREATE OR REPLACE FUNCTION public.complete_my_onboarding()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_id uuid := (SELECT auth.uid());
  verified_at timestamptz;
BEGIN
  IF actor_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT u.email_confirmed_at INTO verified_at
  FROM auth.users AS u
  WHERE u.id = actor_id;

  IF verified_at IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_onboarding_responses AS r
    WHERE r.user_id = actor_id
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.profiles AS p
  SET onboarding_completed = true,
      email_verified_at = COALESCE(p.email_verified_at, verified_at),
      updated_at = NOW()
  WHERE p.id = actor_id;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_my_onboarding() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_my_onboarding() FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_my_onboarding() TO authenticated;

COMMENT ON FUNCTION public.complete_my_onboarding() IS
  'Self-service onboarding completion; checks JWT owner, confirmed email and existing onboarding answers; never changes role.';
