import Link from 'next/link';
import { Card, Badge } from '@claimradar/design-system';
import { getAdminDb } from '@/lib/admin-db';
import type { Source, SourceHealthEvent } from '@claimradar/database';

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

function healthVariant(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  switch (status) {
    case 'healthy':
    case 'ok':
    case 'success':
      return 'success';
    case 'error':
    case 'failed':
      return 'danger';
    case 'degraded':
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}

export default async function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let source: Source | null = null;
  let healthEvents: SourceHealthEvent[] = [];
  let documentCount: number | null = null;
  let error: string | null = null;

  try {
    const supabase = getAdminDb();

    const [sourceRes, healthRes, docCountRes] = await Promise.all([
      supabase.from('sources').select('*').eq('id', id).single(),
      supabase
        .from('source_health_events')
        .select('*')
        .eq('source_id', id)
        .order('checked_at', { ascending: false })
        .limit(10),
      supabase
        .from('source_documents')
        .select('id', { count: 'exact', head: true })
        .eq('source_id', id),
    ]);

    if (sourceRes.error) {
      error = sourceRes.error.message;
    } else {
      source = sourceRes.data;
    }
    healthEvents = healthRes.data ?? [];
    documentCount = docCountRes.count;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load source';
  }

  if (error || !source) {
    return (
      <div>
        <Link href="/admin/sources" className="text-sm text-trust-primary hover:underline">
          &larr; Back to Sources
        </Link>
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          <p className="text-sm">{error ?? 'Source not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/sources" className="text-sm text-trust-primary hover:underline">
        &larr; Back to Sources
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text-primary">{source.name}</h1>
        <Badge variant={trustVariant(source.trust_level)}>{source.trust_level}</Badge>
        <Badge variant={source.enabled ? 'success' : 'neutral'}>
          {source.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      {/* Source Config */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">Domain</p>
          <p className="mt-1 text-base font-medium text-text-primary">{source.domain}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Source Type</p>
          <p className="mt-1 text-base font-medium text-text-primary">{source.source_type}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Adapter</p>
          <p className="mt-1 text-base font-medium text-text-primary">{source.adapter_name}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Fetch Frequency</p>
          <p className="mt-1 text-base font-medium text-text-primary">
            Every {source.fetch_frequency_hours}h
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Rate Limit</p>
          <p className="mt-1 text-base font-medium text-text-primary">
            {source.rate_limit_per_minute}/min
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Documents</p>
          <p className="mt-1 text-base font-medium text-text-primary">{documentCount ?? '—'}</p>
        </Card>
      </div>

      {/* Additional Details */}
      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary">Configuration</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-muted">Base URL</dt>
          <dd className="text-text-primary break-all">{source.base_url ?? '—'}</dd>
          <dt className="text-text-muted">Last Run</dt>
          <dd className="text-text-primary">
            {source.last_run_at ? new Date(source.last_run_at).toLocaleString('en-IN') : 'Never'}
          </dd>
          <dt className="text-text-muted">Last Success</dt>
          <dd className="text-text-primary">
            {source.last_success_at
              ? new Date(source.last_success_at).toLocaleString('en-IN')
              : 'Never'}
          </dd>
          <dt className="text-text-muted">Failure Count</dt>
          <dd className={source.failure_count > 0 ? 'text-danger' : 'text-text-primary'}>
            {source.failure_count}
          </dd>
          <dt className="text-text-muted">Robots Checked</dt>
          <dd className="text-text-primary">
            {source.robots_checked_at
              ? new Date(source.robots_checked_at).toLocaleString('en-IN')
              : 'Never'}
          </dd>
          <dt className="text-text-muted">Terms Checked</dt>
          <dd className="text-text-primary">
            {source.terms_checked_at
              ? new Date(source.terms_checked_at).toLocaleString('en-IN')
              : 'Never'}
          </dd>
        </dl>
      </Card>

      {/* Health History Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">
          Health History <span className="text-text-muted">(last 10 events)</span>
        </h2>
        {healthEvents.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No health events recorded.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {healthEvents.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      event.status === 'healthy' ||
                      event.status === 'ok' ||
                      event.status === 'success'
                        ? 'bg-success'
                        : event.status === 'error' || event.status === 'failed'
                          ? 'bg-danger'
                          : 'bg-surface-strong'
                    }`}
                  />
                  <div className="w-px flex-1 bg-border" />
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={healthVariant(event.status)}>{event.status}</Badge>
                    <span className="text-sm font-medium text-text-primary">
                      {event.check_type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(event.checked_at).toLocaleString('en-IN')}
                  </p>
                  {Object.keys(event.details).length > 0 && (
                    <pre className="mt-2 text-xs text-text-secondary whitespace-pre-wrap">
                      {JSON.stringify(event.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
