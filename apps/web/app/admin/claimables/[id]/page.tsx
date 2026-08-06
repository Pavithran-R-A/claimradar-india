import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import type { Claimable } from '@claimradar/database';
import {
  approvePublication,
  archiveClaimable,
  assignReview,
  completeReviewAssignment,
  submitLegalReview,
  updateClaimable,
} from '../../editorial-actions';
import { ActionButton, ActionForm } from '../../_components/action-controls';
import { ALL_STAFF, EDITORIAL, LEGAL } from '../../_lib/roles';
import {
  CLAIMABLE_STATUSES,
  LEGAL_REVIEW_DECISIONS,
  PROCEDURAL_STATUSES,
} from '../../_lib/constants';
import { ErrorBanner, PageHeader, formatDateTime, statusVariant } from '../../_lib/ui';

interface LegalReviewRow {
  id: string;
  decision: string;
  findings: string | null;
  reviewed_at: string;
  profiles: { email: string } | null;
}

interface AssignmentRow {
  id: string;
  status: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  profiles: { email: string } | null;
}

interface RequestRow {
  id: string;
  status: string;
  created_at: string;
}

interface VersionRow {
  id: string;
  version_number: number;
  change_reason: string | null;
  created_at: string;
}

interface EventRow {
  id: string;
  action: string;
  reason: string | null;
  created_at: string;
}

