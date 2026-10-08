import { Card, Badge } from '@claimradar/design-system';
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

export default async function AdminDashboardPage() {
  let sourcesCount: number | null = null;
  let candidatesCount: number | null = null;
  let claimablesCount: number | null = null;
  let recentRuns: Array<{
    id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
  }> = [];
  let error: string | null = null;

  try {
    const supabase = getAdminDb();

    const [sourcesRes, candidatesRes, crawlRunsRes, claimablesRes] = await Promise.all([
      supabase.from('sources').select('id', { count: 'exact', head: true }).eq('enabled', true),
      supabase
        .from('candidate_documents')
        .select('id', { count: 'exact', head: true })
        .in('publication_decision', ['pending', 'human_review']),
      supabase
        .from('crawl_runs')
        .select('id, status, started_at, completed_at')
        .order('started_at', { ascending: false })
        .limit(5),
      supabase
        .from('claimables')
        .select('id', { count: 'exact', head: true })
        .eq('publication_status', 'draft'),
    ]);

    sourcesCount = sourcesRes.count;
    candidatesCount = candidatesRes.count;
    claimablesCount = claimablesRes.count;
    recentRuns = crawlRunsRes.data ?? [];

    if (sourcesRes.error) error = sourcesRes.error.message;
    if (candidatesRes.error) error = candidatesRes.error.message;
    if (crawlRunsRes.error) error = crawlRunsRes.error.message;
    if (claimablesRes.error) error = claimablesRes.error.message;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to connect to database';
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <div className="mt-6 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="font-semibold">Unable to load dashboard</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Active Sources</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{sourcesCount ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Pending Candidates</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{candidatesCount ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Draft Claimables</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{claimablesCount ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Recent Crawl Runs</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{recentRuns.length}</p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Recent Crawl Runs</h2>
        {recentRuns.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No crawl runs found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Started At</th>
                  <th className="pb-2 pr-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRuns.map((run) => (
                  <tr key={run.id} className="text-text-primary">
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(run.started_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 pr-4">
                      {formatDuration(run.started_at, run.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
