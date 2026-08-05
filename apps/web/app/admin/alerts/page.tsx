import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ALL_STAFF } from '../_lib/roles';
import { ErrorBanner, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

interface HealthRow {
  id: string;
  source_id: string;
  check_type: string;
  status: string;
  checked_at: string;
  sources: { name: string } | null;
}

interface ErrorRow {
  id: string;
  error_type: string;
  error_message: string;
  url: string | null;
  occurred_at: string;
  sources: { name: string } | null;
}

interface FailingSourceRow {
  id: string;
  name: string;
  failure_count: number;
  last_run_at: string | null;
}

/** Source-health and failure alerts: health events + crawl error aggregates. */
export default async function AlertsPage() {
  await requireRoles(ALL_STAFF);

  let failingSources: FailingSourceRow[] = [];
  let healthEvents: HealthRow[] = [];
  let recentErrors: ErrorRow[] = [];
  let errorsByType: { type: string; count: number }[] = [];
  let error: string | null = null;

  try {
    const db = getAdminDb();

    const [failingRes, healthRes, errorsRes] = await Promise.all([
      db
        .from('sources')
        .select('id, name, failure_count, last_run_at')
        .gt('failure_count', 0)
        .order('failure_count', { ascending: false })
        .limit(20),
      db
        .from('source_health_events')
        .select('id, source_id, check_type, status, checked_at, sources(name)')
        .order('checked_at', { ascending: false })
        .limit(20),
      db
        .from('crawl_errors')
        .select('id, error_type, error_message, url, occurred_at, sources(name)')
        .order('occurred_at', { ascending: false })
        .limit(200),
    ]);

    if (failingRes.error) error = failingRes.error.message;
    else failingSources = (failingRes.data ?? []) as FailingSourceRow[];

    healthEvents = (healthRes.data ?? []) as HealthRow[];
    recentErrors = (errorsRes.data ?? []) as ErrorRow[];

    const counts = new Map<string, number>();
    for (const e of recentErrors) {
      counts.set(e.error_type, (counts.get(e.error_type) ?? 0) + 1);
    }
    errorsByType = Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load alerts';
  }

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Source health failures and crawl error aggregates" />

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {!error && (
        <>
          {/* Failing sources */}
          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-text-secondary">
              Sources With Failures{' '}
              <span className="text-text-muted">({failingSources.length})</span>
            </h2>
            {failingSources.length === 0 ? (
              <p className="mt-2 text-sm text-text-muted">
                No sources currently reporting failures.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {failingSources.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">{s.failure_count} failures</Badge>
                      <Link
                        href={`/admin/sources/${s.id}`}
                        className="text-sm font-medium text-trust-primary hover:underline"
                      >
                        {s.name}
                      </Link>
                    </div>
                    <span className="text-xs text-text-muted">
                      Last run: {formatDateTime(s.last_run_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Error aggregates */}
          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-text-secondary">
              Crawl Errors by Type{' '}
              <span className="text-text-muted">(last {recentErrors.length})</span>
            </h2>
            {errorsByType.length === 0 ? (
              <p className="mt-2 text-sm text-text-muted">No recent crawl errors.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {errorsByType.map((e) => (
                  <span
                    key={e.type}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary"
                  >
                    <span className="font-semibold text-danger">{e.count}</span> {e.type}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Health events */}
            <Card>
              <h2 className="text-sm font-semibold text-text-secondary">
                Recent Health Events{' '}
                <span className="text-text-muted">({healthEvents.length})</span>
              </h2>
              {healthEvents.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No health events recorded.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {healthEvents.map((h) => (
                    <li key={h.id} className="rounded-md border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant(h.status)}>{h.status}</Badge>
                        <span className="text-sm font-medium text-text-primary">
                          {h.sources?.name ?? h.source_id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-text-secondary">{h.check_type}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">{formatDateTime(h.checked_at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Recent crawl errors */}
            <Card>
              <h2 className="text-sm font-semibold text-text-secondary">
                Recent Crawl Errors <span className="text-text-muted">({recentErrors.length})</span>
              </h2>
              {recentErrors.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No recent crawl errors.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentErrors.slice(0, 20).map((e) => (
                    <li key={e.id} className="rounded-md border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="danger">{e.error_type}</Badge>
                        <span className="text-xs text-text-secondary">
                          {e.sources?.name ?? 'unknown source'}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                        {e.error_message}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDateTime(e.occurred_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
