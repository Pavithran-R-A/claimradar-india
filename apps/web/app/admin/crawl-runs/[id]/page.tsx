import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import type { CrawlRun, CrawlRunSource, CrawlError, CandidateDocument } from '@claimradar/database';

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
    case 'pending':
      return 'info';
    case 'completed':
    case 'success':
      return 'success';
    case 'failed':
    case 'error':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default async function CrawlRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let run: CrawlRun | null = null;
  let sources: CrawlRunSource[] = [];
  let errors: CrawlError[] = [];
  let candidates: CandidateDocument[] = [];
  let error: string | null = null;

  try {
    const supabase = getAdminDb();

    const [runRes, sourcesRes, errorsRes, candidatesRes] = await Promise.all([
      supabase.from('crawl_runs').select('*').eq('id', id).single(),
      supabase.from('crawl_run_sources').select('*').eq('crawl_run_id', id),
      supabase
        .from('crawl_errors')
        .select('*')
        .eq('crawl_run_id', id)
        .order('occurred_at', { ascending: false }),
      supabase
        .from('candidate_documents')
        .select('*')
        .eq('crawl_run_id', id)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    if (runRes.error) {
      error = runRes.error.message;
    } else {
      run = runRes.data;
    }
    sources = sourcesRes.data ?? [];
    errors = errorsRes.data ?? [];
    candidates = candidatesRes.data ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load crawl run';
  }

  if (error || !run) {
    return (
      <div>
        <Link href="/admin/crawl-runs" className="text-sm text-trust-primary hover:underline">
          &larr; Back to Crawl Runs
        </Link>
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error ?? 'Crawl run not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/crawl-runs" className="text-sm text-trust-primary hover:underline">
        &larr; Back to Crawl Runs
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Crawl Run</h1>
        <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Started</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {new Date(run.started_at).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Duration</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {formatDuration(run.started_at, run.completed_at)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Sources</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {run.sources_succeeded}/{run.sources_attempted} succeeded
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">AI Budget Used</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {run.ai_budget_used.toFixed(4)}
          </p>
        </Card>
      </div>

      {/* Source-by-source breakdown */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Source Breakdown</h2>
        {sources.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No source data available.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Source ID</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Documents Found</th>
                  <th className="pb-2 pr-4 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sources.map((src) => (
                  <tr key={src.id} className="text-text-primary">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/sources/${src.source_id}`}
                        className="text-trust-primary hover:underline"
                      >
                        {src.source_id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(src.status)}>{src.status}</Badge>
                    </td>
                    <td className="py-2 pr-4">{src.documents_found}</td>
                    <td className="py-2 pr-4 text-danger">{src.error_message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Errors */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">
          Errors <span className="text-text-muted">({errors.length})</span>
        </h2>
        {errors.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No errors recorded.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {errors.map((err) => (
              <div key={err.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{err.error_type}</Badge>
                  <span className="text-xs text-text-muted">
                    {new Date(err.occurred_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-primary">{err.error_message}</p>
                {err.url && (
                  <p className="mt-1 text-xs text-text-secondary">
                    URL: <span className="text-text-muted">{err.url}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidates */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">
          Candidates <span className="text-text-muted">({candidates.length})</span>
        </h2>
        {candidates.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No candidates created.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">ID</th>
                  <th className="pb-2 pr-4 font-medium">Keyword Score</th>
                  <th className="pb-2 pr-4 font-medium">AI Status</th>
                  <th className="pb-2 pr-4 font-medium">AI Confidence</th>
                  <th className="pb-2 pr-4 font-medium">Validation</th>
                  <th className="pb-2 pr-4 font-medium">Publication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="text-text-primary hover:bg-surface">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/candidates/${cand.id}`}
                        className="text-trust-primary hover:underline"
                      >
                        {cand.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{cand.keyword_score}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(cand.ai_extraction_status)}>
                        {cand.ai_extraction_status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">{cand.ai_confidence?.toFixed(2) ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(cand.validation_status)}>
                        {cand.validation_status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(cand.publication_decision)}>
                        {cand.publication_decision}
                      </Badge>
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
