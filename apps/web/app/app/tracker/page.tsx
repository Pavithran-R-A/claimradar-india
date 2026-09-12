import { Alert, Card, EmptyState } from '@claimradar/design-system';
import { ClipboardList } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { FREE_TIER_LIMITS } from '@/lib/entitlements';
import { getPublishedClaimableOptions, getTrackers } from '@/lib/user-data';
import { ActionForm } from '@/components/app/action-form';
import { createTracker } from '../actions';
import { TrackerItem } from '../_components/tracker-client';

export const dynamic = 'force-dynamic';

export default async function TrackerPage() {
  const user = await requireAppAuth();

  const [trackers, claimableOptions] = await Promise.all([
    getTrackers(user.id),
    getPublishedClaimableOptions(),
  ]);

  const atLimit = trackers.length >= FREE_TIER_LIMITS.trackers;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Claim tracker</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Track your own progress on claimables you believe you may be affected by. All statuses are
          user-reported — ClaimKhoj never files claims with any company or authority on your behalf.
        </p>
      </div>

      {trackers.unavailable && (
        <Alert variant="warning" title="Tracker temporarily unavailable">
          We could not reach the database. Your tracker entries are safe — try again shortly.
        </Alert>
      )}

      {/* Add to tracker */}
      <Card>
        <h2 className="mb-1 text-base font-semibold text-text-primary">Track a claimable</h2>
        <p className="mb-4 text-xs text-text-muted">
          {trackers.length} of {FREE_TIER_LIMITS.trackers} tracker slots used on the free plan.
        </p>
        {atLimit ? (
          <p className="rounded-md border border-deadline/20 bg-deadline-background p-3 text-sm text-deadline">
            Free plan limit reached. Remove a tracked item to add a different one.
          </p>
        ) : claimableOptions.length === 0 ? (
          <p className="text-sm text-text-muted">
            {trackers.unavailable
              ? 'Directory unavailable right now — try again shortly.'
              : 'No published claimables are available to track yet.'}
          </p>
        ) : (
          <ActionForm action={createTracker} submitLabel="Start tracking" clearOnSuccess>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tracker-claimable"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Claimable
                </label>
                <select
                  id="tracker-claimable"
                  name="claimableId"
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
                >
                  <option value="">Choose a claimable…</option>
                  {claimableOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="tracker-notes"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Private note (optional)
                </label>
                <input
                  id="tracker-notes"
                  name="notes"
                  maxLength={2000}
                  placeholder="Why you think you may be affected"
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
                />
              </div>
            </div>
          </ActionForm>
        )}
      </Card>

      {/* Tracker list */}
      {trackers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-8 w-8" aria-hidden />}
            title="Nothing tracked yet"
            description="Add a claimable above to keep your evidence gathering and follow-ups in one place."
          />
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {trackers.map((tracker) => (
              <TrackerItem key={tracker.id} tracker={tracker} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
