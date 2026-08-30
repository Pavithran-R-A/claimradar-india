'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, TriangleAlert, Bell, Eye } from 'lucide-react';
import { Button } from '@claimradar/design-system';

export function DemoDataBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-xl border border-amber-500/30 bg-amber-50/80 p-4 text-sm text-text-primary dark:bg-amber-950/40"
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
      className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm max-w-xl mx-auto"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-3">
        <TriangleAlert className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-bold text-text-primary">Directory Ingestion Status</h2>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">{message}</p>
      <p className="mt-3 text-[11px] text-text-muted">
        ClaimRadar strictly serves verified database records. We never invent placeholder entries.
      </p>
    </div>
  );
}

/**
 * Confidence-building "Evidence Desk" zero-inventory state.
 * Explains the strict verification funnel and builds customer trust when 0 records are published.
 */
export function EmptyDirectoryNotice({
  title = 'No opportunity has cleared publication review yet',
  body = 'ClaimRadar deliberately leaves the public directory empty rather than publish weakly supported claims or unverified notices.',
  showActions = true,
}: {
  title?: string;
  body?: string;
  showActions?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-sm max-w-3xl mx-auto text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-trust-primary/20 bg-trust-primary/10 px-3.5 py-1 text-xs font-bold text-trust-primary mb-4">
        <ShieldCheck className="h-4 w-4" />
        Evidence Desk Status
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
        {title}
      </h2>
      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-xl mx-auto">
        {body}
      </p>

      {/* 4-Stage Verification Filter Visual */}
      <div className="mt-8 rounded-xl border border-border/80 bg-surface-strong p-4 text-left">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-3 text-center sm:text-left">
          Current Ingestion & Verification Funnel
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2 rounded-lg bg-surface p-3 border border-border">
            <span className="font-bold text-trust-primary">01</span>
            <div>
              <span className="font-semibold text-text-primary block">Official Notices</span>
              <span className="text-[11px] text-text-muted">
                Crawled from SEBI, RBI, IBBI, TRAI, PIB
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-surface p-3 border border-border">
            <span className="font-bold text-trust-primary">02</span>
            <div>
              <span className="font-semibold text-text-primary block">Document Ingest</span>
              <span className="text-[11px] text-text-muted">PDF & order verification</span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-surface p-3 border border-border">
            <span className="font-bold text-trust-primary">03</span>
            <div>
              <span className="font-semibold text-text-primary block">Editorial Review</span>
              <span className="text-[11px] text-text-muted">Human verification gate</span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-surface p-3 border border-border">
            <span className="font-bold text-trust-primary">04</span>
            <div>
              <span className="font-semibold text-text-primary block">Public Listing</span>
              <span className="text-[11px] text-text-muted">Grounded with direct links</span>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sources">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              <span>Browse monitored sources</span>
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="sm" className="rounded-lg">
              <span>Verification method</span>
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" size="sm" className="rounded-lg font-bold">
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              <span>Get notified on new publications</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
