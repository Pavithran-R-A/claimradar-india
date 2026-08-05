import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ALL_STAFF } from '../_lib/roles';
import { PUBLICATION_STATUSES } from '../_lib/constants';
import { ErrorBanner, FilterChips, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

const PAGE_SIZE = 25;

export default async function ClaimablesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRoles(ALL_STAFF);

  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;
  const pubFilter = (sp.publication as string) ?? '';
  const statusFilter = (sp.status as string) ?? '';

  let claimables: Array<{
    id: string;
    public_title: string;
    slug: string;
    status: string;
    publication_status: string;
    deadline: string | null;
    updated_at: string;
    companies: { display_name: string } | null;
  }> = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const db = getAdminDb();

    let query = db
      .from('claimables')
      .select(
        'id, public_title, slug, status, publication_status, deadline, updated_at, companies(display_name)',
        { count: 'exact' },
      )
      .order('updated_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (pubFilter) query = query.eq('publication_status', pubFilter);
    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error: queryError, count } = await query;
    if (queryError) {
      error = queryError.message;
    } else {
      claimables = (data ?? []) as typeof claimables;
      totalCount = count ?? 0;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load claimables';
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function queryFor(nextPage: number): string {
    const params = new URLSearchParams();
    if (pubFilter) params.set('publication', pubFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/claimables?${qs}` : '/admin/claimables';
  }

  return (
    <div>
      <PageHeader
        title="Claimables"
        subtitle={`${totalCount} total — publication approval is always an explicit editorial action`}
      />

      <div className="mt-4 space-y-2">
        <FilterChips
          paramName="publication"
          currentValue={pubFilter}
          options={[
            { value: '', label: 'All publication' },
            ...PUBLICATION_STATUSES.map((v) => ({ value: v, label: v })),
          ]}
          basePath="/admin/claimables"
          extraParams={{ status: statusFilter }}
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {claimables.length === 0 && !error ? (
        <p className="mt-6 text-sm text-text-muted">No claimables found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Company</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Publication</th>
                <th className="pb-2 pr-4 font-medium">Deadline</th>
                <th className="pb-2 pr-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {claimables.map((c) => (
                <tr key={c.id} className="text-text-primary hover:bg-surface">
                  <td className="max-w-[280px] truncate py-2 pr-4">
                    <Link
                      href={`/admin/claimables/${c.id}`}
                      className="text-trust-primary hover:underline"
                    >
                      {c.public_title}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {c.companies?.display_name ?? '—'}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant={statusVariant(c.publication_status)}>
                      {c.publication_status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">{formatDateTime(c.deadline)}</td>
                  <td className="py-2 pr-4 text-text-muted">{formatDateTime(c.updated_at)}</td>
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
