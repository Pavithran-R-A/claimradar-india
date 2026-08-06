import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import type { PublishedClaimable } from '@/lib/claimables-repository';
import { formatIstDate } from '@/lib/dates';
import { MetaPill, StatusBadge } from './status-badge';

/**
 * The atomic directory card. Fixed structure with reserved metadata rows so
 * hover motion and variable content never shift layout (CLS = 0).
 */
export function ClaimableCard({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);

  return (
    <article className="group relative flex h-full flex-col rounded-card border border-border bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-base ease-lift hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transform-none">
      <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={claim.status} />
        <MetaPill href={claim.sectorSlug ? `/sectors/${claim.sectorSlug}` : undefined}>
          {claim.sector}
        </MetaPill>
      </div>

      <h3 className="text-lg font-semibold leading-snug text-text-primary">
        <Link
          href={`/claimables/${claim.slug}`}
          className="transition-colors duration-fast after:absolute after:inset-0 group-hover:text-trust-primary focus-visible:text-trust-primary"
        >
          {claim.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {claim.statusExplanation}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-text-muted">
        <span className="font-medium text-text-secondary">{claim.companyName}</span>
        {deadline && claim.deadlineDate ? (
          <span
            className={`inline-flex items-center gap-1.5 font-medium ${
              claim.status === 'closing_soon' ? 'text-deadline' : 'text-text-muted'
            }`}
          >
            <CalendarClock aria-hidden className="h-3.5 w-3.5" />
            Deadline: <time dateTime={claim.deadlineDate}>{deadline}</time>
          </span>
        ) : (
          <span>No deadline recorded</span>
        )}
      </div>
    </article>
  );
}

/** Compact row variant for company/sector/deadline listings. */
export function ClaimableRow({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  return (
    <article className="group relative rounded-card border border-border bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-base ease-lift hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transform-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="relative z-10 mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={claim.status} />
            <span className="text-xs text-text-muted">{claim.companyName}</span>
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            <Link
              href={`/claimables/${claim.slug}`}
              className="after:absolute after:inset-0 transition-colors duration-fast group-hover:text-trust-primary"
            >
              {claim.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{claim.affectedGroup}</p>
        </div>
        <div className="relative z-10 flex shrink-0 flex-col items-end gap-2 text-xs">
          {deadline && claim.deadlineDate && (
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                claim.status === 'closing_soon' ? 'text-deadline' : 'text-text-muted'
              }`}
            >
              <CalendarClock aria-hidden className="h-3.5 w-3.5" />
              <time dateTime={claim.deadlineDate}>{deadline}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-trust-primary">
            Details <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
