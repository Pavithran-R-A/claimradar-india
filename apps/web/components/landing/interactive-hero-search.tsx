'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Search, X } from 'lucide-react';
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const submittedQuery = new FormData(event.currentTarget).get('query');
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
        aria-label="Search ClaimKhoj opportunities"
        aria-busy={isSubmitting}
        data-ui="hero-search"
        onSubmit={handleSubmit}
        className="group grid w-full gap-2 rounded-[var(--public-radius-card)] border border-[#cbd8e1] bg-white p-2 shadow-[var(--public-shadow-control)] transition-all duration-ui ease-out hover:border-trust-primary/30 focus-within:border-trust-primary focus-within:ring-2 focus-within:ring-trust-primary/15 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-stretch lg:gap-0"
      >
        <div className="relative flex min-w-0 items-center rounded-[var(--public-radius-control)] lg:rounded-r-none">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 transition-colors duration-fast"
            style={{
              color: isFocused ? 'rgb(var(--c-trust-primary))' : 'rgb(var(--c-text-muted))',
            }}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <label htmlFor="hero-search-input" className="sr-only">
            Search company, regulator, scheme, notice, or situation
          </label>
          <input
            ref={inputRef}
            id="hero-search-input"
            name="query"
            type="search"
            autoComplete="off"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search refunds, claims, schemes or your situation"
            className="min-h-[48px] w-full rounded-[var(--public-radius-control)] border-0 bg-transparent py-3 pl-12 pr-12 text-base text-text-primary placeholder:text-text-muted focus:outline-none sm:min-h-[56px] sm:text-[1.02rem] lg:rounded-r-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="search-clear-enter public-focus absolute right-2 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-text-muted transition-all duration-fast hover:bg-surface-strong hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="pointer-events-none absolute right-3 hidden items-center sm:flex">
              <kbd className="rounded border border-border bg-surface-strong px-1.5 py-0.5 font-mono text-xs text-text-muted">
                /
              </kbd>
            </div>
          )}
        </div>

        <label className="flex min-h-[48px] items-center gap-2 rounded-[var(--public-radius-control)] border border-border px-3 text-sm text-text-secondary sm:min-h-[56px] lg:rounded-none lg:border-y-0 lg:border-l lg:border-r-0 lg:px-4">
          <MapPin className="h-4 w-4 shrink-0 text-trust-primary" aria-hidden="true" />
          <span className="sr-only">Search location</span>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="min-h-[44px] w-full cursor-pointer border-0 bg-transparent font-semibold text-text-primary outline-none lg:w-auto"
          >
            <option>All India</option>
          </select>
        </label>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
          size="default"
          className="min-h-[48px] w-full shrink-0 rounded-[var(--public-radius-control)] !bg-[#F5B940] px-7 text-sm font-extrabold !text-[#0D2148] shadow-[0_8px_20px_rgba(217,154,24,0.18)] transition-all duration-fast hover:!bg-[#F0AE2F] hover:shadow-[0_10px_24px_rgba(217,154,24,0.25)] disabled:cursor-wait disabled:opacity-70 sm:min-h-[56px] lg:w-auto lg:rounded-l-none"
        >
          <span>{isSubmitting ? 'Searching…' : 'Search Claims'}</span>
          <ArrowRight
            className="ml-1.5 h-4 w-4 transition-transform duration-fast group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span className="mr-1 font-medium text-text-secondary">Try</span>
        {SUGGESTIONS.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => handleLookup(term)}
            className="public-focus inline-flex min-h-[36px] items-center justify-center rounded-full border border-border bg-white px-3 text-text-secondary transition-all duration-fast hover:border-trust-primary/25 hover:bg-surface-strong hover:text-trust-primary"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
