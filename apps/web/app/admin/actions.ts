'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminDb } from '@/lib/admin-db';
import { requireRole } from '@/lib/auth';
import { writeAuditLog } from './_lib/audit';
import { getActionActor, unauthorized, EDITORIAL } from './_lib/roles';
import { slugify } from './_lib/ui';

/**
 * Admin server actions for ingestion concerns (sources, crawls) and the
 * candidate publication workflow.
 *
 * Crawl triggering is intentionally CLI-only: a full crawl takes minutes and
 * would block the request path with no run-lock. A web-triggered crawl with
 * locking is future work and out of scope for now — these stubs document the
 * real CLI commands instead of pretending to run anything.
 */

const uuidSchema = z.string().uuid();

const rejectCandidateSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Please provide a short rejection reason')
    .max(1000, 'Reason is too long (max 1000 characters)'),
});

export async function toggleSource(sourceId: string) {
  const actor = await requireRole('admin');

  const parsed = uuidSchema.safeParse(sourceId);
  if (!parsed.success) return { error: 'Invalid source id' };

  const supabase = getAdminDb();

  const { data: source, error: fetchError } = await supabase
    .from('sources')
    .select('id, name, enabled')
    .eq('id', sourceId)
    .single();

  if (fetchError || !source) return { error: 'Source not found' };

  const { error } = await supabase
    .from('sources')
    .update({ enabled: !source.enabled })
    .eq('id', sourceId);

  if (error) return { error: error.message };

  // Privileged state change — record it in the audit trail.
  await writeAuditLog({
    actorId: actor.id,
    action: source.enabled ? 'source.disabled' : 'source.enabled',
    entityType: 'source',
    entityId: sourceId,
    before: { enabled: source.enabled },
    after: { enabled: !source.enabled },
    details: { name: source.name },
  });

  revalidatePath('/admin/sources');
  revalidatePath(`/admin/sources/${sourceId}`);
  return { success: true };
}

export async function triggerCrawl() {
  await requireRole('admin');
  return {
    message:
      'Crawls are run from the CLI only (no long-running work in the request path): pnpm crawler:daily',
  };
}

export async function retryDeferred() {
  await requireRole('admin');
  // Note: there is no `crawler:retry-queued` script in the root package.json.
  // The retry path is a crawler CLI subcommand, invoked via the filter script:
  return {
    message:
      'Retry deferred AI extractions from the CLI: pnpm --filter @claimradar/crawler dev -- retry-queued',
  };
}

/* ===========================================================================
 * Candidate workflow: approve / reject / promote
 * =========================================================================== */

/**
 * Approve a candidate for promotion. Editorial roles only.
 * Approval alone does not publish anything — it marks the candidate ready to
 * be promoted into a draft claimable.
 */
export async function approveCandidate(candidateId: string) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsed = uuidSchema.safeParse(candidateId);
  if (!parsed.success) return { error: 'Invalid candidate id' };

  const db = getAdminDb();
  const { data: candidate, error: fetchError } = await db
    .from('candidate_documents')
    .select('id, publication_decision, validation_status, ai_extraction_status, ai_extracted_data')
    .eq('id', candidateId)
    .single();

  if (fetchError || !candidate) return { error: 'Candidate not found' };
  if (!['pending', 'human_review'].includes(candidate.publication_decision)) {
    return { error: `Candidate already ${candidate.publication_decision} — nothing to approve.` };
  }

  // Editors may not bypass AI evidence validation by approving a merely
  // detected/deferred item. Only a fully extracted, validated candidate with
  // cited evidence may enter the publication workflow.
  const extracted = candidate.ai_extracted_data as {
    evidence?: unknown[];
  } | null;
  if (
    candidate.ai_extraction_status !== 'completed' ||
    candidate.validation_status !== 'pass' ||
    !Array.isArray(extracted?.evidence) ||
    extracted.evidence.length === 0
  ) {
    return {
      error:
        'Candidate must pass AI extraction, source evidence, and all validation checks before editorial approval.',
    };
  }

  const { error } = await db
    .from('candidate_documents')
    .update({ publication_decision: 'approved' })
    .eq('id', candidateId);
  if (error) return { error: error.message };

  await db.from('publication_events').insert({
    candidate_document_id: candidateId,
    action: 'candidate_approved',
    previous_status: null,
    new_status: null,
    actor_type: 'staff_user',
    actor_id: actor.id,
    reason: 'Approved by editorial staff for promotion to draft claimable',
  });

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'candidate.approved',
    entityType: 'candidate_document',
    entityId: candidateId,
    before: { publication_decision: candidate.publication_decision },
    after: { publication_decision: 'approved' },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/candidates');
  revalidatePath(`/admin/candidates/${candidateId}`);
  return { success: true };
}

/**
 * Reject a candidate with a mandatory reason. Editorial roles only.
 */
