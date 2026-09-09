'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClaimRadarBrand } from './brand-mark';
import { ShieldCheck } from 'lucide-react';

const brandConfig = {
  siteName: 'ClaimRadar India',
} as const;

const navigationGroups = [
  {
    title: 'Explore',
    links: [
      { href: '/claimables', label: 'Find all claims' },
      { href: '/closing-soon', label: 'Closing soon' },
      { href: '/deadlines', label: 'Filing deadlines' },
      { href: '/companies', label: 'Monitored companies' },
      { href: '/sectors', label: 'Industry sectors' },
    ],
  },
  {
    title: 'About & How It Works',
    links: [
      { href: '/how-it-works', label: 'How ClaimRadar works' },
      { href: '/methodology', label: 'Verification methodology' },
      { href: '/sources', label: 'Monitored official sources' },
      { href: '/faq', label: 'Frequently asked questions' },
      { href: '/guides', label: 'Consumer guides' },
    ],
  },
  {
    title: 'Trust & Governance',
    links: [
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/corrections', label: 'Submit a correction' },
      { href: '/security', label: 'Security practices' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
] as const;

const utilityLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/cookie-policy', label: 'Cookie policy' },
  { href: '/acceptable-use', label: 'Acceptable use' },
  { href: '/refund-policy', label: 'Refund policy' },
  { href: '/sitemap.xml', label: 'Sitemap' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border bg-surface border-t border-border text-text-primary"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <ClaimRadarBrand size="md" theme="dark" />
            <p className="mt-3 text-xs leading-relaxed text-text-secondary max-w-sm">
              Independent claims information directory discovering, structuring, and surfacing
              public refund, compensation and recovery notices from official Indian regulatory
              sources.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-white/5 px-2.5 py-1 text-xs font-medium text-text-secondary">
              <ShieldCheck className="h-4 w-4 text-trust-primary shrink-0" />
              <span>Independent consumer information service</span>
            </div>
          </div>

          {/* 3 Balanced Navigation Columns */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {navigationGroups.map((group) => (
              <nav key={group.title} aria-label={`Footer — ${group.title}`}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Clear Independence Disclaimer */}
        <div className="mt-10 rounded-xl border border-border bg-ink-900/80 p-4 text-xs leading-relaxed text-slate-300">
          <strong className="font-semibold text-white">Independence disclosure: </strong>
          {brandConfig.siteName} is strictly an independent information directory and is not
          affiliated with the Government of India, any regulator (SEBI, RBI, IBBI, TRAI), court,
          tribunal, or listed company. We structure public notices and direct you to official
          portals where you act directly. We do not file claims or charge fees on users&apos;
          behalf.
        </div>

        {/* Bottom Utility Row */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-muted hover:text-slate-200 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-text-muted">
            © {year} {brandConfig.siteName}.
          </p>
        </div>
      </div>
    </footer>
  );
}
