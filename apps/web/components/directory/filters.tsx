import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { SectorSummary } from '@/lib/claimables-repository';

/* -------------------------------------------------------------------------- */
/*  Shared filter field markup (rendered once per form instance)               */
/* -------------------------------------------------------------------------- */

export interface DirectoryParams {
  search?: string | undefined;
  status?: string | undefined;
  sector?: string | undefined;
  sort?: string | undefined;
}

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closing_soon', label: 'Closing soon' },
  { value: 'under_review', label: 'Under review' },
  { value: 'closed', label: 'Closed' },
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'title', label: 'Title (A–Z)' },
] as const;

const fieldClass =
  'h-11 w-full rounded-field border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-fast focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/30';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted';

/**
 * Pure server-renderable filter fields. `idPrefix` lets the same fields be
 * rendered twice (desktop panel + mobile drawer) without id collisions.
 * The wrapping `<form method="GET">` is provided by the page.
 */
export function FilterFields({
  idPrefix,
  params,
  sectors,
  withSubmit = true,
}: {
  idPrefix: string;
  params: DirectoryParams;
  sectors: SectorSummary[];
  withSubmit?: boolean;
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-search`} className={labelClass}>
          Search
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            id={`${idPrefix}-search`}
            type="search"
            name="search"
            defaultValue={params.search ?? ''}
            placeholder="Company, title or sector…"
            className={`${fieldClass} pl-9`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-status`} className={labelClass}>
          Status
        </label>
        <select
          id={`${idPrefix}-status`}
          name="status"
          defaultValue={params.status ?? ''}
          className={fieldClass}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-sector`} className={labelClass}>
          Sector
        </label>
        <select
          id={`${idPrefix}-sector`}
          name="sector"
          defaultValue={params.sector ?? ''}
          className={fieldClass}
        >
          <option value="">All sectors</option>
          {sectors.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-sort`} className={labelClass}>
          Sort by
        </label>
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          defaultValue={params.sort ?? 'newest'}
          className={fieldClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {withSubmit && (
        <div className="flex items-end">
          <button
            type="submit"
            className="h-11 w-full rounded-field bg-trust-primary px-4 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
          >
            Apply filters
          </button>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Active filter chips                                                        */
/* -------------------------------------------------------------------------- */

function chipHref(current: DirectoryParams, remove: keyof DirectoryParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value && key !== remove && key !== 'page') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/claimables?${qs}` : '/claimables';
}

/** Removable chips summarising active filters — text labels, never colour-only. */
export function ActiveFilterChips({
  params,
  sectors,
}: {
  params: DirectoryParams;
  sectors: SectorSummary[];
}) {
  const chips: { key: keyof DirectoryParams; label: string }[] = [];
  if (params.search) chips.push({ key: 'search', label: `Search: “${params.search}”` });
  if (params.status) {
    const match = STATUS_OPTIONS.find((o) => o.value === params.status);
    if (match) chips.push({ key: 'status', label: `Status: ${match.label}` });
  }
  if (params.sector) {
    const match = sectors.find((s) => s.slug === params.sector);
    chips.push({ key: 'sector', label: `Sector: ${match?.name ?? params.sector}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chipHref(params, chip.key)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-fast hover:border-danger hover:text-danger"
          aria-label={`Remove filter — ${chip.label}`}
        >
          {chip.label}
          <X aria-hidden className="h-3 w-3" />
        </Link>
      ))}
      <Link
        href="/claimables"
        className="text-xs font-semibold text-trust-primary underline-offset-2 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
