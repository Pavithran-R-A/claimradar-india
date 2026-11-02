-- Keep candidate decisions, publication events, and audit entries atomic.
CREATE OR REPLACE FUNCTION public.approve_candidate_with_event(
  p_candidate_id uuid,
  p_actor_id uuid,
  p_expected_updated_at timestamptz
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_candidate public.candidate_documents%ROWTYPE;
BEGIN
  SELECT * INTO v_candidate FROM public.candidate_documents
  WHERE id = p_candidate_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Candidate not found'); END IF;
  IF v_candidate.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Candidate changed during review; reload and verify its evidence.');
  END IF;
  IF v_candidate.publication_decision NOT IN ('pending', 'human_review') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Candidate state changed; reload before approving.');
  END IF;

  UPDATE public.candidate_documents SET publication_decision = 'approved'
  WHERE id = p_candidate_id;
  INSERT INTO public.publication_events(candidate_document_id, action, actor_type, actor_id, reason)
  VALUES (p_candidate_id, 'candidate_approved', 'staff_user', p_actor_id,
    'Approved by editorial staff for promotion to draft claimable');
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'candidate.approved', 'candidate_document', p_candidate_id,
    jsonb_build_object('before', jsonb_build_object('publication_decision', v_candidate.publication_decision),
      'after', jsonb_build_object('publication_decision', 'approved')));
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_candidate_with_event(
  p_candidate_id uuid,
  p_actor_id uuid,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_candidate public.candidate_documents%ROWTYPE;
BEGIN
  SELECT * INTO v_candidate FROM public.candidate_documents
  WHERE id = p_candidate_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Candidate not found'); END IF;
  IF v_candidate.publication_decision NOT IN ('pending', 'human_review') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Candidate state changed; reload before rejecting.');
  END IF;
  IF nullif(btrim(p_reason), '') IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'A rejection reason is required.');
  END IF;

  UPDATE public.candidate_documents SET publication_decision = 'rejected'
  WHERE id = p_candidate_id;
  INSERT INTO public.publication_events(candidate_document_id, action, actor_type, actor_id, reason)
  VALUES (p_candidate_id, 'candidate_rejected', 'staff_user', p_actor_id, p_reason);
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'candidate.rejected', 'candidate_document', p_candidate_id,
    jsonb_build_object('reason', p_reason,
      'before', jsonb_build_object('publication_decision', v_candidate.publication_decision),
      'after', jsonb_build_object('publication_decision', 'rejected')));
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_candidate_with_source(
  p_candidate_id uuid,
  p_actor_id uuid,
  p_slug text,
  p_public_title text,
  p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_candidate public.candidate_documents%ROWTYPE;
  v_existing uuid;
  v_claimable public.claimables%ROWTYPE;
  v_title text;
BEGIN
  SELECT * INTO v_candidate FROM public.candidate_documents
  WHERE id = p_candidate_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Candidate not found'); END IF;
  IF v_candidate.publication_decision <> 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only approved candidates can be promoted to claimables.');
  END IF;

  SELECT claimable_id INTO v_existing FROM public.publication_events
  WHERE candidate_document_id = p_candidate_id AND action = 'candidate_promoted'
  ORDER BY created_at LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'claimable_id', v_existing, 'already_promoted', true);
  END IF;

  SELECT coalesce(nullif(btrim(p_public_title), ''), sd.title,
    'Claimable candidate ' || left(p_candidate_id::text, 8)) INTO v_title
  FROM public.source_documents sd WHERE sd.id = v_candidate.source_document_id;
  v_title := coalesce(v_title, nullif(btrim(p_public_title), ''),
    'Claimable candidate ' || left(p_candidate_id::text, 8));

  INSERT INTO public.claimables(
    slug, public_title, legal_case_title, case_number, summary, status, procedural_status,
    authority, affected_group, geographic_scope, relief_type, relief_description,
    official_amount, amount_currency, proof_requirements, action_required, official_claim_url,
    deadline, claimability_score, confidence, publication_status, updated_at
  ) VALUES (
    p_slug, v_title, p_payload->>'legal_case_title', p_payload->>'case_number',
    coalesce(nullif(p_payload->>'summary', ''), v_title),
    coalesce(p_payload->>'status', 'detected')::public.claimable_status,
    coalesce(p_payload->>'procedural_status', 'pending')::public.procedural_status,
    p_payload->>'authority', p_payload->>'affected_group', p_payload->>'geographic_scope',
    p_payload->>'relief_type', p_payload->>'relief_description',
    nullif(p_payload->>'official_amount', '')::numeric,
    coalesce(nullif(p_payload->>'amount_currency', ''), 'INR'),
    coalesce(p_payload->'proof_requirements', '[]'::jsonb), p_payload->>'action_required',
    p_payload->>'official_claim_url', nullif(p_payload->>'deadline', '')::timestamptz,
    0, coalesce(nullif(p_payload->>'confidence', '')::integer, 0), 'draft', now()
  ) RETURNING * INTO v_claimable;

  INSERT INTO public.claim_sources(claimable_id, source_document_id, source_role, is_primary)
  VALUES (v_claimable.id, v_candidate.source_document_id, 'primary', true);
  INSERT INTO public.publication_events(
    claimable_id, candidate_document_id, action, new_status, actor_type, actor_id, reason
  ) VALUES (v_claimable.id, p_candidate_id, 'candidate_promoted', 'detected', 'staff_user', p_actor_id,
    'Candidate promoted to draft claimable: human review required (AUTO_VERIFY_CLAIMABLES=false)');
  INSERT INTO public.audit_logs(actor_id, actor_type, action, entity_type, entity_id, changes)
  VALUES (p_actor_id, 'staff_user', 'candidate.promoted', 'claimable', v_claimable.id,
    jsonb_build_object('before', jsonb_build_object('candidate_document_id', p_candidate_id,
      'publication_decision', 'approved'),
      'after', jsonb_build_object('slug', v_claimable.slug, 'status', v_claimable.status,
        'publication_status', v_claimable.publication_status)));
  RETURN jsonb_build_object('success', true, 'claimable_id', v_claimable.id, 'already_promoted', false);
END;
$$;

REVOKE ALL ON FUNCTION public.approve_candidate_with_event(uuid, uuid, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_candidate_with_event(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.promote_candidate_with_source(uuid, uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_candidate_with_event(uuid, uuid, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_candidate_with_event(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_candidate_with_source(uuid, uuid, text, text, jsonb) TO service_role;
