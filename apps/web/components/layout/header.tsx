'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@claimradar/design-system';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/claimables', label: 'Find claims' },
  { href: '/companies', label: 'Companies' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/deadlines', label: 'Deadlines' },
  { href: '/how-it-works', label: 'How it works' },
] as const;

/**
 * Sticky blurred header for the public site. Opaque fallback background is
 * always present so the blur is progressive enhancement only. Mobile
 * navigation opens an accessible dialog drawer.
 */
export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close the drawer on navigation.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Focus management, scroll lock and Escape handling for the drawer.
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
      {/* Skip link — first focusable element on every public page. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-field focus:bg-trust-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-lg font-bold text-text-primary transition-colors duration-fast hover:text-trust-primary"
            aria-label="ClaimRadar India home"
          >
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-field bg-ink-900 text-xs font-bold text-brand-bright ring-1 ring-ink-700"
            >
              CR
            </span>
            ClaimRadar
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:block" aria-label="Main">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'nav-link rounded-field px-3 py-2 text-sm font-medium transition-colors duration-fast',
                        active
                          ? 'text-trust-primary'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-field px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-fast hover:text-text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-field bg-trust-primary px-4 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
            >
              Create watchlist
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-field text-text-secondary transition-colors duration-fast hover:bg-surface-strong hover:text-text-primary lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X aria-hidden className="h-5 w-5" />
            ) : (
              <Menu aria-hidden className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-background shadow-panel"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="text-base font-semibold text-text-primary">Menu</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-field text-text-muted transition-colors duration-fast hover:bg-surface-strong hover:text-text-primary"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
              <ul className="space-y-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'block rounded-field px-3 py-3 text-base font-medium transition-colors duration-fast',
                          active
                            ? 'bg-surface-strong text-trust-primary'
                            : 'text-text-secondary hover:bg-surface-strong hover:text-text-primary',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="space-y-2 border-t border-border p-4">
              <Link
                href="/login"
                className="flex h-11 items-center justify-center rounded-field border border-border text-sm font-semibold text-text-primary transition-colors duration-fast hover:bg-surface-strong"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex h-11 items-center justify-center rounded-field bg-trust-primary text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
              >
                Create watchlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
