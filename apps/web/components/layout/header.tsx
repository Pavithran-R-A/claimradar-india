'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@claimradar/design-system';
import { Search, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/claimables', label: 'Find Claims' },
  { href: '/companies', label: 'Companies' },
  { href: '/closing-soon', label: 'Closing Soon' },
  { href: '/guides', label: 'Guides' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-trust-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-200',
          scrolled ? 'border-b border-border bg-background/80 backdrop-blur-lg' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-text-primary hover:text-trust-primary transition-colors"
            aria-label="ClaimRadar home"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-trust-primary text-xs font-bold text-white">
              CR
            </span>
            <span className="hidden sm:inline">ClaimRadar</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-trust-primary'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-md bg-trust-primary px-4 text-sm font-medium text-white hover:bg-trust-primary-hover transition-colors"
            >
              Check My Matches
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              className="rounded-md p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-md bg-trust-primary px-3 text-xs font-medium text-white hover:bg-trust-primary-hover transition-colors"
            >
              Check Matches
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
            <nav className="mx-auto max-w-screen-xl px-4 py-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'text-trust-primary bg-surface'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-border pt-4">
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
