import Link from 'next/link';
import { Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import { ToggleSourceButton } from './toggle-source-button';

function trustVariant(level: string): 'success' | 'info' | 'warning' | 'neutral' {
  switch (level) {
    case 'official':
      return 'success';
    case 'reputable':
      return 'info';
    case 'community':
      return 'warning';
    default:
      return 'neutral';
  }
}

export default async function SourcesPage() {
  let sources: Array<{
    id: string;
    name: string;
    domain: string;
    source_type: string;
    trust_level: string;
    enabled: boolean;
    last_run_at: string | null;
    last_success_at: string | null;
    failure_count: number;
  }> = [];
  let error: string | null = null;

  try {
    const supabase = getAdminDb();
    const { data, error: queryError } = await supabase
      .from('sources')
      .select(
        'id, name, domain, source_type, trust_level, enabled, last_run_at, last_success_at, failure_count',
      )
      .order('name', { ascending: true });

    if (queryError) error = queryError.message;
    sources = data ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load sources';
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Sources</h1>
      <p className="mt-1 text-sm text-text-secondary">{sources.length} total</p>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {sources.length === 0 && !error ? (
        <p className="mt-6 text-sm text-text-muted">No sources configured.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Domain</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Trust Level</th>
                <th className="pb-2 pr-4 font-medium">Enabled</th>
                <th className="pb-2 pr-4 font-medium">Last Run</th>
                <th className="pb-2 pr-4 font-medium">Failures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((src) => (
                <tr key={src.id} className="text-text-primary hover:bg-surface">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/sources/${src.id}`}
                      className="text-trust-primary hover:underline font-medium"
                    >
                      {src.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">{src.domain}</td>
                  <td className="py-2 pr-4 text-text-secondary">{src.source_type}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={trustVariant(src.trust_level)}>{src.trust_level}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <ToggleSourceButton sourceId={src.id} enabled={src.enabled} />
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {src.last_run_at ? new Date(src.last_run_at).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={src.failure_count > 0 ? 'text-danger' : 'text-text-muted'}>
                      {src.failure_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
