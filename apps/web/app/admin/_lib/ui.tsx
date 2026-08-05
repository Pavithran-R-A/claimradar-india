import type { ReactNode } from 'react';

/** Shared presentation helpers for the admin panel. */

export type BadgeVariant = 'info' | 'success' | 'danger' | 'neutral' | 'warning';

export function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'pending':
    case 'running':
    case 'under_review':
    case 'new':
      return 'info';
    case 'completed':
    case 'success':
    case 'approved':
    case 'passed':
    case 'published':
    case 'accepted':
    case 'resolved':
    case 'clear_to_publish':
      return 'success';
    case 'failed':
    case 'error':
    case 'rejected':
    case 'blocked':
    case 'legal_risk':
    case 'granted':
      return 'danger';
    case 'deferred':
    case 'queued':
    case 'skipped':
    case 'needs_changes':
    case 'archived':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function trustVariant(level: string): 'success' | 'info' | 'warning' | 'neutral' {
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

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN');
}

export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/** Convert an arbitrary title into a URL-safe slug. */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger" role="alert">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Horizontal chip-style filter links driven by search params (no client JS). */
export function FilterChips({
  paramName,
  currentValue,
  options,
  basePath,
  extraParams,
}: {
  paramName: string;
  currentValue: string;
  options: { value: string; label: string }[];
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  function hrefFor(value: string): string {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(extraParams ?? {})) {
      if (val) params.set(key, val);
    }
    if (value) params.set(paramName, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filter by ${paramName}`}>
      {options.map((opt) => {
        const active = (currentValue || '') === opt.value;
        return (
          <a
            key={opt.value || 'all'}
            href={hrefFor(opt.value)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'border-trust-primary bg-trust-primary text-white'
                : 'border-border bg-surface text-text-secondary hover:bg-surface-strong hover:text-text-primary'
            }`}
          >
            {opt.label}
          </a>
        );
      })}
    </div>
  );
}
