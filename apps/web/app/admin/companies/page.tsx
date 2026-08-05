import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { requireRoles } from '@/lib/auth';
import { ALL_STAFF } from '../_lib/roles';
import { PUBLICATION_STATUSES } from '../_lib/constants';
import { ErrorBanner, FilterChips, PageHeader, statusVariant } from '../_lib/ui';

interface CompanyRow {
  id: string;
  display_name: string;
  legal_name: string | null;
  slug: string;
  official_domain: string | null;
  publication_status: string;
  sectors: { name: string } | null;
}

/**
 * Companies directory with a publication-filtered view of their claimable
 * associations (published / draft / archived counts).
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRoles(ALL_STAFF);

  const sp = await searchParams;
  const pubFilter = (sp.publication as string) ?? 'published';

  let companies: CompanyRow[] = [];
  const associationCounts = new Map<string, number>();
  let error: string | null = null;

  try {
    const db = getAdminDb();

    let query = db
      .from('companies')
      .select(
        'id, display_name, legal_name, slug, official_domain, publication_status, sectors(name)',
      )
      .order('display_name', { ascending: true });

    if (pubFilter) query = query.eq('publication_status', pubFilter);

    const { data, error: queryError } = await query;
    if (queryError) {
      error = queryError.message;
    } else {
      companies = (data ?? []) as CompanyRow[];

      // Association counts for the filtered publication status, grouped client-side.
      const companyIds = companies.map((c) => c.id);
      if (companyIds.length > 0) {
        let claimQuery = db.from('claimables').select('id, company_id');
        if (pubFilter) claimQuery = claimQuery.eq('publication_status', pubFilter);
        const { data: claims, error: claimsError } = await claimQuery.in('company_id', companyIds);
        if (claimsError) {
          error = claimsError.message;
        } else {
          for (const claim of claims ?? []) {
            const key = claim.company_id as string;
            associationCounts.set(key, (associationCounts.get(key) ?? 0) + 1);
          }
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load companies';
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle={`${companies.length} companies — claimable associations filtered by publication status`}
      />

      <div className="mt-4">
        <FilterChips
          paramName="publication"
          currentValue={pubFilter}
          options={[
            { value: '', label: 'All statuses' },
            ...PUBLICATION_STATUSES.map((v) => ({ value: v, label: v })),
          ]}
          basePath="/admin/companies"
        />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {companies.length === 0 && !error ? (
        <p className="mt-6 text-sm text-text-muted">
          No companies with publication status “{pubFilter || 'any'}”.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">Company</th>
                <th className="pb-2 pr-4 font-medium">Sector</th>
                <th className="pb-2 pr-4 font-medium">Domain</th>
                <th className="pb-2 pr-4 font-medium">Publication</th>
                <th className="pb-2 pr-4 font-medium">
                  Claimables {pubFilter ? `(${pubFilter})` : '(all)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companies.map((c) => (
                <tr key={c.id} className="text-text-primary hover:bg-surface">
                  <td className="py-2 pr-4">
                    <p className="font-medium">{c.display_name}</p>
                    {c.legal_name && c.legal_name !== c.display_name && (
                      <p className="text-xs text-text-muted">{c.legal_name}</p>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">{c.sectors?.name ?? '—'}</td>
                  <td className="py-2 pr-4 text-text-secondary">{c.official_domain ?? '—'}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={statusVariant(c.publication_status)}>
                      {c.publication_status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{associationCounts.get(c.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
