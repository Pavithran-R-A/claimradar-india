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
 * 1. Status & Sector taxonomy
 * 2. Title / Opportunity summary
 * 3. Affected group qualification
 * 4. Official source / Authority attribution
 * 5. Deadline & verified action route
 */
export function ClaimableCard({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  const isClosingSoon = claim.status === 'closing_soon';

  return (
    <article className="card-hover-lift group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-150 hover:border-trust-primary/40 hover:shadow-lift">
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
          <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary">
            <Users className="h-4 w-4 shrink-0 text-trust-primary mt-0.5" />
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
      <div className="mt-5 pt-3.5 border-t border-border flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          {/* Official Authority Source */}
          <div className="flex items-center gap-1.5 font-medium text-text-secondary">
            <Landmark className="h-3.5 w-3.5 text-trust-primary" />
            <span className="truncate max-w-[160px]">
              {claim.companyName || 'Official Regulator'}
            </span>
          </div>

          {/* Deadline */}
          {deadline && claim.deadlineDate ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold',
                isClosingSoon ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-text-muted',
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <time dateTime={claim.deadlineDate}>{deadline}</time>
            </span>
          ) : (
            <span className="text-xs text-text-muted">No deadline</span>
          )}
        </div>

        {/* Action Route */}
        <div className="flex items-center justify-between pt-1 text-xs font-bold text-trust-primary">
          <span className="inline-flex items-center gap-1 text-xs text-text-muted font-normal">
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
    <article className="card-hover-lift group relative rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-150 hover:border-trust-primary/40 hover:bg-surface-strong/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={claim.status} />
            <span className="text-xs font-semibold text-text-secondary">{claim.companyName}</span>
            {claim.sector && (
              <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-xs text-text-muted border border-border">
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
                isClosingSoon ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-text-muted',
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
