import Link from 'next/link';
import { MatchConfidence } from '@claimradar/shared-types';
import { Alert, Badge, Card, EmptyState } from '@claimradar/design-system';
import { Radar } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { getMatches, type MatchRow } from '@/lib/user-data';
import { MATCH_OUTCOMES } from '@/lib/constants';
import { RefreshMatchesButton } from '../_components/refresh-matches-button';
import { MatchOutcomeBadge, daysUntil, formatDate } from '../_components/badges';

export const dynamic = 'force-dynamic';

function MatchList({ rows }: { rows: MatchRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 pb-5 text-sm text-text-muted">No results in this group yet.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map((match) => {
        const days = daysUntil(match.claimable?.deadline ?? null);
        return (
          <li key={match.id} className="px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={match.claimable ? `/claimables/${match.claimable.slug}` : '#'}
                  className="text-sm font-semibold text-text-primary hover:text-trust-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
                >
                  {match.claimable?.public_title ?? 'Claimable unavailable'}
                </Link>
                <p className="mt-0.5 text-xs text-text-muted">
                  {match.claimable?.company_name ?? 'Unknown company'} · first matched{' '}
                  {formatDate(match.first_matched_at)} · last checked{' '}
                  {formatDate(match.last_checked_at)}
                </p>
                {match.match_reasons.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {match.match_reasons.map((reason) => (
                      <li key={reason.code}>
                        <Badge variant="neutral">{reason.label}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <MatchOutcomeBadge confidence={match.confidence} />
                {days !== null && days >= 0 && days <= 30 && (
                  <Badge variant="deadline">
                    {days === 0 ? 'Deadline today' : `${days} day${days === 1 ? '' : 's'} left`}
                  </Badge>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function MatchesPage() {
  const user = await requireAppAuth();
  const matches = await getMatches(user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Matches</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            Results from the deterministic rule-based matcher — no machine learning, no guesswork
            beyond what your own answers support.
          </p>
        </div>
        <RefreshMatchesButton />
      </div>

      {matches.unavailable && (
        <Alert variant="warning" title="Matching data temporarily unavailable">
          We could not reach the database. Your saved results will reappear once it is back.
        </Alert>
      )}

      {matches.length === 0 && !matches.unavailable ? (
        <Card>
          <EmptyState
            icon={<Radar className="h-8 w-8" aria-hidden />}
            title="No match results yet"
            description="Run a check above, or publish more onboarding detail to improve coverage."
            action={<RefreshMatchesButton label="Run matching now" />}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {MATCH_OUTCOMES.map((outcome) => {
            const rows = matches.filter((m) => m.confidence === outcome.value);
            if (rows.length === 0 && outcome.value === MatchConfidence.NotMatched) {
              return null; // Hide empty "not matched" group to reduce noise.
            }
            return (
              <Card key={outcome.value} className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{outcome.label}</h2>
                    <p className="mt-0.5 text-xs text-text-muted">{outcome.description}</p>
                  </div>
                  <Badge variant="secondary">{rows.length}</Badge>
                </div>
                <MatchList rows={rows} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
