'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, buttonVariants } from '@claimradar/design-system';
import { Menu, Search, X } from 'lucide-react';
import { BrandLockup } from './brand-mark';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/claimables', label: 'Opportunities' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/sources', label: 'Sources' },
  { href: '/about', label: 'About' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-md focus:bg-trust-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 h-16 border-b transition-all duration-ui ease-out lg:h-[72px]',
          scrolled
            ? 'border-border bg-white/95 shadow-[0_8px_28px_rgba(13,33,72,0.06)] backdrop-blur-md'
            : 'border-border/80 bg-white/92 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLockup size="md" />

          <nav className="hidden lg:block" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'nav-link-indicator public-focus inline-flex min-h-[44px] items-center rounded-md px-3.5 py-2 text-sm font-semibold transition-colors duration-fast',
                        active
                          ? 'font-bold text-trust-primary'
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

          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="public-focus inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-transparent text-text-secondary transition-all duration-fast hover:border-border hover:bg-surface-strong hover:text-text-primary"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <Link
              href="/claimables"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'public-focus min-h-[44px] rounded-lg px-5 font-bold',
              )}
            >
              Explore Claims
            </Link>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              href="/claimables"
              aria-label="Search all opportunities"
              className="public-focus inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary transition-colors duration-fast hover:bg-surface-strong hover:text-text-primary"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
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
              className="public-focus inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-white text-text-primary transition-colors duration-fast hover:bg-surface-strong"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
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
            className={cn(
              'fixed inset-0 bg-text-primary/40 backdrop-blur-xs transition-opacity',
              isClosing ? 'drawer-backdrop-exit' : 'drawer-backdrop-enter',
            )}
            onClick={handleClose}
            aria-hidden="true"
          />

          <div
            className={cn(
              'fixed inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-white p-5 shadow-2xl transition-all sm:p-6',
              isClosing ? 'drawer-panel-exit' : 'drawer-panel-enter',
            )}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <BrandLockup size="sm" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label="Close navigation menu"
                className="public-focus inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-text-secondary transition-colors duration-fast hover:bg-surface-strong hover:text-text-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-5 flex-1 overflow-y-auto" aria-label="Mobile navigation links">
              <ul className="space-y-1">
                {navLinks.map((link, idx) => {
                  const active =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);

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
                          'public-focus flex min-h-[48px] items-center rounded-lg px-4 py-2.5 text-base font-semibold transition-colors duration-fast',
                          active
                            ? 'bg-trust-primary/10 font-bold text-trust-primary'
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
                  'public-focus min-h-[48px] w-full justify-center rounded-lg text-sm font-bold',
                )}
              >
                Explore Claims
              </Link>
              <Link
                href="/login"
                onClick={handleClose}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'public-focus min-h-[48px] w-full justify-center rounded-lg text-sm font-semibold',
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
