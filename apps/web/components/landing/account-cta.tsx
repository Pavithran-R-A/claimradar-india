'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, Check } from 'lucide-react';
import { Button } from '@claimradar/design-system';

export function AccountCta() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-ink-950 p-8 sm:p-12 text-white shadow-xl">
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-bright/10 text-brand-bright mb-4">
          <Bell className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Save companies and get deadline alerts.
        </h2>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl mx-auto">
          Follow companies, sectors, and keywords you care about. We notify you as soon as official
          refund notices or statutory claim windows are published.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button variant="signal" size="lg" className="rounded-xl font-bold">
              <span>Get deadline alerts</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40"
            >
              Sign in to watchlist
            </Button>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-brand-bright" /> No spam or promotional ads
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-brand-bright" /> 100% free consumer watchlist
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-brand-bright" /> Official sources only
          </span>
        </div>
      </div>
    </div>
  );
}
