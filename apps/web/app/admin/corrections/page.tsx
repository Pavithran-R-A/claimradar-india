import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { resolveCorrection, resolveTakedown } from '../editorial-actions';
import { ActionForm } from '../_components/action-controls';
import { EDITORIAL, EDITORIAL_AND_LEGAL, LEGAL } from '../_lib/roles';
import { ErrorBanner, FilterChips, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

const STATUS_OPTIONS = ['', 'new', 'in_review', 'resolved', 'rejected', 'granted'].map((v) => ({
  value: v,
  label: v || 'All statuses',
}));

interface CorrectionRow {
  id: string;
  description: string;
  reporter_email: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  claimables: { id: string; public_title: string } | null;
}

interface TakedownRow {
  id: string;
  requester_name: string;
  requester_email: string;
  reason: string;
  legal_basis: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  claimables: { id: string; public_title: string } | null;
}

export default async function CorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireRoles(EDITORIAL_AND_LEGAL);
  const isEditorial = EDITORIAL.includes(profile.role as (typeof EDITORIAL)[number]);
  const isLegal = LEGAL.includes(profile.role as (typeof LEGAL)[number]);

  const sp = await searchParams;
  const kind = (sp.kind as string) ?? 'corrections';
  const statusFilter = (sp.status as string) ?? '';

  let corrections: CorrectionRow[] = [];
  let takedowns: TakedownRow[] = [];
  let error: string | null = null;

  try {
    const db = getAdminDb();

    if (kind === 'takedowns') {
      let query = db
        .from('takedown_requests')
        .select(
          'id, requester_name, requester_email, reason, legal_basis, status, resolution, created_at, claimables(id, public_title)',
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (statusFilter) query = query.eq('status', statusFilter);
      const { data, error: queryError } = await query;
      if (queryError) error = queryError.message;
      else takedowns = (data ?? []) as TakedownRow[];
    } else {
      let query = db
        .from('correction_requests')
        .select(
          'id, description, reporter_email, status, resolution, created_at, claimables(id, public_title)',
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (statusFilter) query = query.eq('status', statusFilter);
      const { data, error: queryError } = await query;
      if (queryError) error = queryError.message;
      else corrections = (data ?? []) as CorrectionRow[];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load requests';
  }

  const inputCls =
    'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';

  return (
    <div>
      <PageHeader
        title="Corrections & Takedowns"
        subtitle="Accepted corrections write a revision row and publish a correction notice; granted takedowns archive the claimable."
      />

      <div className="mt-4 space-y-2">
        <FilterChips
          paramName="kind"
          currentValue={kind === 'takedowns' ? 'takedowns' : 'corrections'}
          options={[
            { value: 'corrections', label: 'Correction requests' },
            { value: 'takedowns', label: 'Takedown requests' },
          ]}
          basePath="/admin/corrections"
        />
        <FilterChips
          paramName="status"
          currentValue={statusFilter}
          options={STATUS_OPTIONS}
          basePath="/admin/corrections"
          extraParams={{ kind }}
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && kind !== 'takedowns' && (
        <div className="mt-6 space-y-4">
          {corrections.length === 0 && (
            <p className="text-sm text-text-muted">No correction requests.</p>
          )}
          {corrections.map((c) => (
            <article key={c.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                <span className="text-xs text-text-muted">{formatDateTime(c.created_at)}</span>
                {c.reporter_email && (
                  <span className="text-xs text-text-secondary">from {c.reporter_email}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-text-primary">
                {c.claimables ? (
                  <Link
                    href={`/admin/claimables/${c.claimables.id}`}
                    className="font-medium text-trust-primary hover:underline"
                  >
                    {c.claimables.public_title}
                  </Link>
                ) : (
                  'Unknown claimable'
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">
                {c.description}
              </p>
              {c.resolution && (
                <p className="mt-2 text-xs text-text-muted">Resolution: {c.resolution}</p>
              )}
              {(c.status === 'new' || c.status === 'in_review') && isEditorial && (
                <ActionForm
                  action={resolveCorrection.bind(null, c.id)}
                  submitLabel="Resolve"
                  pendingLabel="Resolving…"
                  className="mt-4 space-y-3 border-t border-border pt-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Decision
                      </label>
                      <select name="decision" required className={inputCls}>
                        <option value="accepted">Accept — apply correction + notice</option>
                        <option value="rejected">Reject correction</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Resolution note
                      </label>
                      <input name="resolution" required minLength={3} className={inputCls} />
                    </div>
                  </div>
                </ActionForm>
              )}
            </article>
          ))}
        </div>
      )}

      {!error && kind === 'takedowns' && (
        <div className="mt-6 space-y-4">
          {takedowns.length === 0 && (
            <p className="text-sm text-text-muted">No takedown requests.</p>
          )}
          {takedowns.map((t) => (
            <article key={t.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                <span className="text-xs text-text-muted">{formatDateTime(t.created_at)}</span>
                <span className="text-xs text-text-secondary">
                  {t.requester_name} &lt;{t.requester_email}&gt;
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-text-primary">
                {t.claimables ? (
                  <Link
                    href={`/admin/claimables/${t.claimables.id}`}
                    className="text-trust-primary hover:underline"
                  >
                    {t.claimables.public_title}
                  </Link>
                ) : (
                  'Unknown claimable'
                )}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{t.reason}</p>
              {t.legal_basis && (
                <p className="mt-1 text-xs text-text-muted">Legal basis: {t.legal_basis}</p>
              )}
              {t.resolution && (
                <p className="mt-2 text-xs text-text-muted">Resolution: {t.resolution}</p>
              )}
              {(t.status === 'new' || t.status === 'in_review') && isLegal && (
                <ActionForm
                  action={resolveTakedown.bind(null, t.id)}
                  submitLabel="Resolve"
                  pendingLabel="Resolving…"
                  className="mt-4 space-y-3 border-t border-border pt-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Decision
                      </label>
                      <select name="decision" required className={inputCls}>
                        <option value="granted">Grant — archive claimable</option>
                        <option value="rejected">Reject takedown</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Resolution note
                      </label>
                      <input name="resolution" required minLength={3} className={inputCls} />
                    </div>
                  </div>
                </ActionForm>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
