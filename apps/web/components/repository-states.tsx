'use client';

import * as React from 'react';
import Link from 'next/link';
import { TriangleAlert, Eye, FileText } from 'lucide-react';
import { cn, buttonVariants } from '@claimradar/design-system';
import { brandConfig } from '@claimradar/config';

export function DemoDataBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-md border border-deadline/30 bg-deadline-background p-4 text-sm text-text-primary"
    >
      <p className="flex items-center gap-2 font-bold text-deadline">
        <TriangleAlert className="h-4 w-4" />
        Demonstration Mode Active
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
        The records shown below are illustrative test entries served because demo mode is active.
        They do not represent active legal schemes.
      </p>
    </div>
  );
}

export function DataUnavailableNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-md border border-border bg-surface p-8 text-center max-w-xl mx-auto"
    >
      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-deadline-background text-deadline">
        <TriangleAlert className="h-4 w-4" />
      </div>
      <h2 className="text-base font-bold text-text-primary">Directory Ingestion Status</h2>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{message}</p>
      <p className="mt-3 text-xs text-text-secondary">
        {brandConfig.siteName} strictly serves verified database records. We never invent
        placeholder entries.
      </p>
    </div>
  );
}

/**
 * Editorial Intelligence zero-inventory state.
 * Understated, truthful, and calm.
 */
export function EmptyDirectoryNotice({
  title = 'No notice has cleared publication review yet',
  body = `${brandConfig.siteName} publishes a listing only when its official source and next steps can be reviewed.`,
  showActions = true,
  showProcess = true,
}: {
  title?: string;
  body?: string;
  showActions?: boolean;
  showProcess?: boolean;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-6 sm:p-10 text-center max-w-3xl mx-auto">
      <h2 className="mb-3 text-balance text-lg font-display font-bold text-text-primary sm:text-xl">
        {title}
      </h2>
      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-lg mx-auto">
        {body}
      </p>

      {/* Discreet 4-Stage Verification Summary */}
      {showProcess && <div className="mt-8 border-t border-border pt-6 text-left">
        <span className="mb-3 block text-center text-xs font-semibold text-text-secondary sm:text-left">
          How a notice becomes a listing
        </span>
        <ol className="relative space-y-4 border-l-2 border-border pl-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 sm:border-l-0 sm:pl-0">
          {[
            ['01', 'Source record identified', 'A configured public source'],
            ['02', 'Official link checked', 'Read the original record'],
            ['03', 'Eligibility reviewed', 'Check the stated next steps'],
            ['04', 'Listing published', 'Return to the source record'],
          ].map(([number, titleText, detail]) => (
            <li key={number} className="relative sm:border-t-2 sm:border-border sm:pt-3">
              <span className="font-mono text-xs font-bold text-trust-primary">{number}</span>
              <span className="mt-1 block text-xs font-semibold text-text-primary">
                {titleText}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
                {detail}
              </span>
            </li>
          ))}
        </ol>
      </div>}

      {showActions && (
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sources"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'rounded-md shadow-xs',
            )}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            <span>Monitored authorities</span>
          </Link>
          <Link
            href="/editorial-policy"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'rounded-md shadow-xs',
            )}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            <span>Editorial standards</span>
          </Link>
          <Link
            href="/claimables"
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'rounded-md font-bold shadow-xs',
            )}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            <span>Browse published opportunities</span>
          </Link>
        </div>
      )}
    </section>
  );
}
