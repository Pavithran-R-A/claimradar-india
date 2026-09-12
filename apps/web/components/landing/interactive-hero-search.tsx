'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X, MapPin } from 'lucide-react';
import { Button } from '@claimradar/design-system';

const SUGGESTIONS = ['unclaimed deposits', 'SEBI recovery', 'insolvency claim', 'telecom refund'];

export function InteractiveHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [location, setLocation] = React.useState('All India');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submittedQuery = new FormData(e.currentTarget).get('query');
    const trimmed = String(submittedQuery ?? query).trim();
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
        className="group relative flex w-full flex-col items-stretch gap-2 rounded-md border border-border bg-surface p-1.5 shadow-xs transition-all duration-ui ease-out hover:border-trust-primary/40 hover:shadow-sm focus-within:border-trust-primary focus-within:ring-2 focus-within:ring-trust-primary/20 focus-within:shadow-sm focus-within:-translate-y-[1px] sm:flex-row"
        aria-busy={isSubmitting}
      >
        <div className="relative flex-1 flex items-center min-w-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10 transition-colors duration-fast"
            style={{
              color: isFocused ? 'rgb(var(--c-trust-primary))' : 'rgb(var(--c-text-muted))',
            }}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <label htmlFor="hero-search-input" className="sr-only">
            Search company, regulator, scheme, or notice
          </label>
          <input
            ref={inputRef}
            id="hero-search-input"
            name="query"
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search refunds, claims, schemes or your situation"
            style={{ paddingLeft: '48px', paddingRight: '48px' }}
            className="h-12 sm:h-14 w-full rounded-md border-0 bg-transparent text-base sm:text-lg text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="search-clear-enter absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-strong transition-all duration-fast hover:scale-110 active:scale-95"
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
        <label className="flex min-h-12 items-center gap-2 border-t border-border px-3 text-sm text-text-secondary sm:min-h-14 sm:border-l sm:border-t-0 sm:px-4">
          <MapPin className="h-4 w-4 shrink-0 text-trust-primary" aria-hidden="true" />
          <span className="sr-only">Search location</span>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full cursor-pointer border-0 bg-transparent font-semibold text-text-primary outline-none sm:w-auto"
          >
            <option>All India</option>
          </select>
        </label>
        <Button
          type="submit"
          variant="default"
          size="default"
          className="h-12 sm:h-14 px-7 rounded-md text-sm font-bold text-white sm:w-auto shadow-xs transition-all duration-fast shrink-0"
        >
          <span>{isSubmitting ? 'Searching...' : 'Search Claims'}</span>
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" />
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
              className="inline-flex min-h-[24px] min-w-[24px] items-center justify-center text-text-secondary hover:text-trust-primary hover:underline transition-colors duration-fast cursor-pointer"
            >
              {term}
            </button>
            {idx < SUGGESTIONS.length - 1 && (
              <span className="text-border mx-1" aria-hidden>
                ·
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
