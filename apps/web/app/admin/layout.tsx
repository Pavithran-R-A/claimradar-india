import Link from 'next/link';
import { requireRole } from '@/lib/auth';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/crawl-runs', label: 'Crawl Runs' },
  { href: '/admin/candidates', label: 'Candidates' },
  { href: '/admin/sources', label: 'Sources' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin');

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-surface">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-text-primary">Admin Panel</h2>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-strong hover:text-text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
