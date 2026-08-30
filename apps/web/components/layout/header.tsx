'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@claimradar/design-system';
import { Menu, X, Search, Bell, User } from 'lucide-react';
import { ClaimRadarBrand } from './brand-mark';
import { Button } from '@claimradar/design-system';

const navLinks = [
  { href: '/claimables', label: 'Find claims' },
  { href: '/closing-soon', label: 'Closing soon' },
  { href: '/companies', label: 'Companies' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/how-it-works', label: 'How it works' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close the drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Focus trap, scroll lock and Escape handler
  React.useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Skip link for keyboard navigation and screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-trust-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-xl"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark & Signal Mark */}
          <ClaimRadarBrand size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:block" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150',
                        active
                          ? 'bg-surface-strong text-trust-primary shadow-sm ring-1 ring-border'
                          : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop Quick Actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>

            <Link href="/register">
              <Button variant="default" size="sm" className="rounded-lg font-bold">
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                <span>Get alerts</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button (>= 44x44px touch target) */}
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:text-text-primary lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Accessible Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          {/* Backdrop overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer sheet */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background p-6 shadow-2xl border-l border-border"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <ClaimRadarBrand size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface hover:text-text-primary"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links (>= 44px tap height) */}
            <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Mobile navigation">
              <ul className="space-y-1.5">
                {navLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex h-12 min-h-[44px] items-center rounded-lg px-4 text-base font-semibold transition-colors',
                          active
                            ? 'bg-trust-primary/10 text-trust-primary font-bold'
                            : 'text-text-secondary hover:bg-surface hover:text-text-primary',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Actions in Drawer */}
            <div className="border-t border-border pt-4 flex flex-col gap-2.5">
              <Link href="/login" className="block w-full">
                <Button variant="outline" size="lg" className="w-full justify-center rounded-lg">
                  <User className="mr-2 h-4 w-4" />
                  Sign in to account
                </Button>
              </Link>

              <Link href="/register" className="block w-full">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full justify-center rounded-lg font-bold"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Get free alerts
                </Button>
              </Link>

              <p className="text-[11px] text-center text-text-muted mt-2">
                Independent platform. Not a government portal.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
