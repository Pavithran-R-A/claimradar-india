-- Keep staff request state, publication events and audit history consistent.
-- Both functions are reachable only through the server-side service-role client.

ALTER TABLE public.publication_events
  ADD COLUMN takedown_request_id uuid
  REFERENCES public.takedown_requests(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX publication_events_takedown_request_once
  ON public.publication_events(takedown_request_id)
  WHERE action = 'takedown_granted' AND takedown_request_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.resolve_takedown_request(
  p_takedown_id uuid,
  p_decision text,
  p_resolution text,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request public.takedown_requests%ROWTYPE;
  v_claimable public.claimables%ROWTYPE;
  v_event_id uuid;
  v_already_resolved boolean;
BEGIN
  IF p_decision IS NULL
    OR p_decision NOT IN ('granted', 'rejected')
    OR p_resolution IS NULL
    OR length(btrim(p_resolution)) < 3
    OR length(p_resolution) > 2000
    OR p_actor_id IS NULL THEN
    RAISE EXCEPTION 'Invalid takedown resolution';
  END IF;

  SELECT * INTO v_request
  FROM public.takedown_requests
  WHERE id = p_takedown_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Takedown request not found.');
  END IF;

  v_already_resolved := v_request.status = p_decision;
  IF NOT v_already_resolved AND v_request.status NOT IN ('new', 'in_review') THEN
    RETURN jsonb_build_object('success', false, 'error', 'This request was resolved elsewhere.');
  END IF;

  IF p_decision = 'granted' THEN
    SELECT * INTO v_claimable
    FROM public.claimables
    WHERE id = v_request.claimable_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'The claimable could not be loaded.');
    END IF;

    IF v_claimable.publication_status <> 'archived' THEN
      UPDATE public.claimables
      SET publication_status = 'archived', updated_at = now()
      WHERE id = v_claimable.id;
    END IF;

    SELECT id INTO v_event_id
    FROM public.publication_events
    WHERE takedown_request_id = p_takedown_id
      AND action = 'takedown_granted'
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO public.publication_events (
        takedown_request_id,
        claimable_id,
        action,
        previous_status,
        new_status,
        actor_type,
        actor_id,
        reason
      ) VALUES (
        p_takedown_id,
        v_claimable.id,
        'takedown_granted',
        v_claimable.status,
        v_claimable.status,
        'staff_user',
        p_actor_id,
        btrim(p_resolution)
      );
    END IF;
  END IF;

  IF v_request.resolution IS DISTINCT FROM btrim(p_resolution)
    OR v_request.status IS DISTINCT FROM p_decision THEN
    UPDATE public.takedown_requests
    SET status = p_decision,
        resolution = btrim(p_resolution),
        updated_at = now()
    WHERE id = p_takedown_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE action = 'takedown.' || p_decision
      AND entity_type = 'takedown_request'
      AND entity_id = p_takedown_id
      AND changes->'after'->>'status' = p_decision
      AND changes->'after'->>'resolution' = btrim(p_resolution)
  ) THEN
    INSERT INTO public.audit_logs (
      actor_id, actor_type, action, entity_type, entity_id, changes
    ) VALUES (
      p_actor_id,
      'staff_user',
      'takedown.' || p_decision,
      'takedown_request',
      p_takedown_id,
      jsonb_build_object(
        'before', jsonb_build_object(
          'status', v_request.status,
          'resolution', v_request.resolution
        ),
        'after', jsonb_build_object(
          'status', p_decision,
          'resolution', btrim(p_resolution)
        ),
        'details', jsonb_build_object('claimable_id', v_request.claimable_id)
      )
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'alreadyResolved', v_already_resolved);
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_takedown_request(uuid, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_takedown_request(uuid, text, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_takedown_request(uuid, text, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_takedown_request(uuid, text, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.triage_customer_request(
  p_request_kind text,
  p_request_id uuid,
  p_status text,
  p_resolution text,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_previous_status text;
  v_previous_resolution text;
  v_table_name text;
  v_action text;
  v_already_saved boolean;
BEGIN
  IF p_request_id IS NULL
    OR p_status IS NULL
    OR p_resolution IS NULL
    OR length(btrim(p_resolution)) < 3
    OR length(p_resolution) > 2000
    OR p_actor_id IS NULL THEN
    RAISE EXCEPTION 'Invalid customer request resolution';
  END IF;

  IF p_request_kind = 'correction' THEN
    IF p_status IS NULL OR p_status NOT IN ('new', 'in_review', 'resolved', 'declined') THEN
      RAISE EXCEPTION 'Invalid correction request status';
    END IF;
    v_table_name := 'user_correction_requests';
    v_action := 'customer_request.correction.triaged';

    SELECT status, resolution INTO v_previous_status, v_previous_resolution
    FROM public.user_correction_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'The request could not be loaded.');
    END IF;

    v_already_saved := v_previous_status = p_status
      AND v_previous_resolution IS NOT DISTINCT FROM btrim(p_resolution);

    IF NOT v_already_saved THEN
      UPDATE public.user_correction_requests
      SET status = p_status, resolution = btrim(p_resolution), updated_at = now()
      WHERE id = p_request_id;
    END IF;
  ELSIF p_request_kind = 'grievance' THEN
    IF p_status IS NULL OR p_status NOT IN ('new', 'acknowledged', 'resolved') THEN
      RAISE EXCEPTION 'Invalid grievance request status';
    END IF;
    v_table_name := 'grievance_contacts';
    v_action := 'customer_request.grievance.triaged';

    SELECT status, resolution INTO v_previous_status, v_previous_resolution
    FROM public.grievance_contacts
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'The request could not be loaded.');
    END IF;

    v_already_saved := v_previous_status = p_status
      AND v_previous_resolution IS NOT DISTINCT FROM btrim(p_resolution);

    IF NOT v_already_saved THEN
      UPDATE public.grievance_contacts
      SET status = p_status, resolution = btrim(p_resolution), updated_at = now()
      WHERE id = p_request_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid customer request kind';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE action = v_action
      AND entity_type = v_table_name
      AND entity_id = p_request_id
      AND changes->'after'->>'status' = p_status
      AND changes->'after'->>'resolution' = btrim(p_resolution)
  ) THEN
    INSERT INTO public.audit_logs (
      actor_id, actor_type, action, entity_type, entity_id, changes
    ) VALUES (
      p_actor_id,
      'staff_user',
      v_action,
      v_table_name,
      p_request_id,
      jsonb_build_object(
        'before', jsonb_build_object(
          'status', v_previous_status,
          'resolution', v_previous_resolution
        ),
        'after', jsonb_build_object(
          'status', p_status,
          'resolution', btrim(p_resolution)
        )
      )
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'alreadySaved', v_already_saved);
END;
$$;

REVOKE ALL ON FUNCTION public.triage_customer_request(text, uuid, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.triage_customer_request(text, uuid, text, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.triage_customer_request(text, uuid, text, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.triage_customer_request(text, uuid, text, text, uuid) TO service_role;

COMMENT ON FUNCTION public.resolve_takedown_request(uuid, text, text, uuid) IS
  'Atomically archives granted takedowns, records publication events, updates requests and writes audit history.';
COMMENT ON FUNCTION public.triage_customer_request(text, uuid, text, text, uuid) IS
  'Atomically updates correction or grievance requests and writes audit history.';

CREATE OR REPLACE FUNCTION public.update_claimable_with_revision(
  p_claimable_id uuid,
  p_updates jsonb,
  p_change_reason text,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current public.claimables%ROWTYPE;
  v_updated public.claimables%ROWTYPE;
  v_version integer;
BEGIN
  IF p_claimable_id IS NULL
    OR p_actor_id IS NULL
    OR p_updates IS NULL
    OR jsonb_typeof(p_updates) <> 'object'
    OR p_change_reason IS NULL
    OR length(btrim(p_change_reason)) < 3
    OR length(p_change_reason) > 500 THEN
    RAISE EXCEPTION 'Invalid claimable edit';
  END IF;

  IF NOT (p_updates ?& ARRAY[
    'public_title', 'summary', 'status', 'procedural_status', 'affected_group',
    'relief_description', 'action_required', 'official_claim_url', 'deadline'
  ]) THEN
    RAISE EXCEPTION 'Incomplete claimable edit';
  END IF;

  SELECT * INTO v_current
  FROM public.claimables
  WHERE id = p_claimable_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claimable not found.');
  END IF;

  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version
  FROM public.claim_versions
  WHERE claimable_id = p_claimable_id;

  INSERT INTO public.claim_versions (
    claimable_id, version_number, snapshot, change_reason, actor_type, actor_id
  ) VALUES (
    p_claimable_id, v_version, to_jsonb(v_current), btrim(p_change_reason), 'staff_user', p_actor_id
  );

  UPDATE public.claimables
  SET public_title = p_updates->>'public_title',
      summary = p_updates->>'summary',
      status = (p_updates->>'status')::public.claimable_status,
      procedural_status = (p_updates->>'procedural_status')::public.procedural_status,
      affected_group = p_updates->>'affected_group',
      relief_description = p_updates->>'relief_description',
      action_required = p_updates->>'action_required',
      official_claim_url = p_updates->>'official_claim_url',
      deadline = NULLIF(p_updates->>'deadline', '')::timestamptz,
      updated_at = now()
  WHERE id = p_claimable_id
  RETURNING * INTO v_updated;

  INSERT INTO public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, changes
  ) VALUES (
    p_actor_id,
    'staff_user',
    'claimable.updated',
    'claimable',
    p_claimable_id,
    jsonb_build_object(
      'before', jsonb_build_object(
        'public_title', v_current.public_title,
        'status', v_current.status,
        'procedural_status', v_current.procedural_status
      ),
      'after', jsonb_build_object(
        'public_title', v_updated.public_title,
        'status', v_updated.status,
        'procedural_status', v_updated.procedural_status
      ),
      'details', jsonb_build_object('change_reason', btrim(p_change_reason), 'version', v_version)
    )
  );

  RETURN jsonb_build_object('success', true, 'version', v_version);
END;
$$;

REVOKE ALL ON FUNCTION public.update_claimable_with_revision(uuid, jsonb, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_claimable_with_revision(uuid, jsonb, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.update_claimable_with_revision(uuid, jsonb, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_claimable_with_revision(uuid, jsonb, text, uuid) TO service_role;

COMMENT ON FUNCTION public.update_claimable_with_revision(uuid, jsonb, text, uuid) IS
  'Atomically snapshots, edits and audits one claimable record.';

CREATE OR REPLACE FUNCTION public.resolve_correction_request(
  p_correction_id uuid,
  p_decision text,
  p_resolution text,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request public.correction_requests%ROWTYPE;
  v_status text;
BEGIN
  IF p_correction_id IS NULL
    OR p_actor_id IS NULL
    OR p_decision IS NULL
    OR p_decision NOT IN ('accepted', 'rejected')
    OR p_resolution IS NULL
    OR length(btrim(p_resolution)) < 3
    OR length(p_resolution) > 2000 THEN
    RAISE EXCEPTION 'Invalid correction decision';
  END IF;

  SELECT * INTO v_request
  FROM public.correction_requests
  WHERE id = p_correction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Correction request not found.');
  END IF;
  IF v_request.status NOT IN ('new', 'in_review') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Correction request was resolved elsewhere.');
  END IF;

  v_status := CASE WHEN p_decision = 'accepted' THEN 'resolved' ELSE 'rejected' END;
  UPDATE public.correction_requests
  SET status = v_status, resolution = btrim(p_resolution), updated_at = now()
  WHERE id = p_correction_id;

  INSERT INTO public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, changes
  ) VALUES (
    p_actor_id,
    'staff_user',
    'correction.' || p_decision,
    'correction_request',
    p_correction_id,
    jsonb_build_object(
      'before', jsonb_build_object('status', v_request.status, 'resolution', v_request.resolution),
      'after', jsonb_build_object('status', v_status, 'resolution', btrim(p_resolution)),
      'details', jsonb_build_object(
        'claimable_id', v_request.claimable_id,
        'content_edited', false
      )
    )
  );

  RETURN jsonb_build_object('success', true, 'status', v_status, 'contentEdited', false);
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_correction_request(uuid, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_correction_request(uuid, text, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_correction_request(uuid, text, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_correction_request(uuid, text, text, uuid) TO service_role;

COMMENT ON FUNCTION public.resolve_correction_request(uuid, text, text, uuid) IS
  'Atomically records a correction-request decision and audit; claimable edits remain separate.';
