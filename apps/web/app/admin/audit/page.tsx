import { Badge } from '@claimradar/design-system';
import Link from 'next/link';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ADMINS_ONLY } from '../_lib/roles';
import { ErrorBanner, FilterChips, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

const PAGE_SIZE = 50;

const ENTITY_OPTIONS = [
  '',
  'claimable',
  'candidate_document',
  'source',
  'profile',
  'correction_request',
  'takedown_request',
  'review_assignment',
].map((v) => ({ value: v, label: v || 'All entities' }));

interface AuditRow {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
}

function summarise(changes: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(changes);
    return json.length > 220 ? `${json.slice(0, 220)}…` : json;
  } catch {
    return '(unserialisable payload)';
  }
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRoles(ADMINS_ONLY);

  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;
  const entityFilter = (sp.entity as string) ?? '';
  const actionFilter = (sp.action as string) ?? '';

  let entries: AuditRow[] = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const db = getAdminDb();
    let query = db
      .from('audit_logs')
      .select('id, actor_id, actor_type, action, entity_type, entity_id, changes, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (entityFilter) query = query.eq('entity_type', entityFilter);
    if (actionFilter) query = query.ilike('action', `%${actionFilter}%`);

    const { data, error: queryError, count } = await query;
    if (queryError) error = queryError.message;
    else {
      entries = (data ?? []) as AuditRow[];
      totalCount = count ?? 0;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load audit log';
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function queryFor(nextPage: number): string {
    const params = new URLSearchParams();
    if (entityFilter) params.set('entity', entityFilter);
    if (actionFilter) params.set('action', actionFilter);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/audit?${qs}` : '/admin/audit';
  }

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={`${totalCount} privileged actions recorded — immutable trail`}
      />

      <div className="mt-4 space-y-3">
        <FilterChips
          paramName="entity"
          currentValue={entityFilter}
          options={ENTITY_OPTIONS}
          basePath="/admin/audit"
          extraParams={{ action: actionFilter }}
        />
        <form method="get" className="flex max-w-sm items-center gap-2">
          {entityFilter && <input type="hidden" name="entity" value={entityFilter} />}
          <label htmlFor="admin-audit-action" className="sr-only">
            Filter by action
          </label>
          <input
            id="admin-audit-action"
            type="search"
            name="action"
            defaultValue={actionFilter}
            placeholder="Filter by action (e.g. claimable.*)"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
          />
          <button
            type="submit"
            className="h-9 rounded-md border border-border px-3 text-sm text-text-secondary hover:bg-surface"
          >
            Apply
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && entries.length === 0 && (
        <p className="mt-6 text-sm text-text-muted">No audit entries match the current filters.</p>
      )}

      {!error && entries.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">When</th>
                <th className="pb-2 pr-4 font-medium">Action</th>
                <th className="pb-2 pr-4 font-medium">Entity</th>
                <th className="pb-2 pr-4 font-medium">Actor</th>
                <th className="pb-2 pr-4 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id} className="align-top text-text-primary hover:bg-surface">
                  <td className="whitespace-nowrap py-2 pr-4 text-text-muted">
                    {formatDateTime(e.created_at)}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant={statusVariant(e.action.split('.')[1] ?? '')}>{e.action}</Badge>
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {e.entity_type}
                    {e.entity_id && (
                      <span className="block text-xs text-text-muted">
                        {e.entity_id.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs text-text-muted">
                    {e.actor_type === 'staff_user' && e.actor_id
                      ? `${e.actor_id.slice(0, 8)}…`
                      : e.actor_type}
                  </td>
                  <td className="max-w-[420px] py-2 pr-4">
                    <code
                      className="block truncate text-xs text-text-secondary"
                      title={JSON.stringify(e.changes)}
                    >
                      {summarise(e.changes)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-2">
          {page > 1 && (
            <Link
              href={queryFor(page - 1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={queryFor(page + 1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
