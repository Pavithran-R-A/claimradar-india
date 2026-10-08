'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/lib/admin-db';
import { writeAuditLog } from './_lib/audit';
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

  const db = getAdminDb();
  const { data: current, error: fetchError } = await db
    .from('claimables')
    .select('*')
    .eq('id', claimableId)
    .single();
  if (fetchError || !current) return { error: 'Claimable not found' };

  // Revision row: snapshot the pre-edit state (immutable history).
  const { data: latestVersion } = await db
    .from('claim_versions')
    .select('version_number')
    .eq('claimable_id', claimableId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  await db.from('claim_versions').insert({
    claimable_id: claimableId,
    version_number: (latestVersion?.version_number ?? 0) + 1,
    snapshot: current,
    change_reason: input.data.change_reason,
    actor_type: 'staff_user',
    actor_id: actor.id,
  });

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
    updated_at: new Date().toISOString(),
  };

  const { error } = await db.from('claimables').update(updates).eq('id', claimableId);
  if (error) return { error: error.message };

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'claimable.updated',
    entityType: 'claimable',
    entityId: claimableId,
    before: {
      public_title: current.public_title,
      status: current.status,
      procedural_status: current.procedural_status,
    },
    after: {
      public_title: updates.public_title,
      status: updates.status,
      procedural_status: updates.procedural_status,
    },
    details: {
      change_reason: input.data.change_reason,
      version: (latestVersion?.version_number ?? 0) + 1,
    },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  return { success: true };
}

/* ===========================================================================
 * Publication approval (editor + admin)
 * =========================================================================== */

