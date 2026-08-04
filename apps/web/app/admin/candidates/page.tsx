import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';

function statusVariant(status: string): 'info' | 'success' | 'danger' | 'neutral' | 'warning' {
  switch (status) {
    case 'pending':
    case 'running':
      return 'info';
    case 'completed':
    case 'success':
    case 'approved':
    case 'published':
      return 'success';
    case 'failed':
    case 'error':
    case 'rejected':
      return 'danger';
    case 'deferred':
    case 'queued':
      return 'warning';
    default:
      return 'neutral';
  }
}

const PAGE_SIZE = 25;

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;
  const aiFilter = (sp.ai_status as string) ?? '';
  const valFilter = (sp.validation as string) ?? '';
  const pubFilter = (sp.publication as string) ?? '';

  let candidates: Array<{
    id: string;
    keyword_score: number;
    ai_extraction_status: string;
    ai_confidence: number | null;
    validation_status: string;
    publication_decision: string;
    source_document_id: string;
    source_documents: { title: string | null; canonical_url: string } | null;
  }> = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const supabase = getAdminDb();

    let query = supabase
      .from('candidate_documents')
      .select(
        'id, keyword_score, ai_extraction_status, ai_confidence, validation_status, publication_decision, source_document_id, source_documents!inner(title, canonical_url)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (aiFilter) query = query.eq('ai_extraction_status', aiFilter);
    if (valFilter) query = query.eq('validation_status', valFilter);
    if (pubFilter) query = query.eq('publication_decision', pubFilter);

    const { data, error: queryError, count } = await query;

    if (queryError) {
      error = queryError.message;
    } else {
      candidates = (data ?? []) as typeof candidates;
      totalCount = count ?? 0;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load candidates';
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Candidates</h1>
      <p className="mt-1 text-sm text-text-secondary">{totalCount} total</p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">AI Status</label>
          <select
            defaultValue={aiFilter}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-text-primary"
            onChange={undefined}
          >
            <option value="">All</option>
            {['pending', 'completed', 'failed', 'skipped', 'deferred'].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Validation</label>
          <select
            defaultValue={valFilter}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-text-primary"
            onChange={undefined}
          >
            <option value="">All</option>
            {['pending', 'passed', 'failed', 'skipped'].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Publication</label>
          <select
            defaultValue={pubFilter}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-text-primary"
            onChange={undefined}
          >
            <option value="">All</option>
            {['pending', 'approved', 'rejected', 'deferred'].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {candidates.length === 0 && !error ? (
        <p className="mt-6 text-sm text-text-muted">No candidates found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Source Doc</th>
                <th className="pb-2 pr-4 font-medium">Keyword Score</th>
                <th className="pb-2 pr-4 font-medium">AI Status</th>
                <th className="pb-2 pr-4 font-medium">Confidence</th>
                <th className="pb-2 pr-4 font-medium">Validation</th>
                <th className="pb-2 pr-4 font-medium">Publication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((cand) => (
                <tr key={cand.id} className="text-text-primary hover:bg-surface">
                  <td className="py-2 pr-4 max-w-[200px] truncate">
                    <Link
                      href={`/admin/candidates/${cand.id}`}
                      className="text-trust-primary hover:underline"
                    >
                      {cand.source_documents?.title ?? 'Untitled'}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-xs text-text-muted">
                    {cand.source_document_id.slice(0, 8)}…
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/candidates?page=${page - 1}${aiFilter ? `&ai_status=${aiFilter}` : ''}${valFilter ? `&validation=${valFilter}` : ''}${pubFilter ? `&publication=${pubFilter}` : ''}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/candidates?page=${page + 1}${aiFilter ? `&ai_status=${aiFilter}` : ''}${valFilter ? `&validation=${valFilter}` : ''}${pubFilter ? `&publication=${pubFilter}` : ''}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
