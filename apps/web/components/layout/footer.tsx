'use client';

import Link from 'next/link';
import { BrandLockup } from './brand-mark';

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/sources', label: 'Sources' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/claimables', label: 'Opportunities' },
  { href: '/faq', label: 'Help' },
  { href: '/contact', label: 'Contact' },
] as const;

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/cookie-policy', label: 'Cookies' },
  { href: '/acceptable-use', label: 'Acceptable use' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-white" aria-label="Site footer">
      <div className="mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-10 2xl:px-16">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
          <BrandLockup size="sm" showDescriptor />

          <nav aria-label="Footer navigation" className="lg:justify-self-center">
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="public-focus inline-flex min-h-[32px] items-center rounded px-1 text-xs font-medium text-text-secondary transition-colors duration-fast hover:text-trust-primary focus-visible:text-trust-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:text-right">
            <p className="font-display text-sm italic text-trust-primary/80">
              Better information. Fairer outcomes.
            </p>
            <p className="mt-0.5 text-[0.68rem] text-text-muted">
              Independent public information service
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-[0.67rem] text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            ClaimKhoj points to official sources; claims and filings are completed on official
            portals.
          </p>
          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="public-focus inline-flex min-h-[28px] items-center rounded px-1 transition-colors duration-fast hover:text-trust-primary focus-visible:text-trust-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
