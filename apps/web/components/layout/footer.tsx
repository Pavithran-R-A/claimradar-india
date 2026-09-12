'use client';

import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BrandLockup } from './brand-mark';
import { brandConfig } from '@claimradar/config';

const primaryLinks = [
  { href: '/about', label: 'About' },
  { href: '/sources', label: 'Sources' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/claimables', label: 'Opportunities' },
] as const;

const helpLinks = [
  { href: '/faq', label: 'Help & FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/corrections', label: 'Corrections' },
] as const;

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/cookie-policy', label: 'Cookie policy' },
  { href: '/acceptable-use', label: 'Acceptable use' },
] as const;

const footerLinkClass =
  'public-focus inline-flex min-h-[36px] items-center rounded-md px-1 text-sm text-text-secondary transition-colors duration-fast hover:text-trust-primary';

export function Footer() {
  return (
    <footer className="border-t border-border bg-white" aria-label="Site footer">
      <div className="mx-auto max-w-[1760px] px-4 py-9 sm:px-6 lg:px-10 lg:py-10 2xl:px-16">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr] lg:gap-12">
          <div>
            <BrandLockup size="md" showDescriptor />
            <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
              {brandConfig.tagline}
            </p>
            <div className="mt-5 flex max-w-md items-start gap-2.5 rounded-xl border border-border bg-surface-strong/65 px-3.5 py-3 text-xs leading-5 text-text-secondary">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust-primary" aria-hidden="true" />
              <p>
                ClaimKhoj checks public records and points you to official sources. You complete any
                claim or filing on the relevant official portal.
              </p>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-trust-primary">
              Explore
            </p>
            <ul className="mt-3 space-y-1">
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help navigation">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-trust-primary">
              Help & transparency
            </p>
            <ul className="mt-3 space-y-1">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 text-xs text-text-muted lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="public-focus inline-flex min-h-[32px] items-center rounded px-1 transition-colors duration-fast hover:text-trust-primary focus-visible:text-trust-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              Independent public information service <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="font-display text-sm italic text-trust-primary/75">
              Better information. Fairer outcomes.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
