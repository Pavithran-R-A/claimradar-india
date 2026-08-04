import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';

function formatDuration(start: string, end: string | null): string {
  if (!end) return 'In progress';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function statusVariant(status: string): 'info' | 'success' | 'danger' | 'neutral' {
  switch (status) {
    case 'running':
      return 'info';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default async function CrawlRunsPage() {
  let runs: Array<{
    id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    sources_attempted: number;
    sources_succeeded: number;
    documents_discovered: number;
    candidates_created: number;
    ai_budget_used: number;
  }> = [];
  let error: string | null = null;

  try {
    const supabase = getAdminDb();
    const { data, error: queryError } = await supabase
      .from('crawl_runs')
      .select(
        'id, status, started_at, completed_at, sources_attempted, sources_succeeded, documents_discovered, candidates_created, ai_budget_used',
      )
      .order('started_at', { ascending: false })
      .limit(50);

    if (queryError) error = queryError.message;
    runs = data ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load crawl runs';
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Crawl Runs</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {runs.length === 0 && !error ? (
        <p className="mt-6 text-sm text-text-muted">No crawl runs found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Started At</th>
                <th className="pb-2 pr-4 font-medium">Duration</th>
                <th className="pb-2 pr-4 font-medium">Sources</th>
                <th className="pb-2 pr-4 font-medium">Docs Discovered</th>
                <th className="pb-2 pr-4 font-medium">Candidates</th>
                <th className="pb-2 pr-4 font-medium">AI Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run) => (
                <tr key={run.id} className="text-text-primary hover:bg-surface">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/crawl-runs/${run.id}`} className="hover:underline">
                      <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    <Link href={`/admin/crawl-runs/${run.id}`} className="hover:underline">
                      {new Date(run.started_at).toLocaleString('en-IN')}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{formatDuration(run.started_at, run.completed_at)}</td>
                  <td className="py-2 pr-4">
                    {run.sources_succeeded}/{run.sources_attempted}
                  </td>
                  <td className="py-2 pr-4">{run.documents_discovered}</td>
                  <td className="py-2 pr-4">{run.candidates_created}</td>
                  <td className="py-2 pr-4">{run.ai_budget_used.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
