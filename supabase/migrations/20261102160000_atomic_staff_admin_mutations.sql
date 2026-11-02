CREATE OR REPLACE FUNCTION public.toggle_source_with_audit(p_actor_id uuid, p_source_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_source public.sources%ROWTYPE;
BEGIN
  SELECT * INTO v_source FROM public.sources WHERE id = p_source_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Source not found'); END IF;
  UPDATE public.sources SET enabled = NOT v_source.enabled WHERE id = p_source_id;
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', CASE WHEN v_source.enabled THEN 'source.disabled' ELSE 'source.enabled' END,
    'source', p_source_id, jsonb_build_object('before', jsonb_build_object('enabled', v_source.enabled),
    'after', jsonb_build_object('enabled', NOT v_source.enabled), 'details', jsonb_build_object('name', v_source.name)));
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.submit_legal_review_with_audit(p_actor_id uuid, p_claimable_id uuid, p_decision text, p_findings text, p_expected_updated_at timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_claimable public.claimables%ROWTYPE;
BEGIN
  SELECT * INTO v_claimable FROM public.claimables WHERE id = p_claimable_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Claimable not found'); END IF;
  IF v_claimable.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN jsonb_build_object('error', 'This draft changed during legal review. Reopen it and review the latest version.');
  END IF;
  INSERT INTO public.legal_reviews(claimable_id, reviewer_id, decision, findings)
  VALUES (p_claimable_id, p_actor_id, p_decision, p_findings);
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'legal_review.submitted', 'claimable', p_claimable_id,
    jsonb_build_object('after', jsonb_build_object('decision', p_decision), 'details', jsonb_build_object('title', v_claimable.public_title)));
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.assign_review_with_audit(p_actor_id uuid, p_claimable_id uuid, p_assigned_to uuid, p_notes text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.claimables WHERE id = p_claimable_id) THEN RETURN jsonb_build_object('error', 'Claimable not found'); END IF;
  INSERT INTO public.review_assignments(claimable_id, assigned_to, status, notes)
  VALUES (p_claimable_id, p_assigned_to, 'pending', p_notes);
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'review.assigned', 'claimable', p_claimable_id,
    jsonb_build_object('after', jsonb_build_object('assigned_to', p_assigned_to, 'status', 'pending')));
  RETURN jsonb_build_object('success', true);
END; $$;

CREATE OR REPLACE FUNCTION public.complete_review_assignment_with_audit(p_actor_id uuid, p_assignment_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_assignment public.review_assignments%ROWTYPE;
BEGIN
  SELECT * INTO v_assignment FROM public.review_assignments WHERE id = p_assignment_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Assignment not found'); END IF;
  IF v_assignment.status = 'completed' THEN RETURN jsonb_build_object('error', 'Assignment already completed.'); END IF;
  UPDATE public.review_assignments SET status = 'completed', completed_at = now() WHERE id = p_assignment_id;
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'review.completed', 'review_assignment', p_assignment_id,
    jsonb_build_object('before', jsonb_build_object('status', v_assignment.status), 'after', jsonb_build_object('status', 'completed'),
      'details', jsonb_build_object('claimable_id', v_assignment.claimable_id)));
  RETURN jsonb_build_object('success', true, 'claimable_id', v_assignment.claimable_id);
END; $$;

CREATE OR REPLACE FUNCTION public.update_user_role_with_audit(p_actor_id uuid, p_user_id uuid, p_role text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_target public.profiles%ROWTYPE; v_admin_count bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(918273645);
  SELECT * INTO v_target FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'User not found'); END IF;
  IF v_target.role = p_role THEN RETURN jsonb_build_object('error', 'User already has this role.'); END IF;
  IF v_target.role = 'admin' AND p_role <> 'admin' THEN
    SELECT count(*) INTO v_admin_count FROM public.profiles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN RETURN jsonb_build_object('error', 'Cannot demote the last remaining admin: promote another admin first.'); END IF;
  END IF;
  UPDATE public.profiles SET role = p_role, updated_at = now() WHERE id = p_user_id;
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'profile.role_changed', 'profile', p_user_id,
    jsonb_build_object('before', jsonb_build_object('role', v_target.role), 'after', jsonb_build_object('role', p_role),
      'details', jsonb_build_object('email', v_target.email)));
  RETURN jsonb_build_object('success', true);
END; $$;

REVOKE ALL ON FUNCTION public.toggle_source_with_audit(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_source_with_audit(uuid, uuid) TO service_role;
REVOKE ALL ON FUNCTION public.submit_legal_review_with_audit(uuid, uuid, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_legal_review_with_audit(uuid, uuid, text, text, timestamptz) TO service_role;
REVOKE ALL ON FUNCTION public.assign_review_with_audit(uuid, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_review_with_audit(uuid, uuid, uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.complete_review_assignment_with_audit(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_review_assignment_with_audit(uuid, uuid) TO service_role;
REVOKE ALL ON FUNCTION public.update_user_role_with_audit(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role_with_audit(uuid, uuid, text) TO service_role;
