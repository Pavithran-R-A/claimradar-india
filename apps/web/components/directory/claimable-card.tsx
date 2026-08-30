'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, ShieldCheck, Landmark, Users } from 'lucide-react';
import type { PublishedClaimable } from '@/lib/claimables-repository';
import { formatIstDate } from '@/lib/dates';
import { StatusBadge, MetaPill } from './status-badge';
import { cn } from '@claimradar/design-system';

/**
 * Atomic Directory Opportunity Card.
 * Strict visual hierarchy:
 * 1. What is the opportunity? (Title)
 * 2. Who might be affected? (Target group)
 * 3. What is the deadline? (Date / status)
 * 4. Who is the official source? (Regulator / Provenance)
 * 5. What should the user do next? (Action route)
 */
export function ClaimableCard({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  const isClosingSoon = claim.status === 'closing_soon';

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-trust-primary/40 hover:shadow-md">
      <div>
        {/* Top Badges: Status + Sector */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={claim.status} />
          {claim.sector && (
            <MetaPill href={claim.sectorSlug ? `/sectors/${claim.sectorSlug}` : undefined}>
              {claim.sector}
            </MetaPill>
          )}
        </div>

        {/* 1. What is the opportunity? */}
        <h3 className="text-lg font-bold leading-snug text-text-primary group-hover:text-trust-primary transition-colors">
          <Link
            href={`/claimables/${claim.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {claim.title}
          </Link>
        </h3>

        {/* 2. Who might be affected? */}
        {claim.affectedGroup && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-text-secondary">
            <Users className="h-4 w-4 shrink-0 text-text-muted mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <span className="font-semibold text-text-primary">Affected: </span>
              {claim.affectedGroup}
            </p>
          </div>
        )}

        {/* Summary Snippet */}
        {claim.statusExplanation && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
            {claim.statusExplanation}
          </p>
        )}
      </div>

      {/* Footer Metadata & Provenance */}
      <div className="mt-4 pt-3.5 border-t border-border flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          {/* 4. Who is the official source? */}
          <div className="flex items-center gap-1.5 font-medium text-text-secondary">
            <Landmark className="h-3.5 w-3.5 text-trust-primary" />
            <span>{claim.companyName || 'Official Regulator'}</span>
          </div>

          {/* 3. What is the deadline? */}
          {deadline && claim.deadlineDate ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold',
                isClosingSoon ? 'text-amber-800 dark:text-amber-400' : 'text-text-muted',
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <time dateTime={claim.deadlineDate}>{deadline}</time>
            </span>
          ) : (
            <span className="text-[11px] text-text-muted">No deadline</span>
          )}
        </div>

        {/* 5. What next? */}
        <div className="flex items-center justify-between pt-1 text-xs font-bold text-trust-primary">
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verified official source
          </span>
          <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View evidence <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** Editorial Row Variant for search results & closing-soon feeds */
export function ClaimableRow({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  const isClosingSoon = claim.status === 'closing_soon';

  return (
    <article className="group relative rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 hover:border-trust-primary/40 hover:bg-surface-strong/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={claim.status} />
            <span className="text-xs font-medium text-text-secondary">{claim.companyName}</span>
            {claim.sector && (
              <span className="rounded bg-surface-strong px-2 py-0.5 text-[11px] text-text-muted">
                {claim.sector}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-trust-primary transition-colors">
            <Link
              href={`/claimables/${claim.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {claim.title}
            </Link>
          </h3>

          {claim.affectedGroup && (
            <p className="mt-1 line-clamp-1 text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">Affected: </span>
              {claim.affectedGroup}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-border sm:border-t-0 pt-2 sm:pt-0">
          {deadline && claim.deadlineDate ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold',
                isClosingSoon ? 'text-amber-800 dark:text-amber-400' : 'text-text-muted',
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <time dateTime={claim.deadlineDate}>{deadline}</time>
            </span>
          ) : (
            <span className="text-xs text-text-muted">No deadline</span>
          )}

          <span className="inline-flex items-center gap-1 text-xs font-bold text-trust-primary group-hover:translate-x-1 transition-transform">
            View evidence dossier <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
