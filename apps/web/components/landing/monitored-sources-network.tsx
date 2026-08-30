'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Landmark,
  Scale,
  Building2,
  Newspaper,
  Radio,
} from 'lucide-react';
import { publicSourceFamilies } from '@claimradar/source-registry';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sebi: Scale,
  rbi: Landmark,
  ibbi: Building2,
  pib: Newspaper,
  trai: Radio,
};

export function MonitoredSourcesNetwork() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {publicSourceFamilies.map((family) => {
          const Icon = CATEGORY_ICONS[family.id] || Landmark;
          return (
            <div
              key={family.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-150 hover:border-trust-primary/30"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trust-primary/10 text-trust-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{family.shortName}</h3>
                    <span className="text-xs text-text-muted">{family.domain}</span>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                  {family.description}
                </p>

                <div className="rounded-md border border-border/70 bg-surface-strong px-2.5 py-1.5 text-xs text-text-muted">
                  <span className="font-semibold text-text-primary">Coverage: </span>
                  {family.scope}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium">Official source portal</span>
                <span className="text-trust-primary font-semibold">
                  {family.activeSourceIds.length} official{' '}
                  {family.activeSourceIds.length === 1 ? 'source' : 'sources'} monitored
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/sources"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-text-primary hover:border-trust-primary hover:text-trust-primary transition-colors"
        >
          <ShieldCheck className="h-4 w-4 text-trust-primary" />
          <span>View all monitored official sources and verification protocols</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
