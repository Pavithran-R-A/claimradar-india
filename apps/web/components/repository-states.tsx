'use client';

import * as React from 'react';
import Link from 'next/link';
import { TriangleAlert, Bell, Eye, FileText, ShieldCheck } from 'lucide-react';
import { cn, buttonVariants } from '@claimradar/design-system';

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
      <p className="mt-3 text-xs text-text-muted">
        ClaimRadar strictly serves verified database records. We never invent placeholder entries.
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
  body = 'ClaimRadar actively monitors notices from official statutory and government authorities (SEBI, RBI, IBBI, TRAI, and PIB). We deliberately leave this directory empty rather than publish speculative or unverified claims.',
  showActions = true,
}: {
  title?: string;
  body?: string;
  showActions?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-6 sm:p-10 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-1.5 rounded border border-trust-primary/20 bg-trust-primary/10 px-2.5 py-1 text-xs font-bold text-trust-primary mb-3">
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
      <div className="mt-6 pt-5 border-t border-border text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3 text-center sm:text-left">
          How a notice becomes a listing
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded border border-border bg-surface-strong/40">
            <span className="font-mono text-xs font-bold text-trust-primary block">01</span>
            <span className="font-semibold text-text-primary block text-xs">
              Official notice found
            </span>
            <span className="text-xs text-text-muted">Crawled from SEBI, RBI, IBBI, TRAI, PIB</span>
          </div>
          <div className="p-2.5 rounded border border-border bg-surface-strong/40">
            <span className="font-mono text-xs font-bold text-trust-primary block">02</span>
            <span className="font-semibold text-text-primary block text-xs">Source checked</span>
            <span className="text-xs text-text-muted">PDF & order verification</span>
          </div>
          <div className="p-2.5 rounded border border-border bg-surface-strong/40">
            <span className="font-mono text-xs font-bold text-trust-primary block">03</span>
            <span className="font-semibold text-text-primary block text-xs">Editorial review</span>
            <span className="text-xs text-text-muted">Human verification gate</span>
          </div>
          <div className="p-2.5 rounded border border-border bg-surface-strong/40">
            <span className="font-mono text-xs font-bold text-trust-primary block">04</span>
            <span className="font-semibold text-text-primary block text-xs">
              Published with official link
            </span>
            <span className="text-xs text-text-muted">Grounded with direct links</span>
          </div>
        </div>
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
    </div>
  );
}
