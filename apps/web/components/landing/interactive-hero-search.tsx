'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import { Button } from '@claimradar/design-system';

const SUGGESTIONS = ['PACL', 'Sahara', 'SEBI recovery', 'Fixed deposit claim', 'IBBI insolvency'];

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
        className="relative flex w-full flex-col sm:flex-row items-stretch gap-2.5 rounded-lg border border-border bg-surface p-2 shadow-sm transition-all focus-within:border-trust-primary focus-within:ring-2 focus-within:ring-trust-primary/20"
      >
        <div className="relative flex-1 flex items-center min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted z-10">
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
            style={{ paddingLeft: '48px', paddingRight: '48px' }}
            className="h-12 sm:h-14 w-full rounded-md border-0 bg-transparent text-base sm:text-lg text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-strong transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-3 hidden sm:flex items-center">
              <kbd className="rounded border border-border bg-surface-strong px-1.5 py-0.5 text-xs font-mono text-text-muted">
                /
              </kbd>
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="default"
          size="default"
          className="h-12 sm:h-14 px-7 rounded-md text-sm font-bold text-white sm:w-auto shadow-sm transition-colors shrink-0"
        >
          <span>Search notices</span>
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>

      {/* Quiet Example Lookups */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
        <span className="text-text-secondary font-medium mr-1">Try:</span>
        {SUGGESTIONS.map((term, idx) => (
          <React.Fragment key={term}>
            <button
              type="button"
              onClick={() => handleLookup(term)}
              className="text-text-secondary hover:text-trust-primary hover:underline transition-colors"
            >
              {term}
            </button>
            {idx < SUGGESTIONS.length - 1 && <span className="text-border mx-1" aria-hidden>·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
