import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { getPublishedClaimables, type PublishedClaimable } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';
import { daysUntil, formatIstDate } from '@/lib/dates';

export const metadata: Metadata = {
  title: 'Filing Deadlines Schedule — ClaimRadar India',
  description:
    'Chronological schedule of official filing deadlines for published claim records. Dates shown in Indian Standard Time.',
  alternates: { canonical: '/deadlines' },
};

// Deadline data comes from the live publication database.
export const dynamic = 'force-dynamic';

interface DeadlineGroup {
  id: string;
  title: string;
  description: string;
  items: PublishedClaimable[];
}

export default async function DeadlinesPage() {
  const outcome = await getPublishedClaimables({ limit: 500 });

  const withDeadlines = outcome.ok
    ? outcome.data.items
        .filter((c) => c.deadlineDate)
        .sort((a, b) => Date.parse(a.deadlineDate!) - Date.parse(b.deadlineDate!))
    : [];

  const now = new Date();
  const inDays = (claim: PublishedClaimable) => daysUntil(claim.deadlineDate!, now) ?? 0;

  const groups: DeadlineGroup[] = [
    {
      id: 'this-week',
      title: 'This week',
      description: 'Deadlines due within the next 7 days.',
      items: withDeadlines.filter((c) => {
        const d = inDays(c);
        return d >= 0 && d <= 7;
      }),
    },
    {
      id: 'this-month',
      title: 'This month',
      description: 'Deadlines due within the next 30 days.',
      items: withDeadlines.filter((c) => {
        const d = inDays(c);
        return d > 7 && d <= 30;
      }),
    },
    {
      id: 'later',
      title: 'Later',
      description: 'Deadlines more than 30 days away.',
      items: withDeadlines.filter((c) => inDays(c) > 30),
    },
    {
      id: 'expired',
      title: 'Expired',
      description: 'Deadlines that have already passed. Records are kept for reference.',
      items: withDeadlines.filter((c) => inDays(c) < 0),
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          <CalendarClock aria-hidden className="h-7 w-7 text-deadline" />
          Deadline schedule
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Every published record with a recorded filing deadline, grouped by how far away it is. All
          dates are in Indian Standard Time and come from the official sources we checked — confirm
          on the official website before relying on any date.
        </p>
      </header>

      <div className="mt-8">
        {!outcome.ok ? (
          <DataUnavailableNotice message={outcome.error} />
        ) : (
          <>
            {outcome.demo && <DemoDataBanner />}

            {withDeadlines.length === 0 ? (
              <EmptyDirectoryNotice
                title="No deadlines scheduled"
                body="There are currently no published records with filing deadlines. Deadlines appear here automatically when published records include them."
              />
            ) : (
              <div className="space-y-12">
                {groups
                  .filter((group) => group.items.length > 0)
                  .map((group) => (
                    <section key={group.id} aria-labelledby={`${group.id}-heading`}>
                      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                        <h2
                          id={`${group.id}-heading`}
                          className="text-xl font-bold tracking-tight text-text-primary"
                        >
                          {group.title}{' '}
                          <span className="font-normal text-text-muted">
                            ({group.items.length})
                          </span>
                        </h2>
                        <p className="text-xs text-text-muted">{group.description}</p>
                      </div>
                      <div className="space-y-3">
                        {group.items.map((claim) => (
                          <div
                            key={claim.id}
                            className={group.id === 'expired' ? 'opacity-70' : undefined}
                          >
                            <p
                              className={`mb-1.5 text-xs font-semibold ${
                                group.id === 'expired' ? 'text-text-muted' : 'text-deadline'
                              }`}
                            >
                              <time dateTime={claim.deadlineDate!}>
                                {formatIstDate(claim.deadlineDate)}
                              </time>
                              {group.id === 'expired' && ' — deadline passed'}
                            </p>
                            <ClaimableRow claim={claim} />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/closing-soon"
          className="inline-flex h-11 items-center rounded-field border border-border bg-surface px-6 text-sm font-semibold text-text-primary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary"
        >
          See what closes within 7 days
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 items-center rounded-field bg-trust-primary px-6 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
        >
          Get deadline reminders
        </Link>
      </div>
    </div>
  );
}
