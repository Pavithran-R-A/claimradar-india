'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import { Button } from '@claimradar/design-system';

const COMMON_LOOKUPS = [
  'PACL India',
  'Sahara refund',
  'SEBI recovery',
  'Fixed deposit claim',
  'IBBI insolvency',
];

export function InteractiveHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/claimables?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/claimables');
    }
  };

  const handleLookup = (term: string) => {
    setQuery(term);
    router.push(`/claimables?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full flex-col sm:flex-row items-stretch gap-2"
      >
        <div className="relative flex-1 group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-brand-bright transition-colors">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <label htmlFor="hero-search-input" className="sr-only">
            Search company, regulator, scheme, or notice
          </label>
          <input
            ref={inputRef}
            id="hero-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, regulator, or notice (e.g. PACL, Sahara, SEBI)"
            className="h-12 w-full rounded-md border border-white/20 bg-ink-900/90 pl-11 pr-14 text-base text-white placeholder:text-slate-400 focus:border-brand-bright focus:outline-none focus:ring-2 focus:ring-brand-bright/30 transition-colors shadow-inner"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 my-auto flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-3.5 hidden sm:flex items-center">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[11px] font-mono text-slate-300">
                /
              </kbd>
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="signal"
          size="default"
          className="h-12 px-6 rounded-md text-sm font-bold text-ink-950 sm:w-auto shadow-sm transition-all"
        >
          <span>Search notices</span>
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>

      {/* Understated Common Lookups */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Common searches:</span>
        {COMMON_LOOKUPS.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => handleLookup(term)}
            className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-300 font-medium transition-colors hover:border-brand-bright/40 hover:bg-brand-bright/10 hover:text-brand-bright"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
