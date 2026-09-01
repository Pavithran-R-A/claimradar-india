'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, buttonVariants } from '@claimradar/design-system';
import { Menu, X, Search } from 'lucide-react';
import { ClaimRadarBrand } from './brand-mark';

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
  const [scrolled, setScrolled] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-trust-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-xl"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-200 border-b',
          scrolled
            ? 'border-border bg-background/95 backdrop-blur-md shadow-sm'
            : 'border-border/80 bg-background/90 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <ClaimRadarBrand size="md" />

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
                        'nav-link rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-150',
                        active
                          ? 'text-trust-primary bg-surface-strong/80 shadow-xs'
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

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/claimables"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'shadow-sm font-bold',
              )}
            >
              <span>Explore claims</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[100] lg:hidden"
        >
          <div
            className="fixed inset-0 bg-surface/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface p-6 shadow-2xl border-l border-border transition-transform animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <ClaimRadarBrand size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-strong hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Mobile navigation links">
              <ul className="space-y-1.5">
                {navLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-base font-semibold transition-colors',
                          active
                            ? 'bg-trust-primary/10 text-trust-primary font-bold'
                            : 'text-text-primary hover:bg-surface-strong',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto space-y-3 border-t border-border pt-6">
              <Link
                href="/claimables"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'w-full justify-center text-sm font-bold min-h-[44px]',
                )}
              >
                Explore all claims
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full justify-center text-sm font-semibold min-h-[44px]',
                )}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
