'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BrandLockup } from './brand-mark';
import { brandConfig } from '@claimradar/config';

const links = [
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
  { href: '/cookie-policy', label: 'Cookie policy' },
  { href: '/acceptable-use', label: 'Acceptable use' },
  { href: '/corrections', label: 'Corrections' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-white" aria-label="Site footer">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <BrandLockup size="md" showDescriptor />
            <p className="mt-2 max-w-xs text-xs leading-5 text-text-secondary">
              {brandConfig.tagline}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors duration-fast hover:text-trust-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="max-w-[14rem] font-display text-base italic leading-5 text-trust-primary/80 lg:text-right">
            Better information.
            <br />
            Fairer outcomes.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-border pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-trust-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span className="inline-flex items-center gap-1">
            Independent public information service <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </footer>
  );
}