export default async function ClaimableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRoles(ALL_STAFF);
  const canEdit = EDITORIAL.includes(profile.role as (typeof EDITORIAL)[number]);
  const canReviewLegal = LEGAL.includes(profile.role as (typeof LEGAL)[number]);

  const { id } = await params;

  let claimable: Claimable | null = null;
  let companyName: string | null = null;
  let legalReviews: LegalReviewRow[] = [];
  let assignments: AssignmentRow[] = [];
  let corrections: RequestRow[] = [];
  let takedowns: RequestRow[] = [];
  let versions: VersionRow[] = [];
  let events: EventRow[] = [];
  let staffOptions: { id: string; email: string; role: string }[] = [];
  let error: string | null = null;

  try {
    const db = getAdminDb();

    const claimRes = await db
      .from('claimables')
      .select('*, companies(display_name)')
      .eq('id', id)
      .single();

    if (claimRes.error) {
      error = claimRes.error.message;
    } else {
      const row = claimRes.data as Claimable & { companies: { display_name: string } | null };
      companyName = row.companies?.display_name ?? null;
      const { companies: _company, ...rest } = row;
      claimable = rest as Claimable;

      const [legalRes, assignRes, corrRes, takeRes, verRes, evRes, staffRes] = await Promise.all([
        db
          .from('legal_reviews')
          .select('id, decision, findings, reviewed_at, profiles(email)')
          .eq('claimable_id', id)
          .order('reviewed_at', { ascending: false }),
        db
          .from('review_assignments')
          .select('id, status, assigned_at, completed_at, notes, profiles(email)')
          .eq('claimable_id', id)
          .order('assigned_at', { ascending: false }),
        db
          .from('correction_requests')
          .select('id, status, created_at')
          .eq('claimable_id', id)
          .order('created_at', { ascending: false }),
        db
          .from('takedown_requests')
          .select('id, status, created_at')
          .eq('claimable_id', id)
          .order('created_at', { ascending: false }),
        db
          .from('claim_versions')
          .select('id, version_number, change_reason, created_at')
          .eq('claimable_id', id)
          .order('version_number', { ascending: false })
          .limit(5),
        db
          .from('publication_events')
          .select('id, action, reason, created_at')
          .eq('claimable_id', id)
          .order('created_at', { ascending: false })
          .limit(10),
        canEdit
          ? db
              .from('profiles')
              .select('id, email, role')
              .in('role', ['editor', 'legal_reviewer', 'admin'])
              .order('email')
          : Promise.resolve({ data: [] }),
      ]);

      legalReviews = legalRes.data ?? [];
      assignments = assignRes.data ?? [];
      corrections = corrRes.data ?? [];
      takedowns = takeRes.data ?? [];
      versions = verRes.data ?? [];
      events = evRes.data ?? [];
      staffOptions = staffRes.data ?? [];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load claimable';
  }

  if (error || !claimable) {
    return (
      <div>
        <Link href="/admin/claimables" className="text-sm text-trust-primary hover:underline">
          &larr; Back to Claimables
        </Link>
        <div className="mt-4">
          <ErrorBanner message={error ?? 'Claimable not found'} />
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';
  const labelCls = 'mb-1.5 block text-sm font-medium text-text-secondary';

  return (
    <div>
      <Link href="/admin/claimables" className="text-sm text-trust-primary hover:underline">
        &larr; Back to Claimables
      </Link>

      <div className="mt-4">
        <PageHeader title={claimable.public_title} subtitle={`/${claimable.slug}`}>
          <div className="flex gap-2">
            <Badge variant={statusVariant(claimable.status)}>{claimable.status}</Badge>
            <Badge variant={statusVariant(claimable.publication_status)}>
              {claimable.publication_status}
            </Badge>
          </div>
        </PageHeader>
      </div>

      {/* Publication workflow */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">Publication</h2>
        <p className="mt-2 text-sm text-text-muted">
          Publishing is an explicit editorial approval — nothing is auto-published or auto-verified
          (AUTO_VERIFY_CLAIMABLES=false). Every approval is recorded as a publication event and in
          the audit log.
        </p>
        {canEdit ? (
          <div className="mt-4 flex flex-wrap gap-4">
            {claimable.publication_status !== 'published' && (
              <ActionButton
                action={approvePublication.bind(null, claimable.id)}
                label="Approve publication"
                pendingLabel="Publishing…"
                confirmLabel="Publish"
                confirmMessage={`Publishing makes "${claimable.public_title}" visible to everyone on the public ClaimRadar website and in search engines. This is recorded in the audit log and as a publication event.`}
              />
            )}
            {claimable.publication_status !== 'archived' && (
              <ActionButton
                action={archiveClaimable.bind(null, claimable.id)}
                label={
                  claimable.publication_status === 'published' ? 'Archive (unpublish)' : 'Archive'
                }
                pendingLabel="Archiving…"
                variant="outline"
                confirmLabel="Archive"
                confirmMessage={
                  claimable.publication_status === 'published'
                    ? `Archiving removes "${claimable.public_title}" from the public website immediately. Users watching it will no longer see it, and the unpublish is recorded in the audit log.`
                    : 'Archiving marks this claimable as withdrawn from any publication pipeline. This is recorded in the audit log.'
                }
              />
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-muted">
            Publication approval requires the editor or admin role.
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <dt className="text-text-muted">First Published</dt>
          <dd className="text-text-primary">{formatDateTime(claimable.first_published_at)}</dd>
          <dt className="text-text-muted">Last Verified</dt>
          <dd className="text-text-primary">{formatDateTime(claimable.last_verified_at)}</dd>
          <dt className="text-text-muted">Claimability Score</dt>
          <dd className="text-text-primary">{claimable.claimability_score}</dd>
          <dt className="text-text-muted">Confidence</dt>
          <dd className="text-text-primary">{claimable.confidence}</dd>
        </dl>
      </Card>

      {/* Core fields */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">Details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-muted">Company</dt>
          <dd className="text-text-primary">{companyName ?? '—'}</dd>
          <dt className="text-text-muted">Procedural Status</dt>
          <dd className="text-text-primary">{claimable.procedural_status}</dd>
          <dt className="text-text-muted">Authority</dt>
          <dd className="text-text-primary">{claimable.authority ?? '—'}</dd>
          <dt className="text-text-muted">Jurisdiction</dt>
          <dd className="text-text-primary">{claimable.jurisdiction ?? '—'}</dd>
          <dt className="text-text-muted">Affected Group</dt>
          <dd className="text-text-primary">{claimable.affected_group ?? '—'}</dd>
          <dt className="text-text-muted">Geographic Scope</dt>
          <dd className="text-text-primary">{claimable.geographic_scope ?? '—'}</dd>
          <dt className="text-text-muted">Relief</dt>
          <dd className="text-text-primary">
            {claimable.relief_type
              ? `${claimable.relief_type}${claimable.official_amount ? ` — ${claimable.official_amount} ${claimable.amount_currency}` : ''}`
              : '—'}
          </dd>
          <dt className="text-text-muted">Deadline</dt>
          <dd className="text-text-primary">{formatDateTime(claimable.deadline)}</dd>
          <dt className="text-text-muted">Official Claim URL</dt>
          <dd className="break-all text-text-primary">
            {claimable.official_claim_url ? (
              <a
                href={claimable.official_claim_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-trust-primary hover:underline"
              >
                {claimable.official_claim_url}
              </a>
            ) : (
              '—'
            )}
          </dd>
          <dt className="text-text-muted">Action Required</dt>
          <dd className="text-text-primary">{claimable.action_required ?? '—'}</dd>
        </dl>
        {claimable.summary && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-text-secondary">
            {claimable.summary}
          </p>
        )}
      </Card>

      {/* Edit form (editor + admin) */}
      {canEdit && (
        <Card className="mt-6">
          <h2 className="text-sm font-semibold text-text-secondary">Edit Claimable</h2>
          <p className="mt-1 text-xs text-text-muted">
            Edits create a claim_versions revision row (legal-content rule) and are audited. Setting{' '}
            <code>verified_claimable</code> is a manual editorial assertion of the full publication
            pipeline — use only when every requirement is satisfied.
          </p>
          <ActionForm
            action={updateClaimable.bind(null, claimable.id)}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="edit-title">
                  Public title
                </label>
                <input
                  id="edit-title"
                  name="public_title"
                  required
                  defaultValue={claimable.public_title}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-status">
                  Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={claimable.status}
                  className={inputCls}
                >
                  {CLAIMABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-procedural">
                  Procedural status
                </label>
                <select
                  id="edit-procedural"
                  name="procedural_status"
                  defaultValue={claimable.procedural_status}
                  className={inputCls}
                >
                  {PROCEDURAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-deadline">
                  Deadline (ISO)
                </label>
                <input
                  id="edit-deadline"
                  name="deadline"
                  defaultValue={claimable.deadline ?? ''}
                  placeholder="2026-10-31T23:59:59.000Z"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-affected">
                  Affected group
                </label>
                <input
                  id="edit-affected"
                  name="affected_group"
                  defaultValue={claimable.affected_group ?? ''}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="edit-url">
                  Official claim URL
                </label>
                <input
                  id="edit-url"
                  name="official_claim_url"
                  defaultValue={claimable.official_claim_url ?? ''}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-summary">
                Summary
              </label>
              <textarea
                id="edit-summary"
                name="summary"
                rows={3}
                defaultValue={claimable.summary ?? ''}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-relief">
                Relief description
              </label>
              <textarea
                id="edit-relief"
                name="relief_description"
                rows={2}
                defaultValue={claimable.relief_description ?? ''}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-action">
                Action required
              </label>
              <textarea
                id="edit-action"
                name="action_required"
                rows={2}
                defaultValue={claimable.action_required ?? ''}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-reason">
                Change reason (required, recorded in version history)
              </label>
              <input
                id="edit-reason"
                name="change_reason"
                required
                minLength={3}
                className={inputCls}
              />
            </div>
          </ActionForm>
        </Card>
      )}

      {/* Legal reviews */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">
          Legal Reviews <span className="text-text-muted">({legalReviews.length})</span>
        </h2>
        {legalReviews.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No legal reviews recorded.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {legalReviews.map((lr) => (
              <div key={lr.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(lr.decision)}>{lr.decision}</Badge>
                  <span className="text-xs text-text-muted">
                    {lr.profiles?.email ?? 'unknown reviewer'} · {formatDateTime(lr.reviewed_at)}
                  </span>
                </div>
                {lr.findings && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
                    {lr.findings}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {canReviewLegal && (
          <ActionForm
            action={submitLegalReview.bind(null, claimable.id)}
            submitLabel="Record legal review"
            pendingLabel="Recording…"
            className="mt-4 space-y-3 border-t border-border pt-4"
          >
            <div>
              <label className={labelCls} htmlFor="legal-decision">
                Decision
              </label>
              <select id="legal-decision" name="decision" required className={inputCls}>
                {LEGAL_REVIEW_DECISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="legal-findings">
                Findings
              </label>
              <textarea
                id="legal-findings"
                name="findings"
                required
                minLength={3}
                rows={3}
                className={inputCls}
              />
            </div>
          </ActionForm>
        )}
      </Card>

      {/* Review assignments */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">
          Review Assignments <span className="text-text-muted">({assignments.length})</span>
        </h2>
        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No review assignments.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  <span className="text-sm text-text-primary">
                    {a.profiles?.email ?? 'Unassigned'}
                  </span>
                  <span className="text-xs text-text-muted">{formatDateTime(a.assigned_at)}</span>
                  {a.notes && <span className="text-xs text-text-secondary">— {a.notes}</span>}
                </div>
                {canEdit && a.status === 'pending' && (
                  <ActionButton
                    action={completeReviewAssignment.bind(null, a.id)}
                    label="Mark complete"
                    pendingLabel="Completing…"
                    variant="outline"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {canEdit && (
          <ActionForm
            action={assignReview.bind(null, claimable.id)}
            submitLabel="Assign reviewer"
            pendingLabel="Assigning…"
            variant="outline"
            className="mt-4 space-y-3 border-t border-border pt-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="assign-to">
                  Reviewer
                </label>
                <select id="assign-to" name="assigned_to" className={inputCls}>
                  <option value="">Unassigned (pool)</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.email} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="assign-notes">
                  Notes
                </label>
                <input id="assign-notes" name="notes" className={inputCls} />
              </div>
            </div>
          </ActionForm>
        )}
      </Card>

      {/* Corrections & takedowns */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">Corrections & Takedowns</h2>
        {corrections.length === 0 && takedowns.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No open requests for this claimable.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {corrections.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                <span className="text-text-primary">Correction request</span>
                <span className="text-xs text-text-muted">{formatDateTime(c.created_at)}</span>
              </li>
            ))}
            {takedowns.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                <span className="text-text-primary">Takedown request</span>
                <span className="text-xs text-text-muted">{formatDateTime(t.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm">
          <Link href="/admin/corrections" className="text-trust-primary hover:underline">
            Manage in Corrections →
          </Link>
        </p>
      </Card>

      {/* Version history + events */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-text-secondary">
            Version History <span className="text-text-muted">({versions.length})</span>
          </h2>
          {versions.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No revisions recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {versions.map((v) => (
                <li key={v.id} className="rounded-md border border-border bg-background p-3">
                  <p className="font-medium text-text-primary">v{v.version_number}</p>
                  <p className="text-xs text-text-secondary">{v.change_reason ?? 'No reason'}</p>
                  <p className="mt-1 text-xs text-text-muted">{formatDateTime(v.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-text-secondary">
            Publication Events <span className="text-text-muted">({events.length})</span>
          </h2>
          {events.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No publication events.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {events.map((ev) => (
                <li key={ev.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(ev.action.replace('_published', ''))}>
                      {ev.action}
                    </Badge>
                    <span className="text-xs text-text-muted">{formatDateTime(ev.created_at)}</span>
                  </div>
                  {ev.reason && <p className="mt-1 text-xs text-text-secondary">{ev.reason}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
