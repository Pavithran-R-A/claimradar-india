'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn, buttonVariants } from '@claimradar/design-system';

export function AccountCta() {
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-surface p-8 sm:p-12 shadow-xs">
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-surface-strong text-trust-primary border border-border mb-4">
          <Bell className="h-5 w-5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
          Save companies and receive deadline alerts.
        </h2>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-secondary max-w-lg mx-auto">
          Follow companies, sectors, and keywords. We send notifications as soon as official refund
          notices or statutory claim windows are published.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              'rounded-md font-bold px-6 shadow-xs',
            )}
          >
            <span>Set up email alert</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'rounded-md shadow-xs',
            )}
          >
            Sign in to watchlist
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-trust-primary" /> Free consumer service
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-trust-primary" /> Direct official portal links
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-trust-primary" /> No marketing spam
          </span>
        </div>
      </div>
    </div>
  );
}
