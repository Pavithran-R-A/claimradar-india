CREATE OR REPLACE FUNCTION public.publish_claimable_with_audit(
  p_claimable_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claimable public.claimables%ROWTYPE;
  v_review public.legal_reviews%ROWTYPE;
BEGIN
  SELECT * INTO v_claimable
  FROM public.claimables
  WHERE id = p_claimable_id
  FOR UPDATE;

  IF NOT FOUND OR v_claimable.publication_status <> 'draft'
     OR v_claimable.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN jsonb_build_object('success', false, 'reason', 'conflict');
  END IF;

  IF v_claimable.status::text NOT IN ('official_update', 'potential_claimable', 'verified_claimable')
     OR v_claimable.public_title IS NULL OR btrim(v_claimable.public_title) = ''
     OR v_claimable.official_claim_url IS NULL OR btrim(v_claimable.official_claim_url) = ''
     OR v_claimable.action_required IS NULL OR btrim(v_claimable.action_required) = ''
     OR NOT EXISTS (
       SELECT 1 FROM public.claim_sources
       WHERE claimable_id = p_claimable_id AND is_primary = true
     ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'validation');
  END IF;

  SELECT * INTO v_review
  FROM public.legal_reviews
  WHERE claimable_id = p_claimable_id
  ORDER BY reviewed_at DESC
  LIMIT 1;
  IF NOT FOUND OR v_review.decision <> 'clear_to_publish'
     OR v_review.reviewed_at < v_claimable.updated_at THEN
    RETURN jsonb_build_object('success', false, 'reason', 'legal_review');
  END IF;

  UPDATE public.claimables
  SET publication_status = 'published',
      first_published_at = COALESCE(first_published_at, now()),
      last_verified_at = now(),
      updated_at = now()
  WHERE id = p_claimable_id;

  INSERT INTO public.publication_events (
    claimable_id, action, previous_status, new_status,
    actor_type, actor_id, reason
  ) VALUES (
    p_claimable_id, 'publication_approved', v_claimable.status, v_claimable.status,
    'staff_user', p_actor_id, 'Explicit editorial publication approval'
  );

  INSERT INTO public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, changes
  ) VALUES (
    p_actor_id, 'staff_user', 'claimable.published', 'claimable', p_claimable_id,
    jsonb_build_object(
      'before', jsonb_build_object('publication_status', v_claimable.publication_status),
      'after', jsonb_build_object('publication_status', 'published')
    )
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.archive_claimable_with_audit(
  p_claimable_id uuid,
  p_expected_updated_at timestamptz,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claimable public.claimables%ROWTYPE;
BEGIN
  SELECT * INTO v_claimable
  FROM public.claimables
  WHERE id = p_claimable_id
  FOR UPDATE;

  IF NOT FOUND OR v_claimable.publication_status = 'archived'
     OR v_claimable.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN jsonb_build_object('success', false, 'reason', 'conflict');
  END IF;

  UPDATE public.claimables
  SET publication_status = 'archived', updated_at = now()
  WHERE id = p_claimable_id;

  INSERT INTO public.publication_events (
    claimable_id, action, previous_status, new_status,
    actor_type, actor_id, reason
  ) VALUES (
    p_claimable_id, 'publication_archived', v_claimable.status, v_claimable.status,
    'staff_user', p_actor_id, 'Archived by editorial staff'
  );

  INSERT INTO public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, changes
  ) VALUES (
    p_actor_id, 'staff_user', 'claimable.archived', 'claimable', p_claimable_id,
    jsonb_build_object(
      'before', jsonb_build_object('publication_status', v_claimable.publication_status),
      'after', jsonb_build_object('publication_status', 'archived')
    )
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.publish_claimable_with_audit(uuid, timestamptz, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_claimable_with_audit(uuid, timestamptz, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.publish_claimable_with_audit(uuid, timestamptz, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.publish_claimable_with_audit(uuid, timestamptz, uuid) TO service_role;

REVOKE ALL ON FUNCTION public.archive_claimable_with_audit(uuid, timestamptz, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.archive_claimable_with_audit(uuid, timestamptz, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.archive_claimable_with_audit(uuid, timestamptz, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.archive_claimable_with_audit(uuid, timestamptz, uuid) TO service_role;
