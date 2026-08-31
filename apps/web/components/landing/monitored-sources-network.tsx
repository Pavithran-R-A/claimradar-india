'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';

const SOURCES_LEDGER = [
  {
    code: 'SEBI',
    authority: 'Securities and Exchange Board of India',
    mandate: 'Securities Market Regulation & Investor Protection',
    coverage:
      'Disgorgement proceedings, PACL / Sahara recovery schemes, investor compensation orders.',
    noticeType: 'Statutory Orders, Public Notices & Circulars',
    link: 'https://www.sebi.gov.in',
  },
  {
    code: 'RBI',
    authority: 'Reserve Bank of India',
    mandate: 'Central Banking & Depositor Education',
    coverage: 'Unclaimed deposits, ombudsman redressal guidelines, banking relief schemes.',
    noticeType: 'Gazette Notifications, Press Releases & Directives',
    link: 'https://www.rbi.org.in',
  },
  {
    code: 'IBBI',
    authority: 'Insolvency and Bankruptcy Board of India',
    mandate: 'Corporate Insolvency & Liquidation Processes',
    coverage:
      'Public claims submission windows for creditors, operational creditors, and depositors.',
    noticeType: 'Public Announcements & Liquidation Filings',
    link: 'https://www.ibbi.gov.in',
  },
  {
    code: 'TRAI',
    authority: 'Telecom Regulatory Authority of India',
    mandate: 'Telecommunications & Consumer Protection',
    coverage: 'Consumer tariff refunds, penalty refund orders, telecom service redressals.',
    noticeType: 'Regulatory Orders & Consultation Determinations',
    link: 'https://www.trai.gov.in',
  },
  {
    code: 'PIB',
    authority: 'Press Information Bureau',
    mandate: 'Government of India Official Communications',
    coverage: 'Union Ministry compensation schemes, tribunal settlements, public refund portals.',
    noticeType: 'Official Press Dispatches & Ministry Orders',
    link: 'https://pib.gov.in',
  },
];

export function MonitoredSourcesNetwork() {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="divide-y divide-border">
          {SOURCES_LEDGER.map((src) => (
            <div
              key={src.code}
              className="p-5 sm:p-6 transition-colors hover:bg-surface-strong/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center rounded-md bg-ink-950 border border-white/20 px-2.5 py-1 text-xs font-mono font-bold text-brand-bright">
                    {src.code}
                  </span>
                  <h4 className="text-base font-bold text-text-primary tracking-tight">
                    {src.authority}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {src.coverage}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted font-mono pt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-trust-primary" />
                  <span>Monitors: {src.noticeType}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <a
                  href={src.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary hover:border-trust-primary/40 hover:text-trust-primary transition-colors"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-text-muted">
        <span>
          ClaimRadar operates independently and has no official affiliation with any monitored
          authority.
        </span>
        <Link
          href="/sources"
          className="font-semibold text-trust-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View complete sources methodology</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
