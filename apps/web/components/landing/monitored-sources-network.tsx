'use client';

import * as React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface AuthoritySource {
  code: string;
  name: string;
  domain: string;
  statutoryRole: string;
  frequency: string;
  noticeTypes: string;
  officialPortal: string;
}

const SOURCES: AuthoritySource[] = [
  {
    code: 'SEBI',
    name: 'Securities and Exchange Board of India',
    domain: 'Securities & Capital Markets',
    statutoryRole: 'Investor compensation, recovery proceedings & disgorgement funds',
    frequency: 'Continuous (Daily RSS & Orders)',
    noticeTypes: 'Public Notices, Recovery Certificates, Disgorgement Schemes',
    officialPortal: 'https://www.sebi.gov.in',
  },
  {
    code: 'RBI',
    name: 'Reserve Bank of India',
    domain: 'Banking & Financial System',
    statutoryRole: 'Depositor education, unclaimed deposits & ombudsman directives',
    frequency: 'Continuous (Circulars & Notifications)',
    noticeTypes: 'Banking Ombudsman Orders, Inactive Account Schemes',
    officialPortal: 'https://www.rbi.org.in',
  },
  {
    code: 'IBBI',
    name: 'Insolvency & Bankruptcy Board of India',
    domain: 'Corporate Insolvency & Liquidation',
    statutoryRole: 'Public liquidation notices, insolvency claim forms (B/C/D) & timelines',
    frequency: 'Continuous (Gazette Feeds & Announcements)',
    noticeTypes: 'Form A, Form B, Form C Creditor Submissions',
    officialPortal: 'https://ibbi.gov.in',
  },
  {
    code: 'TRAI',
    name: 'Telecom Regulatory Authority of India',
    domain: 'Telecommunications & Consumer Protection',
    statutoryRole: 'Telecom consumer compensation directives & tariff overcharge refunds',
    frequency: 'Continuous (Press Releases & Gazettes)',
    noticeTypes: 'Tariff Directives, Financial Penalty Distributions',
    officialPortal: 'https://www.trai.gov.in',
  },
  {
    code: 'PIB',
    name: 'Press Information Bureau',
    domain: 'Union Ministries & Government of India',
    statutoryRole: 'Central ministry compensation packages, tribunal settlements & gazettes',
    frequency: 'Continuous (Ministry Press Feeds)',
    noticeTypes: 'Cabinet Decisions, Ministry Relief Notifications',
    officialPortal: 'https://pib.gov.in',
  },
];

export function MonitoredSourcesNetwork() {
  return (
    <div className="w-full">
      {/* 1. Mobile Responsive View (Zero horizontal scroll on small screens) */}
      <div className="sm:hidden space-y-3">
        {SOURCES.map((source) => (
          <div
            key={source.code}
            className="rounded-md border border-border bg-surface p-4 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-strong border border-border text-trust-primary">
                  {source.code}
                </span>
                <span className="font-bold text-sm text-text-primary">{source.name}</span>
              </div>
              <a
                href={source.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-trust-primary hover:underline shrink-0"
                aria-label={`Visit official ${source.code} portal`}
              >
                <span>Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-xs text-text-secondary space-y-1">
              <div>
                <span className="font-semibold text-text-primary">Domain:</span> {source.domain}
              </div>
              <div className="text-text-muted">{source.statutoryRole}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Tablet & Desktop Institutional Ledger Table */}
      <div className="hidden sm:block overflow-hidden rounded-md border border-border bg-surface shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-strong/60 text-xs font-semibold text-text-muted">
              <th className="py-3 px-4">Authority</th>
              <th className="py-3 px-4">Statutory Domain</th>
              <th className="py-3 px-4 hidden md:table-cell">Monitored Notice Types</th>
              <th className="py-3 px-4 hidden lg:table-cell">Ingestion Cadence</th>
              <th className="py-3 px-4 text-right">Portal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SOURCES.map((source) => (
              <tr
                key={source.code}
                className="hover:bg-surface-strong/50 transition-colors duration-fast text-text-primary"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-strong border border-border text-trust-primary">
                      {source.code}
                    </span>
                    <span className="font-semibold text-sm">{source.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-text-secondary">
                  <span className="block font-medium">{source.domain}</span>
                  <span className="text-text-muted text-xs mt-0.5 block">
                    {source.statutoryRole}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-text-muted hidden md:table-cell">
                  {source.noticeTypes}
                </td>
                <td className="py-3.5 px-4 text-xs text-text-muted hidden lg:table-cell font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {source.frequency}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <a
                    href={source.officialPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-trust-primary transition-colors duration-fast"
                  >
                    <span>Visit</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-trust-primary shrink-0" />
          Every ingested notice is cryptographically hashed and verified before editorial review.
        </span>
        <span className="font-mono text-[11px] text-text-secondary">
          INDEXED FROM OFFICIAL SOURCES
        </span>
      </div>
    </div>
  );
}
