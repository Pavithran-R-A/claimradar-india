'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X, Sparkles } from 'lucide-react';
import { Button } from '@claimradar/design-system';

const SEARCH_EXAMPLES = [
  'PACL India',
  'Sahara refund',
  'SEBI recovery',
  'Fixed deposit claim',
  'IBBI insolvency notice',
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
      router.push(`/claimables?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/claimables');
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    router.push(`/claimables?q=${encodeURIComponent(example)}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full flex-col gap-2.5 sm:flex-row items-stretch"
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
            className="h-13 w-full rounded-xl border border-white/20 bg-ink-900/95 pl-11 pr-16 text-base text-white placeholder:text-slate-400 focus:border-brand-bright focus:outline-none focus:ring-2 focus:ring-brand-bright/40 transition-all shadow-lg"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 my-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-3.5 hidden sm:flex items-center">
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-xs font-mono text-slate-300">
                /
              </kbd>
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="signal"
          size="lg"
          className="h-13 min-h-[52px] rounded-xl px-7 text-sm font-bold text-ink-950 sm:w-auto shadow-md hover:shadow-xl transition-all"
        >
          <span>Search notices</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-300">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-brand-bright" />
          Common lookups:
        </span>
        {SEARCH_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="rounded-md bg-white/[0.06] border border-white/10 px-2 py-0.5 text-slate-200 font-medium transition-all hover:bg-brand-bright/20 hover:border-brand-bright/40 hover:text-brand-bright"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