export async function rejectCandidate(candidateId: string, formData: FormData) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsed = uuidSchema.safeParse(candidateId);
  if (!parsed.success) return { error: 'Invalid candidate id' };

  const input = rejectCandidateSchema.safeParse({ reason: formData.get('reason') });
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Invalid rejection reason' };
  }

  const db = getAdminDb();
  const { data: candidate, error: fetchError } = await db
    .from('candidate_documents')
    .select('id, publication_decision')
    .eq('id', candidateId)
    .single();

  if (fetchError || !candidate) return { error: 'Candidate not found' };
  if (!['pending', 'human_review'].includes(candidate.publication_decision)) {
    return { error: `Candidate already ${candidate.publication_decision} — nothing to reject.` };
  }

  const { error } = await db
    .from('candidate_documents')
    .update({ publication_decision: 'rejected' })
    .eq('id', candidateId);
  if (error) return { error: error.message };

  await db.from('publication_events').insert({
    candidate_document_id: candidateId,
    action: 'candidate_rejected',
    previous_status: null,
    new_status: null,
    actor_type: 'staff_user',
    actor_id: actor.id,
    reason: input.data.reason,
  });

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'candidate.rejected',
    entityType: 'candidate_document',
    entityId: candidateId,
    before: { publication_decision: candidate.publication_decision },
    after: { publication_decision: 'rejected' },
    details: { reason: input.data.reason },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/candidates');
  revalidatePath(`/admin/candidates/${candidateId}`);
  return { success: true };
}

/**
 * Promote an approved candidate into a claimable.
 *
 * Honors the publication policy: AUTO_VERIFY_CLAIMABLES=false means promotion
 * ALWAYS creates a draft claimable under human review — never
 * `verified_claimable`, never published. The claimable only reaches the
 * public via explicit publication approval on /admin/claimables.
 */
export async function promoteCandidate(candidateId: string) {
  const actor = await getActionActor(EDITORIAL);
  if (!actor) return unauthorized();

  const parsed = uuidSchema.safeParse(candidateId);
  if (!parsed.success) return { error: 'Invalid candidate id' };

  const db = getAdminDb();
  const { data: candidate, error: fetchError } = await db
    .from('candidate_documents')
    .select('*')
    .eq('id', candidateId)
    .single();
  if (fetchError || !candidate) return { error: 'Candidate not found' };

  if (candidate.publication_decision !== 'approved') {
    return { error: 'Only approved candidates can be promoted to claimables.' };
  }

  // Guard against double promotion via the publication event trail.
  const { data: existingPromotion } = await db
    .from('publication_events')
    .select('claimable_id')
    .eq('candidate_document_id', candidateId)
    .eq('action', 'candidate_promoted')
    .maybeSingle();
  if (existingPromotion?.claimable_id) {
    return { error: 'Candidate was already promoted to a claimable.' };
  }

  const { data: sourceDoc } = await db
    .from('source_documents')
    .select('title, canonical_url')
    .eq('id', candidate.source_document_id)
    .single();

  // Best-effort mapping of AI-extracted fields; missing data stays null and
  // is filled in during editorial review.
  const ext = (candidate.ai_extracted_data ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

  const publicTitle =
    str(ext.legal_case_title) ??
    sourceDoc?.title ??
    `Claimable candidate ${candidateId.slice(0, 8)}`;
  const slug = `${slugify(publicTitle)}-${candidateId.slice(0, 8)}`;

  const { data: claimable, error: insertError } = await db
    .from('claimables')
    .insert({
      slug,
      public_title: publicTitle,
      legal_case_title: str(ext.legal_case_title),
      case_number: str(ext.case_number),
      summary: str(ext.relief_description) ?? sourceDoc?.title ?? null,
      status: 'detected',
      procedural_status: str(ext.procedural_status) ?? 'pending',
      authority: str(ext.authority),
      affected_group: str(ext.affected_group),
      geographic_scope: str(ext.geographic_scope),
      relief_type: str(ext.relief_type),
      relief_description: str(ext.relief_description),
      official_amount: num(ext.official_amount),
      amount_currency: str(ext.amount_currency) ?? 'INR',
      proof_requirements: Array.isArray(ext.proof_requirements) ? ext.proof_requirements : [],
      action_required: str(ext.action_required),
      official_claim_url: str(ext.official_claim_url),
      deadline: str(ext.deadline),
      claimability_score: Math.round((num(candidate.ai_confidence) ?? 0) * 100),
      confidence: Math.round((num(candidate.ai_confidence) ?? 0) * 100),
      publication_status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .select('id, slug')
    .single();

  if (insertError || !claimable) {
    return { error: insertError?.message ?? 'Failed to create claimable' };
  }

  // Publication requires an auditable primary official source.
  const { error: sourceLinkError } = await db.from('claim_sources').insert({
    claimable_id: claimable.id,
    source_document_id: candidate.source_document_id,
    source_role: 'primary',
    is_primary: true,
  });
  if (sourceLinkError) {
    await db.from('claimables').delete().eq('id', claimable.id).eq('publication_status', 'draft');
    return { error: `Unable to attach official source: ${sourceLinkError.message}` };
  }

  await db.from('publication_events').insert({
    claimable_id: claimable.id,
    candidate_document_id: candidateId,
    action: 'candidate_promoted',
    previous_status: null,
    new_status: 'detected',
    actor_type: 'staff_user',
    actor_id: actor.id,
    reason:
      'Candidate promoted to draft claimable — human review required (AUTO_VERIFY_CLAIMABLES=false)',
  });

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: 'candidate.promoted',
    entityType: 'claimable',
    entityId: claimable.id,
    before: { candidate_document_id: candidateId, publication_decision: 'approved' },
    after: { slug: claimable.slug, status: 'detected', publication_status: 'draft' },
  });
  if (audit.error) return audit;

  revalidatePath('/admin/claimables');
  revalidatePath('/admin/candidates');
  redirect(`/admin/claimables/${claimable.id}`);
}
