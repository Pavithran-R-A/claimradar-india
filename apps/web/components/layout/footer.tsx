'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClaimRadarBrand } from './brand-mark';
import { ShieldCheck } from 'lucide-react';

const brandConfig = {
  siteName: 'ClaimRadar India',
  supportEmail: 'support@claimradar.in',
} as const;

const footerColumns = [
  {
    title: 'Discover',
    links: [
      { href: '/claimables', label: 'Find claims' },
      { href: '/new', label: 'Newly published' },
      { href: '/closing-soon', label: 'Closing soon' },
      { href: '/deadlines', label: 'Deadline schedule' },
      { href: '/companies', label: 'Companies' },
      { href: '/sectors', label: 'Industry sectors' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/methodology', label: 'Methodology' },
      { href: '/sources', label: 'Monitored sources' },
      { href: '/guides', label: 'Guides' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/corrections', label: 'Submit correction' },
      { href: '/security', label: 'Security' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/contact', label: 'Contact support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of service' },
      { href: '/disclaimer', label: 'Legal disclaimer' },
      { href: '/refund-policy', label: 'Refund policy' },
      { href: '/subscription-policy', label: 'Subscription policy' },
      { href: '/cookie-policy', label: 'Cookie policy' },
      { href: '/acceptable-use', label: 'Acceptable use' },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-white border-t border-white/10" aria-label="Site footer">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {/* Brand & Purpose Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <ClaimRadarBrand size="md" theme="dark" />
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Independent information service discovering, structuring, and surfacing refund,
              compensation and public claim notices from official Indian sources.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-bright" />
              Not a government portal or law firm
            </div>
          </div>

          {/* 4 Balanced Navigation Columns */}
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-300 transition-colors hover:text-brand-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Independence Disclaimer Box */}
        <div className="mt-10 rounded-xl border border-white/10 bg-ink-900/90 p-4 text-xs leading-relaxed text-slate-300">
          <strong className="font-bold text-white">Independent information service: </strong>
          {brandConfig.siteName} is not affiliated with the Government of India, any court,
          tribunal, regulator, or listed company. We publish structured information from public
          records and do not file claims or collect fees on users&apos; behalf. Every listing links
          directly to the official portal where users act independently.
        </div>

        {/* Bottom Row */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`mailto:${brandConfig.supportEmail}`}
              className="hover:text-slate-200 transition-colors"
            >
              {brandConfig.supportEmail}
            </a>
            <Link href="/sitemap.xml" className="hover:text-slate-200 transition-colors">
              Sitemap
            </Link>
            <span>Public Information Utility — India</span>
          </div>
          <p>
            © {year} {brandConfig.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
