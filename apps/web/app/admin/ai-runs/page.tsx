import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ALL_STAFF } from '../_lib/roles';
import { ErrorBanner, PageHeader, formatDateTime, statusVariant } from '../_lib/ui';

interface AiRunRow {
  id: string;
  candidate_document_id: string;
  pass_number: number;
  provider: string;
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number | null;
  result_status: string;
  error_category: string | null;
  created_at: string;
}

/** AI run viewer with budget usage (AI_DAILY_REQUEST_BUDGET from env). */
export default async function AiRunsPage() {
  await requireRoles(ALL_STAFF);

  let runs: AiRunRow[] = [];
  let totalRuns = 0;
  let todayRuns = 0;
  let totalTokens = 0;
  let failedRuns = 0;
  let runsError: string | null = null;
  let countError: string | null = null;
  let todayError: string | null = null;

  const dailyBudgetRaw = process.env.AI_DAILY_REQUEST_BUDGET;
  const dailyBudget = dailyBudgetRaw ? Number.parseInt(dailyBudgetRaw, 10) : null;

  try {
    const db = getAdminDb();

    const [runsRes, countRes, todayRes] = await Promise.all([
      db
        .from('ai_runs')
        .select(
          'id, candidate_document_id, pass_number, provider, model, input_tokens, output_tokens, duration_ms, result_status, error_category, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(50),
      db.from('ai_runs').select('id', { count: 'exact', head: true }),
      db
        .from('ai_runs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()),
    ]);

    if (runsRes.error) runsError = 'AI run details are unavailable.';
    else runs = (runsRes.data ?? []) as AiRunRow[];

    if (countRes.error) countError = 'Total run count is unavailable.';
    else totalRuns = countRes.count ?? 0;
    if (todayRes.error) todayError = 'Today’s run count is unavailable.';
    else todayRuns = todayRes.count ?? 0;
    totalTokens = runs.reduce((sum, r) => sum + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0);
    failedRuns = runs.filter((r) => r.result_status !== 'success').length;
  } catch {
    runsError = 'AI run details are unavailable.';
    countError = 'Total run count is unavailable.';
    todayError = 'Today’s run count is unavailable.';
  }

  const budgetPct =
    dailyBudget && dailyBudget > 0
      ? Math.min(100, Math.round((todayRuns / dailyBudget) * 100))
      : null;

  return (
    <div>
      <PageHeader
        title="AI Runs"
        subtitle="Per-invocation log of extraction and second-pass AI calls"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Total Runs</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {countError ? 'Unavailable' : totalRuns}
          </p>
          {countError && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {countError}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Today (UTC)</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {todayError ? 'Unavailable' : todayRuns}
          </p>
          {todayError && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {todayError}
            </p>
          )}
          {dailyBudget !== null && !Number.isNaN(dailyBudget) && (
            <p className="mt-1 text-xs text-text-muted">
              Budget: {dailyBudget} requests/day
              {todayError ? ': unavailable' : budgetPct !== null ? `: ${budgetPct}% used` : ''}
            </p>
          )}
          {!todayError &&
            dailyBudget !== null &&
            !Number.isNaN(dailyBudget) &&
            budgetPct !== null && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                <div
                  className={`h-full rounded-full ${budgetPct >= 90 ? 'bg-danger' : 'bg-trust-primary'}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            )}
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Tokens (last 50 runs)</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {runsError ? 'Unavailable' : totalTokens.toLocaleString('en-IN')}
          </p>
          {runsError && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {runsError}
            </p>
          )}
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Non-success (last 50)</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {runsError ? 'Unavailable' : failedRuns}
          </p>
          {runsError && (
            <p role="alert" className="mt-2 text-xs text-danger">
              {runsError}
            </p>
          )}
        </Card>
      </div>

      {runsError ? (
        <div className="mt-6">
          <ErrorBanner message={runsError} />
        </div>
      ) : runs.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No AI runs recorded.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">When</th>
                <th className="pb-2 pr-4 font-medium">Candidate</th>
                <th className="pb-2 pr-4 font-medium">Pass</th>
                <th className="pb-2 pr-4 font-medium">Provider / Model</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Tokens</th>
                <th className="pb-2 pr-4 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run) => (
                <tr key={run.id} className="text-text-primary hover:bg-surface">
                  <td className="py-2 pr-4 text-text-muted">{formatDateTime(run.created_at)}</td>
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/candidates/${run.candidate_document_id}`}
                      className="text-trust-primary hover:underline"
                    >
                      {run.candidate_document_id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{run.pass_number}</td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {run.provider} / {run.model}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(run.result_status)}>{run.result_status}</Badge>
                      {run.error_category && (
                        <span className="text-xs text-text-muted">{run.error_category}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    {(run.input_tokens ?? 0) + (run.output_tokens ?? 0)}
                  </td>
                  <td className="py-2 pr-4">{run.duration_ms ? `${run.duration_ms}ms` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