/**
 * Explicit publication approval — the only path to `published`.
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
    .select('id, status, publication_status, first_published_at, public_title, official_claim_url, deadline, action_required')
    .eq('id', claimableId)
    .single();
  if (fetchError || !claimable) return { error: 'Claimable not found' };
  if (claimable.publication_status === 'published') {
    return { error: 'Claimable is already published.' };
  }
  if (claimable.publication_status !== 'draft') {
    return { error: 'Only draft claimables can be published.' };
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
  if (claimable.deadline && Date.parse(claimable.deadline) < Date.now()) {
    return { error: 'Cannot publish an opportunity with an expired deadline.' };
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
  if (legalError || latestLegalReview?.decision !== 'clear_to_publish') {
    return { error: 'A current legal review clearing this claimable is required before publication.' };
  }

  const now = new Date().toISOString();
  const { error } = await db
    .from('claimables')
    .update({
      publication_status: 'published',
      first_published_at: claimable.first_published_at ?? now,
      last_verified_at: now,
      updated_at: now,
    })
    .eq('id', claimableId);
  if (error) return { error: error.message };

  await db.from('publication_events').insert({
    claimable_id: claimableId,
    action: 'publication_approved',
    previous_status: claimable.status,
    new_status: claimable.status,
    actor_type: 'staff_user',
    actor_id: actor.id,
    reason: 'Explicit editorial publication approval',
  });

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'claimable.published',
    entityType: 'claimable',
    entityId: claimableId,
    before: { publication_status: claimable.publication_status },
    after: { publication_status: 'published' },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/claimables');
  revalidatePath(`/admin/claimables/${claimableId}`);
  return { success: true };
}

/**
 * Archive (unpublish) a claimable — e.g. after an upheld takedown or when a
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
    .select('id, status, publication_status')
    .eq('id', claimableId)
    .single();
  if (fetchError || !claimable) return { error: 'Claimable not found' };
  if (claimable.publication_status === 'archived') {
    return { error: 'Claimable is already archived.' };
  }

  const now = new Date().toISOString();
  const { error } = await db
    .from('claimables')
    .update({ publication_status: 'archived', updated_at: now })
    .eq('id', claimableId);
  if (error) return { error: error.message };

  await db.from('publication_events').insert({
    claimable_id: claimableId,
    action: 'publication_archived',
    previous_status: claimable.status,
    new_status: claimable.status,
    actor_type: 'staff_user',
    actor_id: actor.id,
    reason: 'Archived by editorial staff',
  });

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'claimable.archived',
    entityType: 'claimable',
    entityId: claimableId,
    before: { publication_status: claimable.publication_status },
    after: { publication_status: 'archived' },
  });
  if (audit.error) return audit;

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
});

export async function submitLegalReview(claimableId: string, formData: FormData) {
  const actor = await getActionActor(LEGAL);
  if (!actor) return unauthorized();

  const parsedId = uuidSchema.safeParse(claimableId);
  if (!parsedId.success) return { error: 'Invalid claimable id' };

  const input = legalReviewSchema.safeParse({
    decision: fdString(formData, 'decision'),
    findings: fdString(formData, 'findings'),
  });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid legal review payload' };
  }

  const db = getAdminDb();
  const { data: claimable } = await db
    .from('claimables')
    .select('id, public_title')
    .eq('id', claimableId)
    .single();
  if (!claimable) return { error: 'Claimable not found' };

  const { error } = await db.from('legal_reviews').insert({
    claimable_id: claimableId,
    reviewer_id: actor.id,
    decision: input.data.decision,
    findings: input.data.findings,
  });
  if (error) return { error: error.message };

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'legal_review.submitted',
    entityType: 'claimable',
    entityId: claimableId,
    after: { decision: input.data.decision },
    details: { title: claimable.public_title },
  });
  if (audit.error) return audit;

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
  const { error } = await db.from('review_assignments').insert({
    claimable_id: claimableId,
    assigned_to: input.data.assigned_to || null,
    status: 'pending',
    notes: input.data.notes || null,
  });
  if (error) return { error: error.message };

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'review.assigned',
    entityType: 'claimable',
    entityId: claimableId,
    after: { assigned_to: input.data.assigned_to || null, status: 'pending' },
  });
  if (audit.error) return audit;

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
  const { data: assignment, error: fetchError } = await db
    .from('review_assignments')
    .select('id, claimable_id, status')
    .eq('id', assignmentId)
    .single();
  if (fetchError || !assignment) return { error: 'Assignment not found' };
  if (assignment.status === 'completed') return { error: 'Assignment already completed.' };

  const { error } = await db
    .from('review_assignments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', assignmentId);
  if (error) return { error: error.message };

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'review.completed',
    entityType: 'review_assignment',
    entityId: assignmentId,
    before: { status: assignment.status },
    after: { status: 'completed' },
    details: { claimable_id: assignment.claimable_id },
  });
  if (audit.error) return audit;

  revalidatePath(`/admin/claimables/${assignment.claimable_id}`);
  revalidatePath('/admin/reviews');
  return { success: true };
}

/* ===========================================================================
 * Corrections (editor + admin) — content changes follow the legal-content
 * rule: accepted corrections write a claim_versions revision row, publish a
 * correction event, and are fully audited.
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
  const { data: correction, error: fetchError } = await db
    .from('correction_requests')
    .select('*')
    .eq('id', correctionId)
    .single();
  if (fetchError || !correction) return { error: 'Correction request not found' };
  if (correction.status !== 'new' && correction.status !== 'in_review') {
    return { error: `Correction request already ${correction.status}.` };
  }

  const now = new Date().toISOString();
  const newStatus = input.data.decision === 'accepted' ? 'resolved' : 'rejected';
  const { error } = await db
    .from('correction_requests')
    .update({ status: newStatus, resolution: input.data.resolution, updated_at: now })
    .eq('id', correctionId);
  if (error) return { error: error.message };

  if (input.data.decision === 'accepted') {
    // Legal-content rule: snapshot current claimable state as a revision row
    // before the correction notice is applied.
    const { data: claimable } = await db
      .from('claimables')
      .select('*')
      .eq('id', correction.claimable_id)
      .single();

    if (claimable) {
      const { data: latestVersion } = await db
        .from('claim_versions')
        .select('version_number')
        .eq('claimable_id', correction.claimable_id)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      await db.from('claim_versions').insert({
        claimable_id: correction.claimable_id,
        version_number: (latestVersion?.version_number ?? 0) + 1,
        snapshot: claimable,
        change_reason: `Correction accepted: ${input.data.resolution}`,
        actor_type: 'staff_user',
        actor_id: actor.id,
      });

      await db.from('publication_events').insert({
        claimable_id: correction.claimable_id,
        action: 'correction_notice_published',
        previous_status: claimable.status,
        new_status: claimable.status,
        actor_type: 'staff_user',
        actor_id: actor.id,
        reason: input.data.resolution,
      });
    }
  }

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: `correction.${input.data.decision}`,
    entityType: 'correction_request',
    entityId: correctionId,
    before: { status: correction.status },
    after: { status: newStatus },
    details: { claimable_id: correction.claimable_id, resolution: input.data.resolution },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/corrections');
  revalidatePath(`/admin/claimables/${correction.claimable_id}`);
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
  const { data: takedown, error: fetchError } = await db
    .from('takedown_requests')
    .select('*')
    .eq('id', takedownId)
    .single();
  if (fetchError || !takedown) return { error: 'Takedown request not found' };
  if (takedown.status !== 'new' && takedown.status !== 'in_review') {
    return { error: `Takedown request already ${takedown.status}.` };
  }

  const now = new Date().toISOString();
  const { error } = await db
    .from('takedown_requests')
    .update({
      status: input.data.decision,
      resolution: input.data.resolution,
      updated_at: now,
    })
    .eq('id', takedownId);
  if (error) return { error: error.message };

  if (input.data.decision === 'granted') {
    // Upheld takedown: archive the claimable so it leaves the public site.
    const { data: claimable } = await db
      .from('claimables')
      .select('id, status, publication_status')
      .eq('id', takedown.claimable_id)
      .single();

    if (claimable) {
      await db
        .from('claimables')
        .update({ publication_status: 'archived', updated_at: now })
        .eq('id', takedown.claimable_id);

      await db.from('publication_events').insert({
        claimable_id: takedown.claimable_id,
        action: 'takedown_granted',
        previous_status: claimable.status,
        new_status: claimable.status,
        actor_type: 'staff_user',
        actor_id: actor.id,
        reason: input.data.resolution,
      });
    }
  }

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: `takedown.${input.data.decision}`,
    entityType: 'takedown_request',
    entityId: takedownId,
    before: { status: takedown.status },
    after: { status: input.data.decision },
    details: { claimable_id: takedown.claimable_id, resolution: input.data.resolution },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/corrections');
  revalidatePath(`/admin/claimables/${takedown.claimable_id}`);
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
  const { data: target, error: fetchError } = await db
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .single();
  if (fetchError || !target) return { error: 'User not found' };

  if (target.role === input.data.role) {
    return { error: 'User already has this role.' };
  }

  // Last-admin lockout guard: never let the final admin lose the role,
  // including via self-demotion.
  if (target.role === 'admin' && input.data.role !== 'admin') {
    const { count: adminCount, error: countError } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (countError) return { error: `Could not verify admin count: ${countError.message}` };
    if ((adminCount ?? 0) <= 1) {
      return { error: 'Cannot demote the last remaining admin — promote another admin first.' };
    }
  }

  const { error } = await db
    .from('profiles')
    .update({ role: input.data.role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) return { error: error.message };

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'profile.role_changed',
    entityType: 'profile',
    entityId: userId,
    before: { role: target.role },
    after: { role: input.data.role },
    details: { email: target.email },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/users');
  return { success: true };
}
