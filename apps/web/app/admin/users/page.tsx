import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { updateUserRole } from '../editorial-actions';
import { ActionForm } from '../_components/action-controls';
import { ADMINS_ONLY } from '../_lib/roles';
import { ASSIGNABLE_ROLES } from '../_lib/constants';
import { ErrorBanner, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  subscription_tier: string;
  created_at: string;
}

const PAGE_SIZE = 100;

/** Parse ADMIN_EMAILS (comma-separated) used for bootstrap admin display. */
function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const actor = await requireRoles(ADMINS_ONLY);
  const bootstrapEmails = parseAdminEmails();
  const sp = await searchParams;
  const requestedPage = Number.parseInt(Array.isArray(sp.page) ? sp.page[0] ?? '1' : sp.page ?? '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  let profiles: ProfileRow[] = [];
  let totalProfiles = 0;
  let error: string | null = null;

  try {
    const db = getAdminDb();
    const { data, error: queryError, count } = await db
      .from('profiles')
      .select('id, email, display_name, role, subscription_tier, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (queryError) error = queryError.message;
    else {
      profiles = (data ?? []) as ProfileRow[];
      totalProfiles = count ?? 0;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load users';
  }

  const totalPages = Math.ceil(totalProfiles / PAGE_SIZE);

  const inputCls =
    'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle={`${totalProfiles} profiles: role changes are audited; the last admin can never be demoted`}
      />

      {bootstrapEmails.length > 0 && (
        <div className="mt-4 rounded-lg border border-info/20 bg-info/5 p-3 text-sm text-info">
          Bootstrap admin emails (ADMIN_EMAILS): {bootstrapEmails.join(', ')}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">User</th>
                <th className="pb-2 pr-4 font-medium">Current Role</th>
                <th className="pb-2 pr-4 font-medium">Tier</th>
                <th className="pb-2 pr-4 font-medium">Joined</th>
                <th className="pb-2 pr-4 font-medium">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p) => {
                const isBootstrap = bootstrapEmails.includes(p.email.toLowerCase());
                const isSelf = p.id === actor.id;
                return (
                  <tr key={p.id} className="align-top text-text-primary hover:bg-surface">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{p.display_name ?? p.email}</p>
                      <p className="text-xs text-text-muted">{p.email}</p>
                      {isBootstrap && (
                        <Badge variant="info" className="mt-1">
                          bootstrap admin
                        </Badge>
                      )}
                      {isSelf && (
                        <Badge variant="secondary" className="mt-1">
                          you
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant(p.role)}>{p.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{p.subscription_tier}</td>
                    <td className="py-3 pr-4 text-text-muted">{formatDateTime(p.created_at)}</td>
                    <td className="py-3 pr-4">
                      <ActionForm
                        action={updateUserRole.bind(null, p.id)}
                        submitLabel="Update"
                        pendingLabel="Updating…"
                        variant="outline"
                        className="flex items-start gap-2"
                      >
                        <select
                          name="role"
                          defaultValue={p.role}
                          className={inputCls}
                          aria-label={`Role for ${p.email}`}
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </ActionForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!error && totalPages > 1 ? (
        <nav className="mt-4 flex items-center justify-between" aria-label="User pages">
          {page > 1 ? (
            <Link className="text-sm text-trust-primary hover:underline" href={`/admin/users?page=${page - 1}`}>
              Previous page
            </Link>
          ) : <span />}
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link className="text-sm text-trust-primary hover:underline" href={`/admin/users?page=${page + 1}`}>
              Next page
            </Link>
          ) : <span />}
        </nav>
      ) : null}

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">Role Matrix</h2>
        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
          <li>
            <strong className="text-text-primary">researcher</strong>: view candidates and sources
          </li>
          <li>
            <strong className="text-text-primary">editor</strong>: claim editing, review
            assignments, publication approval, corrections
          </li>
          <li>
            <strong className="text-text-primary">legal_reviewer</strong>: legal reviews and
            takedown decisions
          </li>
          <li>
            <strong className="text-text-primary">admin</strong>: everything, including this page
          </li>
        </ul>
      </Card>
    </div>
  );
}
