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
        className="group relative flex w-full flex-col items-stretch gap-2 rounded-lg border border-[#cbd8e1] bg-white p-1.5 shadow-[0_10px_28px_rgba(13,33,72,0.045)] transition-all duration-ui ease-out hover:border-trust-primary/35 hover:shadow-[0_13px_32px_rgba(13,33,72,0.07)] focus-within:-translate-y-[1px] focus-within:border-trust-primary focus-within:ring-2 focus-within:ring-trust-primary/15 sm:flex-row"
        aria-busy={isSubmitting}
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 transition-colors duration-fast"
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
            className="h-12 w-full rounded-md border-0 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none sm:h-14 sm:text-[1.05rem]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="search-clear-enter absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-all duration-fast hover:scale-105 hover:bg-surface-strong hover:text-text-primary active:scale-95"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center sm:flex">
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
          className="h-12 shrink-0 rounded-md !bg-[#F5B940] px-7 text-sm font-extrabold !text-[#0D2148] shadow-[0_8px_20px_rgba(217,154,24,0.18)] transition-all duration-fast hover:!bg-[#F0AE2F] hover:shadow-[0_10px_24px_rgba(217,154,24,0.25)] sm:h-14 sm:w-auto"
        >
          <span>{isSubmitting ? 'Searching...' : 'Search Claims'}</span>
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
        <span className="mr-1 font-medium text-text-secondary">Try:</span>
        {SUGGESTIONS.map((term, idx) => (
          <React.Fragment key={term}>
            <button
              type="button"
              onClick={() => handleLookup(term)}
              className="inline-flex min-h-[28px] min-w-[28px] cursor-pointer items-center justify-center text-text-secondary transition-colors duration-fast hover:text-trust-primary hover:underline"
            >
              {term}
            </button>
            {idx < SUGGESTIONS.length - 1 && (
              <span className="mx-1 text-border" aria-hidden>
                ·
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
