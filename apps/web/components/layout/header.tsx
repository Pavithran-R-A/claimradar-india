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
  const [isClosing, setIsClosing] = React.useState(false);
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
    setIsClosing(false);
  }, [pathname]);

  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen, handleClose]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-trust-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-ui ease-out border-b h-16',
          scrolled
            ? 'border-border bg-surface/95 backdrop-blur-md shadow-xs'
            : 'border-border/80 bg-background/90 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
                        'nav-link nav-link-indicator rounded-md px-3.5 py-2 text-sm font-semibold transition-colors duration-fast',
                        active
                          ? 'text-trust-primary font-bold'
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

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-strong hover:text-text-primary transition-all duration-fast hover:scale-[1.04] active:scale-[0.96] border border-transparent hover:border-border"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="rounded-md px-3.5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors duration-fast hover:-translate-y-[0.5px]"
            >
              Sign in
            </Link>

            <Link
              href="/claimables"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'rounded-md font-bold px-4',
              )}
            >
              <span>Explore claims</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-secondary hover:bg-surface-strong hover:text-text-primary transition-colors duration-fast"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => {
                setMobileOpen(true);
                setIsClosing(false);
              }}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text-primary hover:bg-surface-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
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
          {/* Backdrop with 180ms ease-out opacity */}
          <div
            className={cn(
              'fixed inset-0 bg-text-primary/40 backdrop-blur-xs transition-opacity',
              isClosing ? 'drawer-backdrop-exit' : 'drawer-backdrop-enter',
            )}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer Panel with 260ms translateX & opacity */}
          <div
            className={cn(
              'fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface p-6 shadow-2xl border-l border-border transition-all',
              isClosing ? 'drawer-panel-exit' : 'drawer-panel-enter',
            )}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <ClaimRadarBrand size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-strong hover:text-text-primary transition-colors duration-fast"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Mobile navigation links">
              <ul className="space-y-1.5">
                {navLinks.map((link, idx) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li
                      key={link.href}
                      style={{ animationDelay: `${idx * 35}ms` }}
                      className={cn(!isClosing && 'drawer-link-enter')}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={handleClose}
                        className={cn(
                          'flex min-h-[44px] items-center rounded-md px-4 py-2.5 text-base font-semibold transition-colors duration-fast',
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
                onClick={handleClose}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'w-full justify-center text-sm font-bold min-h-[44px] rounded-md',
                )}
              >
                Explore all claims
              </Link>
              <Link
                href="/login"
                onClick={handleClose}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full justify-center text-sm font-semibold min-h-[44px] rounded-md',
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
