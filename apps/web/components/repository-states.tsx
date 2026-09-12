'use client';

import * as React from 'react';
import Link from 'next/link';
import { TriangleAlert, Bell, Eye, FileText, ShieldCheck } from 'lucide-react';
import { cn, buttonVariants } from '@claimradar/design-system';
import { brandConfig } from '@claimradar/config';

export function DemoDataBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-md border border-amber-500/30 bg-amber-50/80 p-4 text-sm text-text-primary dark:bg-amber-950/40"
    >
      <p className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
        <TriangleAlert className="h-4 w-4" />
        Demonstration Mode Active
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-400">
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
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 mb-3">
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
  body = `${brandConfig.siteName} actively monitors notices from official statutory and government authorities (SEBI, RBI, IBBI, TRAI, and PIB). We deliberately leave this directory empty rather than publish speculative or unverified claims.`,
  showActions = true,
}: {
  title?: string;
  body?: string;
  showActions?: boolean;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-6 sm:p-10 text-center max-w-3xl mx-auto">
      <div className="editorial-kicker justify-center before:hidden mb-3">
        <ShieldCheck className="h-3.5 w-3.5" />
        Publication status
      </div>
      <h3 className="text-lg sm:text-xl font-display font-bold text-text-primary tracking-tight">
        {title}
      </h3>
      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-lg mx-auto">
        {body}
      </p>

      {/* Discreet 4-Stage Verification Summary */}
      <div className="mt-8 border-t border-border pt-6 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-3 text-center sm:text-left">
          How a notice becomes a listing
        </span>
        <ol className="relative space-y-4 border-l-2 border-border pl-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:space-y-0 sm:border-l-0 sm:pl-0">
          {[
            ['01', 'Official notice found', 'Crawled from SEBI, RBI, IBBI, TRAI, PIB'],
            ['02', 'Source checked', 'PDF and order verification'],
            ['03', 'Editorial review', 'Human verification gate'],
            ['04', 'Published with official link', 'Grounded with direct links'],
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
      </div>

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
            href="/register"
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'rounded-md font-bold shadow-xs',
            )}
          >
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            <span>Set up email alert</span>
          </Link>
        </div>
      )}
    </section>
  );
}
