'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/lib/admin-db';
import { isPubliclyPublishable } from '@/lib/claimables-repository';
import { isKnownNonFilingInformationUrl } from '@/lib/official-filing-route';
import {
  isLegalClearanceCurrent,
  isPublicationDeadlineExpired,
} from '@/lib/editorial-publication-safety';
import { CLAIMABLE_STATUSES } from './_lib/constants';
import { getActionActor, unauthorized, ADMINS_ONLY, EDITORIAL, LEGAL } from './_lib/roles';

/**
 * Editorial server actions: claimable editing, publication approval, legal
 * reviews, review assignments, corrections, takedowns and role management.
 * Every privileged state change writes audit_logs.
 */

const uuidSchema = z.string().uuid();

function fdString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

/* ===========================================================================
 * Claimable editing (editor + admin)
 * =========================================================================== */

const claimableEditSchema = z.object({
  public_title: z.string().trim().min(3).max(300),
  summary: z.string().trim().max(5000).optional().or(z.literal('')),
  status: z.enum(CLAIMABLE_STATUSES),
  procedural_status: z.enum(['final', 'interim', 'proposed', 'appealed', 'pending', 'closed']),
  affected_group: z.string().trim().max(1000).optional().or(z.literal('')),
  relief_description: z.string().trim().max(5000).optional().or(z.literal('')),
  action_required: z.string().trim().max(2000).optional().or(z.literal('')),
  official_claim_url: z.string().trim().url().optional().or(z.literal('')),
  deadline: z.string().trim().optional().or(z.literal('')),
  change_reason: z.string().trim().min(3).max(500),
});

/**
 * Edit a claimable. Per the legal-content rule, every content change is
 * recorded as a claim_versions revision row (before-snapshot + reason) in
 * addition to the audit log entry.
 */
export async function updateClaimable(claimableId: string, formData: FormData) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const input = claimableEditSchema.safeParse({
    public_title: fdString(formData, 'public_title'),
    summary: fdString(formData, 'summary'),
    status: fdString(formData, 'status'),
    procedural_status: fdString(formData, 'procedural_status'),
    affected_group: fdString(formData, 'affected_group'),
    relief_description: fdString(formData, 'relief_description'),
    action_required: fdString(formData, 'action_required'),
    official_claim_url: fdString(formData, 'official_claim_url'),
    deadline: fdString(formData, 'deadline'),
    change_reason: fdString(formData, 'change_reason'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid edit payload' };
  }

  const updates = {
    public_title: input.data.public_title,
    summary: input.data.summary || null,
    status: input.data.status,
    procedural_status: input.data.procedural_status,
    affected_group: input.data.affected_group || null,
    relief_description: input.data.relief_description || null,
    action_required: input.data.action_required || null,
    official_claim_url: input.data.official_claim_url || null,
    deadline: input.data.deadline || null,
  };
  const db = getAdminDb();
  try {
    const { data, error } = await db.rpc('update_claimable_with_revision', {
      p_claimable_id: claimableId,
      p_updates: updates,
      p_change_reason: input.data.change_reason,
      p_actor_id: actor.id,
    });
    if (error) return { error: 'The edit was not saved. No changes were committed.' };
    const result = data as { success?: boolean; error?: string } | null;
    if (!result?.success) return { error: result?.error ?? 'The edit was not saved.' };
  } catch {
    return { error: 'The edit was not saved. No changes were committed.' };
  }

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  return { success: true };
}

/* ===========================================================================
 * Publication approval (editor + admin)
 * =========================================================================== */

/**
 * Explicit publication approval: the only path to `published`.
 * Records a publication event per the publication policy and stamps
 * first_published_at / last_verified_at.
 */
export async function approvePublication(claimableId: string) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const db = getAdminDb();
  const { data: claimable, error: fetchError } = await db
    .from('claimables')
    .select(
      'id, status, publication_status, first_published_at, public_title, official_claim_url, deadline, action_required, updated_at',
    )
    .eq('id', claimableId)
    .single();
  if (fetchError || !claimable) return { error: 'Claimable not found' };
  if (claimable.publication_status === 'published') {
    return { error: 'Claimable is already published.' };
  }
  if (claimable.publication_status !== 'draft') {
    return { error: 'Only draft claimables can be published.' };
  }
  // Without a public-safe status the update would succeed in the DB while
  // the public directory silently filters the just-published record out.
  if (!isPubliclyPublishable(claimable.status, 'published')) {
    return {
      error:
        'Choose an eligible public status (official_update, potential_claimable or verified_claimable) before approval.',
    };
  }
  if (!claimable.public_title || !claimable.official_claim_url || !claimable.action_required) {
    return { error: 'Publication requires a title, official claim URL, and user action.' };
  }
  try {
    const url = new URL(claimable.official_claim_url);
    if (url.protocol !== 'https:') {
      return { error: 'Official claim URL must use HTTPS.' };
    }
  } catch {
    return { error: 'Invalid official claim URL.' };
  }
  if (isKnownNonFilingInformationUrl(claimable.official_claim_url)) {
    return {
      error:
        'The supplied IBBI downloads URL is a general information page, not a claim-filing destination. Update the route and complete fresh legal review.',
    };
  }

  if (isPublicationDeadlineExpired(claimable.deadline)) {
    return { error: 'Cannot publish an opportunity with an expired or invalid deadline.' };
  }

  const { data: sourceLink, error: linkError } = await db
    .from('claim_sources')
    .select('source_document_id')
    .eq('claimable_id', claimableId)
    .eq('is_primary', true)
    .limit(1)
    .maybeSingle();
  if (linkError || !sourceLink) {
    return { error: 'Publication requires a linked primary official-source document.' };
  }

  const { data: latestLegalReview, error: legalError } = await db
    .from('legal_reviews')
    .select('decision, reviewed_at')
    .eq('claimable_id', claimableId)
    .order('reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    legalError ||
    !isLegalClearanceCurrent(
      latestLegalReview?.decision,
      latestLegalReview?.reviewed_at,
      claimable.updated_at,
    )
  ) {
    return {
      error: 'A new legal clearance after the last content edit is required before publication.',
    };
  }

  const { data: publicationResult, error } = await db.rpc('publish_claimable_with_audit', {
    p_claimable_id: claimableId,
    p_expected_updated_at: claimable.updated_at,
    p_actor_id: actor.id,
  });
  if (error) return { error: error.message };
  if (!publicationResult?.success) {
    return { error: 'This draft changed during approval. Reopen it and repeat legal review.' };
  }

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  return { success: true };
}

