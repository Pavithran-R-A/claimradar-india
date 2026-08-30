'use client';

import * as React from 'react';
import Link from 'next/link';
import { Landmark, ArrowRight, ShieldCheck, Scale, Building2, Newspaper } from 'lucide-react';

const MONITORED_CATEGORIES = [
  {
    category: 'Securities & Market Regulators',
    icon: Scale,
    sources: [
      { name: 'SEBI Recovery & Refund Portal', domain: 'sebi.gov.in', status: 'Active Ingestion' },
      { name: 'SEBI Public Notices & Orders', domain: 'sebi.gov.in', status: 'Active Ingestion' },
    ],
    description:
      'Investor compensation schemes, refund committee distributions, and disgorgement fund claims.',
  },
  {
    category: 'Banking & Financial Depository',
    icon: Landmark,
    sources: [
      {
        name: 'RBI Notifications & Press Releases',
        domain: 'rbi.org.in',
        status: 'Active Ingestion',
      },
      {
        name: 'DEA Fund & Unclaimed Deposit Guidelines',
        domain: 'rbi.org.in',
        status: 'Active Ingestion',
      },
    ],
    description:
      'Depositor education funds, cooperative bank liquidation compensation, and deposit claims.',
  },
  {
    category: 'Insolvency & Corporate Resolution',
    icon: Building2,
    sources: [
      {
        name: 'IBBI Public Announcements (Form B/C)',
        domain: 'ibbi.gov.in',
        status: 'Active Ingestion',
      },
      {
        name: 'NCLT Orders & Creditor Deadlines',
        domain: 'nclt.gov.in',
        status: 'Active Ingestion',
      },
    ],
    description:
      'Corporate insolvency resolution claims, operational/financial creditor filing windows.',
  },
  {
    category: 'Government Press & Consumer Affairs',
    icon: Newspaper,
    sources: [
      { name: 'PIB Government Press Releases', domain: 'pib.gov.in', status: 'Active Ingestion' },
      {
        name: 'National Consumer Disputes Redressal Commission',
        domain: 'ncdrc.nic.in',
        status: 'Active Ingestion',
      },
    ],
    description:
      'Central government compensation packages, court-directed refund settlements, and public welfare claims.',
  },
];

export function MonitoredSourcesNetwork() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MONITORED_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.category}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-150 hover:border-trust-primary/30"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trust-primary/10 text-trust-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{cat.category}</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="space-y-2">
                  {cat.sources.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between rounded-lg border border-border/80 bg-surface-strong px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-text-primary">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-muted">{s.domain}</span>
                        <span
                          className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                          title="Active"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Strict source verification</span>
                <Link
                  href="/sources"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-trust-primary hover:text-trust-primary-hover"
                >
                  Source details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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
          <span>View all monitored regulatory sources and verification protocols</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
