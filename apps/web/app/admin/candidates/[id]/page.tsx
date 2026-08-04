import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import type {
  CandidateDocument,
  SourceDocument,
  AiRun,
  ValidationResult,
} from '@claimradar/database';

function statusVariant(status: string): 'info' | 'success' | 'danger' | 'neutral' | 'warning' {
  switch (status) {
    case 'pending':
    case 'running':
      return 'info';
    case 'completed':
    case 'success':
    case 'approved':
    case 'passed':
      return 'success';
    case 'failed':
    case 'error':
    case 'rejected':
      return 'danger';
    case 'deferred':
    case 'queued':
    case 'skipped':
      return 'warning';
    default:
      return 'neutral';
  }
}

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let candidate: CandidateDocument | null = null;
  let sourceDoc: SourceDocument | null = null;
  let aiRuns: AiRun[] = [];
  let validations: ValidationResult[] = [];
  let error: string | null = null;

  try {
    const supabase = getAdminDb();

    const candRes = await supabase.from('candidate_documents').select('*').eq('id', id).single();
    if (candRes.error) {
      error = candRes.error.message;
    } else {
      candidate = candRes.data;

      if (candidate) {
        const [srcRes, aiRes, valRes] = await Promise.all([
          supabase
            .from('source_documents')
            .select('*')
            .eq('id', candidate.source_document_id)
            .single(),
          supabase
            .from('ai_runs')
            .select('*')
            .eq('candidate_document_id', id)
            .order('created_at', { ascending: false }),
          supabase
            .from('validation_results')
            .select('*')
            .eq('candidate_document_id', id)
            .order('created_at', { ascending: false }),
        ]);

        sourceDoc = srcRes.data ?? null;
        aiRuns = aiRes.data ?? [];
        validations = valRes.data ?? [];
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load candidate';
  }

  if (error || !candidate) {
    return (
      <div>
        <Link href="/admin/candidates" className="text-sm text-trust-primary hover:underline">
          &larr; Back to Candidates
        </Link>
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error ?? 'Candidate not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/candidates" className="text-sm text-trust-primary hover:underline">
        &larr; Back to Candidates
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Candidate Detail</h1>
        <Badge variant={statusVariant(candidate.publication_decision)}>
          {candidate.publication_decision}
        </Badge>
      </div>

      {/* Source info */}
      {sourceDoc && (
        <Card className="mt-6">
          <h2 className="text-sm font-semibold text-text-secondary">Source Document</h2>
          <p className="mt-2 text-base font-medium text-text-primary">
            {sourceDoc.title ?? 'Untitled'}
          </p>
          <a
            href={sourceDoc.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-trust-primary hover:underline break-all"
          >
            {sourceDoc.canonical_url}
          </a>
          <p className="mt-2 text-xs text-text-muted">
            Retrieved: {new Date(sourceDoc.retrieved_at).toLocaleString('en-IN')}
          </p>
          {sourceDoc.raw_text && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                Raw Text Excerpt
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-background p-3 text-xs text-text-secondary whitespace-pre-wrap">
                {sourceDoc.raw_text.slice(0, 2000)}
                {sourceDoc.raw_text.length > 2000 ? '\n... (truncated)' : ''}
              </pre>
            </details>
          )}
        </Card>
      )}

      {/* AI Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Keyword Score</p>
          <p className="mt-1 text-lg font-bold text-text-primary">{candidate.keyword_score}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">AI Status</p>
          <p className="mt-1">
            <Badge variant={statusVariant(candidate.ai_extraction_status)}>
              {candidate.ai_extraction_status}
            </Badge>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">AI Confidence</p>
          <p className="mt-1 text-lg font-bold text-text-primary">
            {candidate.ai_confidence?.toFixed(2) ?? '—'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Validation</p>
          <p className="mt-1">
            <Badge variant={statusVariant(candidate.validation_status)}>
              {candidate.validation_status}
            </Badge>
          </p>
        </Card>
      </div>

      {/* AI Metadata */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">AI Metadata</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-muted">Provider</dt>
          <dd className="text-text-primary">{candidate.ai_provider ?? '—'}</dd>
          <dt className="text-text-muted">Model</dt>
          <dd className="text-text-primary">{candidate.ai_model ?? '—'}</dd>
          <dt className="text-text-muted">Prompt Version</dt>
          <dd className="text-text-primary">{candidate.ai_prompt_version ?? '—'}</dd>
          <dt className="text-text-muted">Schema Version</dt>
          <dd className="text-text-primary">{candidate.ai_schema_version ?? '—'}</dd>
          <dt className="text-text-muted">Duration</dt>
          <dd className="text-text-primary">
            {candidate.ai_duration_ms ? `${candidate.ai_duration_ms}ms` : '—'}
          </dd>
          <dt className="text-text-muted">Tokens</dt>
          <dd className="text-text-primary">{candidate.ai_token_count ?? '—'}</dd>
          <dt className="text-text-muted">Retry Count</dt>
          <dd className="text-text-primary">{candidate.ai_retry_count}</dd>
          <dt className="text-text-muted">Error Category</dt>
          <dd className="text-text-primary">{candidate.ai_error_category ?? '—'}</dd>
        </dl>
      </Card>

      {/* AI Extracted Data */}
      {candidate.ai_extracted_data && (
        <Card className="mt-6">
          <h2 className="text-sm font-semibold text-text-secondary">AI Extracted Data</h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-background p-3 text-xs text-text-secondary whitespace-pre-wrap">
            {JSON.stringify(candidate.ai_extracted_data, null, 2)}
          </pre>
        </Card>
      )}

      {/* AI Raw Output (collapsible) */}
      {candidate.ai_raw_output && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-semibold text-text-secondary hover:text-text-primary">
            AI Raw Output (click to expand)
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-border bg-surface p-3 text-xs text-text-secondary whitespace-pre-wrap">
            {JSON.stringify(candidate.ai_raw_output, null, 2)}
          </pre>
        </details>
      )}

      {/* AI Runs */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">
          AI Runs <span className="text-text-muted">({aiRuns.length})</span>
        </h2>
        {aiRuns.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No AI runs recorded.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Pass</th>
                  <th className="pb-2 pr-4 font-medium">Provider</th>
                  <th className="pb-2 pr-4 font-medium">Model</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Tokens</th>
                  <th className="pb-2 pr-4 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {aiRuns.map((run) => (
                  <tr key={run.id} className="text-text-primary">
                    <td className="py-2 pr-4">{run.pass_number}</td>
                    <td className="py-2 pr-4">{run.provider}</td>
                    <td className="py-2 pr-4">{run.model}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(run.result_status)}>{run.result_status}</Badge>
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

      {/* Validation Results */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">
          Validation Results <span className="text-text-muted">({validations.length})</span>
        </h2>
        {validations.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No validation results.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {validations.map((val) => (
              <div key={val.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={val.passed ? 'success' : 'danger'}>
                    {val.passed ? 'Passed' : 'Failed'}
                  </Badge>
                  <span className="text-sm font-medium text-text-primary">
                    {val.validator_name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(val.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                {Object.keys(val.details).length > 0 && (
                  <pre className="mt-2 text-xs text-text-secondary whitespace-pre-wrap">
                    {JSON.stringify(val.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
