import type { Metadata } from 'next';
import { getPublishedClaimables } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import {
  EmptyDirectoryNotice,
  DemoDataBanner,
  DataUnavailableNotice,
} from '@/components/repository-states';
import { Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Closing Soon — Urgent Claim Deadlines | ClaimKhoj India',
  description:
    'Refund and claim opportunities in India with approaching official submission deadlines.',
  alternates: { canonical: '/closing-soon' },
};

export const dynamic = 'force-dynamic';

export default async function ClosingSoonPage() {
  const outcome = await getPublishedClaimables({ limit: 500 });

  if (!outcome.ok) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <DataUnavailableNotice message={outcome.error} />
      </div>
    );
  }

  const now = Date.now();
  const items = outcome.data.items;

  // Closing soon: has a deadline date in the future, sorted earliest deadline first
  const closingSoon = items
    .filter((c) => c.deadlineDate && Date.parse(c.deadlineDate) >= now)
    .sort((a, b) => Date.parse(a.deadlineDate!) - Date.parse(b.deadlineDate!));

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 rounded border border-deadline/30 bg-deadline-background px-3.5 py-1 text-xs font-bold text-deadline mb-3">
          <Clock className="h-4 w-4" />
          Time-Sensitive Notices
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight">
          Closing Soon
        </h1>
        <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">
          Official claim and refund submission windows with approaching deadlines. Always confirm
          requirements directly on the official portal before filing.
        </p>
      </header>

      {outcome.demo && (
        <div className="mb-6">
          <DemoDataBanner />
        </div>
      )}

      {closingSoon.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Showing <span className="font-semibold text-text-primary">{closingSoon.length}</span>{' '}
            time-sensitive {closingSoon.length === 1 ? 'notice' : 'notices'}
          </p>
          {closingSoon.map((claim) => (
            <ClaimableRow key={claim.id} claim={claim} />
          ))}
        </div>
      ) : (
        <EmptyDirectoryNotice
          title="No active deadlines closing soon"
          body="There are currently no published opportunities with an approaching deadline window in the directory. Check back soon or set up a watchlist alert."
          showActions={true}
        />
      )}
    </div>
  );
}
