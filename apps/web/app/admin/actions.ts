'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminDb } from '@/lib/admin-db';
import { isKnownNonFilingInformationUrl } from '@/lib/official-filing-route';
import { isPublicationDeadlineExpired } from '@/lib/editorial-publication-safety';
import { requireRole } from '@/lib/auth';
import { getActionActor, unauthorized, EDITORIAL } from './_lib/roles';
import { slugify } from './_lib/ui';

/**
 * Admin server actions for ingestion concerns (sources, crawls) and the
 * candidate publication workflow.
 *
 * Crawl triggering is intentionally CLI-only: a full crawl takes minutes and
 * would block the request path with no run-lock. A web-triggered crawl with
 * locking is future work and out of scope for now: these stubs document the
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

  const { data, error } = await supabase.rpc('toggle_source_with_audit', {
    p_actor_id: actor.id,
    p_source_id: sourceId,
  });
  revalidatePath('/admin/sources');
  revalidatePath(`/admin/sources/${sourceId}`);
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };

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
 * Approval alone does not publish anything: it marks the candidate ready to
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
    .select('id, updated_at, publication_decision, validation_status, ai_extraction_status, ai_extracted_data')
    .eq('id', candidateId)
    .single();

  if (fetchError || !candidate) return { error: 'Candidate not found' };
  if (!['pending', 'human_review'].includes(candidate.publication_decision)) {
    return { error: `Candidate already ${candidate.publication_decision}: nothing to approve.` };
  }

  // Editors may not bypass AI evidence validation by approving a merely
  // detected/deferred item. Only a fully extracted, validated candidate with
  // cited evidence may enter the publication workflow.
  const extracted = candidate.ai_extracted_data as {
    evidence?: unknown[];
    official_claim_url?: string | null;
    deadline?: string | null;
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

  if (isKnownNonFilingInformationUrl(extracted?.official_claim_url)) {
    return {
      error:
        'This candidate links to a general IBBI downloads page, not a verified filing route. Confirm the official Form A instructions and correct the extracted route through the auditable review workflow first.',
    };
  }

  // Historical validation results do not stay current forever: a filing
  // window can expire between AI processing and staff approval.
  if (isPublicationDeadlineExpired(extracted?.deadline ?? null)) {
    return {
      error:
        'The source filing deadline has expired. Re-review the official notice before approving.',
    };
  }

  const { data: result, error } = await db.rpc('approve_candidate_with_event', {
    p_candidate_id: candidateId,
    p_actor_id: actor.id,
    p_expected_updated_at: candidate.updated_at,
  });
  if (error) return { error: error.message };
  if (!result?.success) return { error: result?.error ?? 'Unable to approve candidate.' };

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
    return { error: `Candidate already ${candidate.publication_decision}: nothing to reject.` };
  }

  const { data: result, error } = await db.rpc('reject_candidate_with_event', {
    p_candidate_id: candidateId,
    p_actor_id: actor.id,
    p_reason: input.data.reason,
  });
  if (error) return { error: error.message };
  if (!result?.success) return { error: result?.error ?? 'Unable to reject candidate.' };

  revalidatePath('/admin/candidates');
  revalidatePath(`/admin/candidates/${candidateId}`);
  return { success: true };
}

/**
 * Promote an approved candidate into a claimable.
 *
 * Honors the publication policy: AUTO_VERIFY_CLAIMABLES=false means promotion
 * ALWAYS creates a draft claimable under human review: never
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

  // Check again at draft promotion: a previously approved filing window may
  // have expired, or a generic regulator information URL may be misleading.
  const reviewedExtraction = (candidate.ai_extracted_data ?? {}) as Record<string, unknown>;
  const candidateDeadline =
    typeof reviewedExtraction.deadline === 'string' ? reviewedExtraction.deadline : null;
  if (isPublicationDeadlineExpired(candidateDeadline)) {
    return { error: 'The source filing deadline has expired. Do not promote this candidate.' };
  }
  if (
    typeof reviewedExtraction.official_claim_url === 'string' &&
    isKnownNonFilingInformationUrl(reviewedExtraction.official_claim_url)
  ) {
    return { error: 'The source contains an information page, not a verified filing URL.' };
  }

  // Best-effort mapping of AI-extracted fields; missing data stays null and
  // is filled in during editorial review.
  const ext = (candidate.ai_extracted_data ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

  const { data: sourceDoc } = await db
    .from('source_documents')
    .select('title')
    .eq('id', candidate.source_document_id)
    .single();

  const publicTitle =
    str(ext.legal_case_title) ??
    sourceDoc?.title ??
    `Claimable candidate ${candidateId.slice(0, 8)}`;
  const slug = `${slugify(publicTitle)}-${candidateId.slice(0, 8)}`;
  const rawConfidence = num(candidate.ai_confidence) ?? 0;
  const confidencePercent = Math.round(
    Math.max(0, Math.min(100, rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)),
  );

  const { data: result, error: promoteError } = await db.rpc('promote_candidate_with_source', {
    p_candidate_id: candidateId,
    p_actor_id: actor.id,
    p_slug: slug,
    p_public_title: publicTitle,
    p_payload: {
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
      amount_currency: str(ext.amount_currency),
      proof_requirements: Array.isArray(ext.proof_requirements) ? ext.proof_requirements : [],
      action_required: str(ext.action_required),
      official_claim_url: str(ext.official_claim_url),
      deadline: str(ext.deadline),
      // Confidence is not a deterministic claimability score; leave that unknown.
      claimability_score: null,
      confidence: confidencePercent,
      publication_status: 'draft',
      updated_at: new Date().toISOString(),
    },
  });
  if (promoteError) return { error: promoteError.message };
  if (!result?.success || !result.claimable_id) {
    return { error: result?.error ?? 'Failed to create claimable.' };
  }

  revalidatePath('/admin/claimables');
  revalidatePath('/admin/candidates');
  redirect(`/admin/claimables/${result.claimable_id}`);
}
