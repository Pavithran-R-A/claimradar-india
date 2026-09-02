'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Bookmark,
  Compass,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { cn, BrandMark } from '@claimradar/design-system';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/app/matches', label: 'Matches', icon: Compass },
  { href: '/app/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/app/tracker', label: 'Tracker', icon: ListChecks },
  { href: '/app/notifications', label: 'Notifications', icon: Bell },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/settings', label: 'Settings', icon: Settings },
  { href: '/app/privacy', label: 'Privacy center', icon: Shield },
];

interface AppSidebarProps {
  siteName: string;
  unreadNotifications: number;
}

export function AppSidebar({ siteName, unreadNotifications }: AppSidebarProps) {
  const pathname = usePathname();

  const links = NAV_ITEMS.map((item) => {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary',
          active
            ? 'bg-trust-primary/10 text-trust-primary'
            : 'text-text-secondary hover:bg-surface hover:text-text-primary',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.href === '/app/notifications' && unreadNotifications > 0 && (
          <span className="rounded-full bg-deadline-background px-2 py-0.5 text-xs font-semibold text-deadline">
            {unreadNotifications}
          </span>
        )}
      </Link>
    );
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background-elevated lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <BrandMark size={28} variant="default" animated={false} />
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-text-primary">{siteName}</p>
            <p className="text-xs font-medium text-text-muted">Personal Workspace</p>
          </div>
        </div>
        <nav aria-label="Product navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
          {links}
        </nav>
        <div className="border-t border-border p-3 text-xs text-text-muted">
          Free plan · deterministic matching
        </div>
      </aside>

      {/* Mobile horizontal nav */}
      <nav
        aria-label="Product navigation"
        className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-background-elevated px-3 py-2 lg:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-trust-primary/15 text-trust-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