/**
 * Archive (unpublish) a claimable: e.g. after an upheld takedown or when a
 * claim closes. Also explicit and audited.
 */
export async function archiveClaimable(claimableId: string) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const db = getAdminDb();
  const { data: claimable, error: fetchError } = await db
    .from('claimables')
    .select('id, status, publication_status, updated_at')
    .eq('id', claimableId)
    .single();
  if (fetchError || !claimable) return { error: 'Claimable not found' };
  if (claimable.publication_status === 'archived') {
    return { error: 'Claimable is already archived.' };
  }

  const { data: archiveResult, error } = await db.rpc('archive_claimable_with_audit', {
    p_claimable_id: claimableId,
    p_expected_updated_at: claimable.updated_at,
    p_actor_id: actor.id,
  });
  if (error) return { error: error.message };
  if (!archiveResult?.success) return { error: 'This claimable changed during archiving. Reload and retry.' };

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  return { success: true };
}

/* ===========================================================================
 * Legal reviews (legal_reviewer + admin)
 * =========================================================================== */

const legalReviewSchema = z.object({
  decision: z.enum(['clear_to_publish', 'needs_changes', 'legal_risk', 'blocked']),
  findings: z.string().trim().min(3).max(5000),
  expected_updated_at: z.string().datetime({ offset: true }),
});

