import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { Radar } from 'lucide-react';
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

  /* Nav items the signed-in role is allowed to see, flattened for the
     mobile strip and grouped for the desktop sidebar. */
  const visibleGroups = adminNavGroups
    .map((group) => ({
      heading: group.heading,
      items: group.items.filter((item) => role !== null && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
  const flatItems = visibleGroups.flatMap((group) => group.items);

  const navLinkClass =
    'block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary';

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Mobile header + nav strip (< lg) */}
      <header className="border-b border-border bg-surface lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-trust-primary/15">
              <Radar className="h-4 w-4 text-trust-primary" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
          </Link>
          {role && (
            <div className="flex min-w-0 items-center gap-2">
              <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
              <span className="hidden truncate text-xs text-text-muted sm:inline">
                {profile.email}
              </span>
            </div>
          )}
        </div>
        <nav aria-label="Admin navigation" className="overflow-x-auto px-3 pb-2">
          <ul className="flex w-max gap-1">
            <li>
              <Link
                href="/admin"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-strong hover:text-text-primary"
              >
                Dashboard
              </Link>
            </li>
            {flatItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-strong hover:text-text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Desktop sidebar (lg+) */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto p-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-trust-primary/15">
              <Radar className="h-4 w-4 text-trust-primary" aria-hidden />
            </span>
            <span className="text-base font-semibold text-text-primary">Admin Panel</span>
          </Link>
          {role && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
              <span className="truncate text-xs text-text-muted" title={profile.email}>
                {profile.email}
              </span>
            </div>
          )}

          <nav className="mt-4 space-y-4" aria-label="Admin navigation">
            <Link href="/admin" className={navLinkClass}>
              Dashboard
            </Link>
            {visibleGroups.map((group) => (
              <div key={group.heading}>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {group.heading}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className={navLinkClass}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <p className="mt-6 border-t border-border pt-3 text-xs leading-relaxed text-text-muted">
            Every write action on this panel is attributed to your account and recorded in the audit
            log.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
