import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import type { StaffRole } from '@/lib/auth';
import { isStaffRole, requireRoles } from '@/lib/auth';
import { adminNavGroups, ALL_STAFF } from './_lib/roles';

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  legal_reviewer: 'Legal Reviewer',
  researcher: 'Researcher',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRoles(ALL_STAFF);
  const role = isStaffRole(profile.role) ? profile.role : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface">
        <div className="p-4">
          <Link href="/admin" className="block">
            <h2 className="text-lg font-semibold text-text-primary">Admin Panel</h2>
          </Link>
          {role && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
              <span className="truncate text-xs text-text-muted" title={profile.email}>
                {profile.email}
              </span>
            </div>
          )}

          <nav className="mt-4 space-y-4" aria-label="Admin navigation">
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-strong hover:text-text-primary"
            >
              Dashboard
            </Link>
            {adminNavGroups.map((group) => {
              const items = group.items.filter((item) => role && item.roles.includes(role));
              if (items.length === 0) return null;
              return (
                <div key={group.heading}>
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {group.heading}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-strong hover:text-text-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