export async function submitLegalReview(claimableId: string, formData: FormData) {
  const actor = await getActionActor(LEGAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const input = legalReviewSchema.safeParse({
    decision: fdString(formData, 'decision'),
    findings: fdString(formData, 'findings'),
    expected_updated_at: fdString(formData, 'expected_updated_at'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid legal review payload' };
  }

  const db = getAdminDb();
  const { data, error } = await db.rpc('submit_legal_review_with_audit', {
    p_actor_id: actor.id,
    p_claimable_id: claimableId,
    p_decision: input.data.decision,
    p_findings: input.data.findings,
    p_expected_updated_at: input.data.expected_updated_at,
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  revalidatePath('/admin/reviews');
  return { success: true };
}

/* ===========================================================================
 * Review assignments (editor + admin)
 * =========================================================================== */

const assignReviewSchema = z.object({
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export async function assignReview(claimableId: string, formData: FormData) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const input = assignReviewSchema.safeParse({
    assigned_to: fdString(formData, 'assigned_to'),
    notes: fdString(formData, 'notes'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid assignment payload' };
  }

  const db = getAdminDb();
  const { data, error } = await db.rpc('assign_review_with_audit', {
    p_actor_id: actor.id,
    p_claimable_id: claimableId,
    p_assigned_to: input.data.assigned_to || null,
    p_notes: input.data.notes || null,
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };

  revalidatePath(`/admin/claimables/${claimableId}`);
  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function completeReviewAssignment(assignmentId: string) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(assignmentId);
  if (!parsedId.success) return { error: 'Invalid assignment id' };

  const db = getAdminDb();
  const { data, error } = await db.rpc('complete_review_assignment_with_audit', {
    p_actor_id: actor.id,
    p_assignment_id: assignmentId,
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };

  revalidatePath(`/admin/claimables/${data.claimable_id}`);
  revalidatePath('/admin/reviews');
  return { success: true };
}

/* ===========================================================================
 * Correction decisions record the request and audit atomically.
 * Claimable content edits use the separate editor action.
 * =========================================================================== */

const correctionResolutionSchema = z.object({
  decision: z.enum(['accepted', 'rejected']),
  resolution: z.string().trim().min(3).max(2000),
});

export async function resolveCorrection(correctionId: string, formData: FormData) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(correctionId);
  if (!parsedId.success) return { error: 'Invalid correction id' };

  const input = correctionResolutionSchema.safeParse({
    decision: fdString(formData, 'decision'),
    resolution: fdString(formData, 'resolution'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid resolution payload' };
  }

  const db = getAdminDb();
  try {
    const { data, error } = await db.rpc('resolve_correction_request', {
      p_correction_id: correctionId,
      p_decision: input.data.decision,
      p_resolution: input.data.resolution,
      p_actor_id: actor.id,
    });
    if (error) return { error: 'The request was not changed. No changes were committed.' };
    const result = data as { success?: boolean; error?: string } | null;
    if (!result?.success) return { error: result?.error ?? 'The request was not changed.' };
  } catch {
    return { error: 'The request was not changed. No changes were committed.' };
  }

  revalidatePath('/admin/corrections');
  revalidatePath('/admin/claimables/[id]', 'page');
  return { success: true };
}

/* ===========================================================================
 * Takedowns (legal_reviewer + admin)
 * =========================================================================== */

const takedownResolutionSchema = z.object({
  decision: z.enum(['granted', 'rejected']),
  resolution: z.string().trim().min(3).max(2000),
});

export async function resolveTakedown(takedownId: string, formData: FormData) {
  const actor = await getActionActor(LEGAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(takedownId);
  if (!parsedId.success) return { error: 'Invalid takedown id' };

  const input = takedownResolutionSchema.safeParse({
    decision: fdString(formData, 'decision'),
    resolution: fdString(formData, 'resolution'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid resolution payload' };
  }

  const db = getAdminDb();
  try {
    const { data, error } = await db.rpc('resolve_takedown_request', {
      p_takedown_id: takedownId,
      p_decision: input.data.decision,
      p_resolution: input.data.resolution,
      p_actor_id: actor.id,
    });
    if (error) return { error: 'The request was not changed. Retry or contact an administrator.' };
    const result = data as { success?: boolean; error?: string } | null;
    if (!result?.success) return { error: result?.error ?? 'The request was not changed.' };
  } catch {
    return { error: 'The request was not changed. Retry or contact an administrator.' };
  }

  revalidatePath('/admin/corrections');
  revalidatePath('/admin/customer-requests');
  return { success: true };
}

/* ===========================================================================
 * User role management (admin only)
 * =========================================================================== */

const ASSIGNABLE_ROLES = ['user', 'researcher', 'editor', 'legal_reviewer', 'admin'] as const;

const roleAssignmentSchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES),
});

/**
 * Update a profile's role via the service-role client. Guards against
 * locking out of the admin panel: the last remaining admin can never be
 * demoted or re-roled.
 */
export async function updateUserRole(userId: string, formData: FormData) {
  const actor = await getActionActor(ADMINS_ONLY);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(userId);
  if (!parsedId.success) return { error: 'Invalid user id' };

  const input = roleAssignmentSchema.safeParse({ role: fdString(formData, 'role') });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid role' };
  }

  const db = getAdminDb();
  const { data, error } = await db.rpc('update_user_role_with_audit', {
    p_actor_id: actor.id,
    p_user_id: userId,
    p_role: input.data.role,
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };

  revalidatePath('/admin/users');
  return { success: true };
}
