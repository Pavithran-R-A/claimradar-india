import Link from 'next/link';
import { MatchConfidence } from '@claimradar/shared-types';
import { Alert, Badge, Card, EmptyState } from '@claimradar/design-system';
import {
  BellRing,
  Building2,
  CircleCheck,
  ClipboardList,
  Layers,
  Newspaper,
  Radar,
  Settings,
  Sparkles,
} from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import {
  getMatches,
  getNotifications,
  getOnboarding,
  getRecentlyChangedClaimables,
  getTrackers,
  getWatchlist,
} from '@/lib/user-data';
import {
  MatchOutcomeBadge,
  TrackerStatusBadge,
  formatDate,
  isClosingSoon,
} from './_components/badges';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireAppAuth();

  const [matches, watchlist, trackers, recentChanges, notifications, onboarding] =
    await Promise.all([
      getMatches(user.id),
      getWatchlist(user.id),
      getTrackers(user.id),
      getRecentlyChangedClaimables(5),
      getNotifications(user.id),
      getOnboarding(user.id),
    ]);

  const dbUnavailable = matches.unavailable && watchlist.unavailable && trackers.unavailable;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newMatches = matches.filter(
    (m) =>
      new Date(m.first_matched_at).getTime() >= sevenDaysAgo &&
      m.confidence !== MatchConfidence.NotMatched,
  );
  const verifiedMatches = matches.filter(
    (m) => m.confidence === MatchConfidence.StrongPotentialMatch,
  );
  const closingSoon = matches.filter((m) => isClosingSoon(m.claimable?.deadline ?? null));
  const unreadNotifications = notifications.filter((n) => !n.read_at).length;
  const setupAnswersProvided = onboarding
    ? [
        onboarding.companies_used.length > 0,
        onboarding.sectors_used.length > 0,
        onboarding.state !== null,
        onboarding.purchase_period_start !== null || onboarding.purchase_period_end !== null,
      ].filter(Boolean).length
    : 0;

  const stats = [
    {
      label: 'New matches (7 days)',
      value: newMatches.length,
      icon: <Sparkles className="h-5 w-5 text-trust-primary" aria-hidden />,
      href: '/app/matches',
    },
    {
      label: 'Strong potential matches',
      value: verifiedMatches.length,
      icon: <Radar className="h-5 w-5 text-success" aria-hidden />,
      href: '/app/matches',
    },
    {
      label: 'Closing within 14 days',
      value: closingSoon.length,
      icon: <BellRing className="h-5 w-5 text-deadline" aria-hidden />,
      href: '/app/matches',
    },
    {
      label: 'Companies watched',
      value: watchlist.companies.length,
      icon: <Building2 className="h-5 w-5 text-info" aria-hidden />,
      href: '/app/watchlist',
    },
    {
      label: 'Claims tracked',
      value: trackers.length,
      icon: <ClipboardList className="h-5 w-5 text-info" aria-hidden />,
      href: '/app/tracker',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          What changed across your matches, watchlists and tracked claims.
        </p>
      </div>

      {dbUnavailable && (
        <Alert variant="warning" title="Data temporarily unavailable">
          We could not reach the database just now. Nothing below is stale on purpose — please check
          back shortly.
        </Alert>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-trust-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
          >
            <div className="mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Matches snapshot */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Latest matches</h2>
            <Link
              href="/app/matches"
              className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              View all
            </Link>
          </div>
          {matches.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<Radar className="h-8 w-8" aria-hidden />}
              title="No matches yet"
              description="Matches appear here after your profile is compared against published claimables."
            />
          ) : (
            <ul className="divide-y divide-border">
              {matches.slice(0, 4).map((match) => (
                <li key={match.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={match.claimable ? `/claimables/${match.claimable.slug}` : '#'}
                      className="block truncate text-sm font-medium text-text-primary hover:text-trust-primary"
                    >
                      {match.claimable?.public_title ?? 'Claimable unavailable'}
                    </Link>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {match.claimable?.company_name ?? 'Unknown company'} · first seen{' '}
                      {formatDate(match.first_matched_at)}
                    </p>
                  </div>
                  <MatchOutcomeBadge confidence={match.confidence} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Tracked claims snapshot */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Tracked claims</h2>
            <Link
              href="/app/tracker"
              className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              View all
            </Link>
          </div>
          {trackers.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<ClipboardList className="h-8 w-8" aria-hidden />}
              title="Nothing tracked yet"
              description="Track a claimable to follow your own progress through its lifecycle."
            />
          ) : (
            <ul className="divide-y divide-border">
              {trackers.slice(0, 4).map((tracker) => (
                <li key={tracker.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={tracker.claimable ? `/claimables/${tracker.claimable.slug}` : '#'}
                      className="block truncate text-sm font-medium text-text-primary hover:text-trust-primary"
                    >
                      {tracker.claimable?.public_title ?? 'Claimable unavailable'}
                    </Link>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Updated {formatDate(tracker.updated_at)}
                    </p>
                  </div>
                  <TrackerStatusBadge status={tracker.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Watchlist snapshot (companies + sectors) */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Watchlist</h2>
            <Link
              href="/app/watchlist"
              className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              Manage
            </Link>
          </div>
          {watchlist.companies.length === 0 && watchlist.sectors.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<Building2 className="h-8 w-8" aria-hidden />}
              title="Nothing watched yet"
              description="Watch companies and sectors you have bought from and we will surface anything new involving them."
            />
          ) : (
            <div className="space-y-4">
              {watchlist.companies.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                    <Building2 className="h-3.5 w-3.5" aria-hidden />
                    Companies
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {watchlist.companies.map((company) => (
                      <li key={company.id}>
                        <Link
                          href={company.slug ? `/companies/${company.slug}` : '/companies'}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
                        >
                          <Badge variant="secondary">{company.display_name}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {watchlist.sectors.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                    <Layers className="h-3.5 w-3.5" aria-hidden />
                    Sectors
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {watchlist.sectors.map((sector) => (
                      <li key={sector.id}>
                        <Link
                          href={sector.slug ? `/sectors/${sector.slug}` : '/sectors'}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
                        >
                          <Badge variant="neutral">{sector.name}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Notification summary */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Notifications</h2>
            <Link
              href="/app/notifications"
              className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              View all
            </Link>
          </div>
          {notifications.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<BellRing className="h-8 w-8" aria-hidden />}
              title="No notifications yet"
              description="Match alerts and deadline reminders will appear here."
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-text-secondary">
                {unreadNotifications > 0 ? (
                  <>
                    <span className="font-semibold text-text-primary">{unreadNotifications}</span>{' '}
                    unread notification{unreadNotifications === 1 ? '' : 's'}
                  </>
                ) : (
                  'You are all caught up.'
                )}
              </p>
              <ul className="divide-y divide-border">
                {notifications.slice(0, 3).map((notification) => (
                  <li key={notification.id} className="flex items-start gap-2.5 py-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        notification.read_at ? 'bg-border' : 'bg-trust-primary'
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {formatDate(notification.created_at)}
                        {!notification.read_at && <span className="sr-only"> (unread)</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        {/* Setup progress */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Your setup</h2>
            <Link
              href="/app/profile"
              className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              Review profile
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">Account setup complete</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {onboarding
                  ? `${setupAnswersProvided} of 4 matching dimensions provided · ${onboarding.companies_used.length} compan${onboarding.companies_used.length === 1 ? 'y' : 'ies'} · ${onboarding.sectors_used.length} sector${onboarding.sectors_used.length === 1 ? '' : 's'}`
                  : 'Your setup answers could not be loaded right now.'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Matching uses only the low-risk answers you gave. Manage them under{' '}
                <Link href="/app/profile" className="text-trust-primary hover:underline">
                  Profile
                </Link>{' '}
                or the{' '}
                <Link href="/app/privacy" className="text-trust-primary hover:underline">
                  Privacy center
                </Link>
                .
              </p>
            </div>
          </div>
        </Card>

        {/* Recent source changes */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Recent source changes</h2>
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-1 text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              <Settings className="h-3.5 w-3.5" aria-hidden />
              Notification settings
            </Link>
          </div>
          {recentChanges.length === 0 ? (
            <EmptyState
              className="py-8"
              icon={<Newspaper className="h-8 w-8" aria-hidden />}
              title={recentChanges.unavailable ? 'Sources unavailable' : 'No recent changes'}
              description={
                recentChanges.unavailable
                  ? 'We could not reach the sources right now. Try again shortly.'
                  : 'When published claimables change, the latest updates will appear here.'
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentChanges.map((item) => (
                <li key={item.id} className="py-3">
                  <Link
                    href={`/claimables/${item.slug}`}
                    className="block text-sm font-medium text-text-primary hover:text-trust-primary"
                  >
                    {item.public_title}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {item.company_name ?? 'Unknown company'}
                    {item.deadline ? ` · deadline ${formatDate(item.deadline)}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
