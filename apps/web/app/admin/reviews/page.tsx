import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { EDITORIAL, EDITORIAL_AND_LEGAL } from '../_lib/roles';
import { ErrorBanner, FilterChips, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

/**
 * Cross-entity review queue: candidates awaiting an editorial decision,
 * draft claimables awaiting legal review, and open review assignments.
 * Visibility is role-scoped: editors see editorial + assignments,
 * legal reviewers see the legal queue, admins see everything.
 */
export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireRoles(EDITORIAL_AND_LEGAL);
  const isEditorial = EDITORIAL.includes(profile.role as (typeof EDITORIAL)[number]);

  const sp = await searchParams;
  const queue = (sp.queue as string) ?? (isEditorial ? 'editorial' : 'legal');

  let error: string | null = null;
  let pendingCandidates: Array<{
    id: string;
    validation_status: string;
    ai_confidence: number | null;
    created_at: string;
    source_documents: { title: string | null } | null;
  }> = [];
  let awaitingLegal: Array<{
    id: string;
    public_title: string;
    status: string;
    updated_at: string;
    legal_reviews: { id: string }[];
  }> = [];
  let openAssignments: Array<{
    id: string;
    status: string;
    assigned_at: string;
    claimable_id: string;
    profiles: { email: string } | null;
    claimables: { public_title: string } | null;
  }> = [];

  try {
    const db = getAdminDb();

    if (queue === 'editorial' && isEditorial) {
      const { data, error: queryError } = await db
        .from('candidate_documents')
        .select('id, validation_status, ai_confidence, created_at, source_documents!inner(title)')
        .in('publication_decision', ['pending', 'human_review'])
        .order('created_at', { ascending: true })
        .limit(50);
      if (queryError) error = queryError.message;
      else pendingCandidates = (data ?? []) as typeof pendingCandidates;
    } else if (queue === 'legal') {
      const { data, error: queryError } = await db
        .from('claimables')
        .select('id, public_title, status, updated_at, legal_reviews(id)')
        .eq('publication_status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (queryError) error = queryError.message;
      else {
        const rows = (data ?? []) as typeof awaitingLegal;
        awaitingLegal = rows.filter((r) => (r.legal_reviews ?? []).length === 0);
      }
    } else if (queue === 'assignments' && isEditorial) {
      const { data, error: queryError } = await db
        .from('review_assignments')
        .select('id, status, assigned_at, claimable_id, profiles(email), claimables(public_title)')
        .eq('status', 'pending')
        .order('assigned_at', { ascending: true })
        .limit(50);
      if (queryError) error = queryError.message;
      else openAssignments = (data ?? []) as typeof openAssignments;
    } else {
      error = 'Unknown review queue.';
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load review queue';
  }

  const tabs = [
    ...(isEditorial ? [{ value: 'editorial', label: 'Candidates pending decision' }] : []),
    { value: 'legal', label: 'Awaiting legal review' },
    ...(isEditorial ? [{ value: 'assignments', label: 'Open assignments' }] : []),
  ];

  return (
    <div>
      <PageHeader title="Review Queue" subtitle="Everything awaiting human review, by queue" />

      <div className="mt-4">
        <FilterChips
          paramName="queue"
          currentValue={queue}
          options={tabs}
          basePath="/admin/reviews"
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && queue === 'editorial' && (
        <div className="mt-6 overflow-x-auto">
          {pendingCandidates.length === 0 ? (
            <p className="text-sm text-text-muted">No candidates awaiting a decision.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Validation</th>
                  <th className="pb-2 pr-4 font-medium">Confidence</th>
                  <th className="pb-2 pr-4 font-medium">Waiting Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingCandidates.map((c) => (
                  <tr key={c.id} className="text-text-primary hover:bg-surface">
                    <td className="max-w-[280px] truncate py-2 pr-4">
                      <Link
                        href={`/admin/candidates/${c.id}`}
                        className="text-trust-primary hover:underline"
                      >
                        {c.source_documents?.title ?? 'Untitled'}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(c.validation_status)}>
                        {c.validation_status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">{c.ai_confidence?.toFixed(2) ?? '—'}</td>
                    <td className="py-2 pr-4 text-text-muted">{formatDateTime(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!error && queue === 'legal' && (
        <div className="mt-6 overflow-x-auto">
          {awaitingLegal.length === 0 ? (
            <p className="text-sm text-text-muted">No draft claimables awaiting legal review.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Claimable</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {awaitingLegal.map((c) => (
                  <tr key={c.id} className="text-text-primary hover:bg-surface">
                    <td className="max-w-[320px] truncate py-2 pr-4">
                      <Link
                        href={`/admin/claimables/${c.id}`}
                        className="text-trust-primary hover:underline"
                      >
                        {c.public_title}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-text-muted">{formatDateTime(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!error && queue === 'assignments' && (
        <div className="mt-6 overflow-x-auto">
          {openAssignments.length === 0 ? (
            <p className="text-sm text-text-muted">No open review assignments.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Claimable</th>
                  <th className="pb-2 pr-4 font-medium">Assignee</th>
                  <th className="pb-2 pr-4 font-medium">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openAssignments.map((a) => (
                  <tr key={a.id} className="text-text-primary hover:bg-surface">
                    <td className="max-w-[320px] truncate py-2 pr-4">
                      <Link
                        href={`/admin/claimables/${a.claimable_id}`}
                        className="text-trust-primary hover:underline"
                      >
                        {a.claimables?.public_title ?? a.claimable_id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">
                      {a.profiles?.email ?? 'Unassigned (pool)'}
                    </td>
                    <td className="py-2 pr-4 text-text-muted">{formatDateTime(a.assigned_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
