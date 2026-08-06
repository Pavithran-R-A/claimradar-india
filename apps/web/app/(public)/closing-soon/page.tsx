import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { getPublishedClaimables } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';
import { deadlinePhrase, formatIstDate } from '@/lib/dates';

export const metadata: Metadata = {
  title: 'Closing Soon — Approaching Filing Deadlines | ClaimRadar India',
  description:
    'Published claim records with filing deadlines closing soon. Dates shown in IST; always confirm on the official source.',
  alternates: { canonical: '/closing-soon' },
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function ClosingSoonPage() {
  const outcome = await getPublishedClaimables({ closingSoonOnly: true, limit: 50 });
  const items = outcome.ok
    ? [...outcome.data.items].sort((a, b) => {
        const da = a.deadlineDate ? Date.parse(a.deadlineDate) : Number.MAX_SAFE_INTEGER;
        const db = b.deadlineDate ? Date.parse(b.deadlineDate) : Number.MAX_SAFE_INTEGER;
        return da - db;
      })
    : [];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          <CalendarClock aria-hidden className="h-7 w-7 text-deadline" />
          Closing soon
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Published records whose filing deadlines fall within the next 7 days, soonest first. Dates
          are shown in Indian Standard Time — always confirm the exact cutoff on the official source
          before acting.
        </p>
      </header>

      <div className="mt-8">
        {!outcome.ok ? (
          <DataUnavailableNotice message={outcome.error} />
        ) : (
          <>
            {outcome.demo && <DemoDataBanner />}

            {items.length === 0 ? (
              <EmptyDirectoryNotice
                title="No deadlines closing within 7 days"
                body="There are currently no published records with deadlines closing within the next 7 days. Check the full deadlines schedule for upcoming dates."
              />
            ) : (
              <div className="space-y-3">
                {items.map((claim) => (
                  <div key={claim.id}>
                    {claim.deadlineDate && (
                      <p className="mb-1.5 text-xs font-semibold text-deadline">
                        Deadline{' '}
                        <time dateTime={claim.deadlineDate}>
                          {formatIstDate(claim.deadlineDate)}
                        </time>
                        {deadlinePhrase(claim.deadlineDate) &&
                          ` — ${deadlinePhrase(claim.deadlineDate)}`}
                      </p>
                    )}
                    <ClaimableRow claim={claim} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/deadlines"
          className="inline-flex h-11 items-center rounded-field border border-border bg-surface px-6 text-sm font-semibold text-text-primary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary"
        >
          View full deadline schedule
        </Link>
        <Link
          href="/register"
          className="inline-flex h-11 items-center rounded-field bg-trust-primary px-6 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
        >
          Get closing-soon alerts
        </Link>
      </div>
    </div>
  );
}
