import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ErrorBanner, FilterChips, PageHeader, statusVariant } from '../_lib/ui';
import { ALL_STAFF } from '../_lib/roles';

const PAGE_SIZE = 25;

const AI_OPTIONS = ['', 'pending', 'completed', 'failed', 'skipped', 'deferred'].map((v) => ({
  value: v,
  label: v || 'All AI',
}));
const VALIDATION_OPTIONS = ['', 'pending', 'passed', 'failed', 'skipped'].map((v) => ({
  value: v,
  label: v || 'All validation',
}));
const DECISION_OPTIONS = ['', 'pending', 'approved', 'rejected', 'deferred'].map((v) => ({
  value: v,
  label: v || 'All decisions',
}));

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRoles(ALL_STAFF);

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

  function queryFor(extra: string): string {
    const params = new URLSearchParams();
    if (aiFilter) params.set('ai_status', aiFilter);
    if (valFilter) params.set('validation', valFilter);
    if (pubFilter) params.set('publication', pubFilter);
    if (extra) params.set('page', extra);
    const qs = params.toString();
    return qs ? `/admin/candidates?${qs}` : '/admin/candidates';
  }

  return (
    <div>
      <PageHeader title="Candidates" subtitle={`${totalCount} total`} />

      {/* Filters */}
      <div className="mt-4 space-y-2">
        <FilterChips
          paramName="ai_status"
          currentValue={aiFilter}
          options={AI_OPTIONS}
          basePath="/admin/candidates"
          extraParams={{ validation: valFilter, publication: pubFilter }}
        />
        <FilterChips
          paramName="validation"
          currentValue={valFilter}
          options={VALIDATION_OPTIONS}
          basePath="/admin/candidates"
          extraParams={{ ai_status: aiFilter, publication: pubFilter }}
        />
        <FilterChips
          paramName="publication"
          currentValue={pubFilter}
          options={DECISION_OPTIONS}
          basePath="/admin/candidates"
          extraParams={{ ai_status: aiFilter, validation: valFilter }}
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
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
                <th className="pb-2 pr-4 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((cand) => (
                <tr key={cand.id} className="text-text-primary hover:bg-surface">
                  <td className="max-w-[200px] truncate py-2 pr-4">
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
              href={queryFor(String(page - 1))}
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
              href={queryFor(String(page + 1))}
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
