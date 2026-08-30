'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
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
      <form onSubmit={handleSubmit} className="relative flex w-full flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <label htmlFor="hero-search-input" className="sr-only">
            Search company, regulator, scheme, or notice
          </label>
          <input
            id="hero-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a company, regulator, or notice (e.g. PACL, Sahara, SEBI)"
            className="h-12 w-full rounded-xl border border-white/20 bg-ink-900/90 pl-11 pr-4 text-base text-white placeholder:text-slate-400 focus:border-brand-bright focus:outline-none focus:ring-2 focus:ring-brand-bright/30 transition-all shadow-inner"
          />
        </div>
        <Button
          type="submit"
          variant="signal"
          size="lg"
          className="h-12 min-h-[48px] rounded-xl px-6 text-sm font-bold text-ink-950 sm:w-auto"
        >
          <span>Search notices</span>
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>

      {/* Suggested Search Examples */}
      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-300">
        <span className="text-slate-400">Try:</span>
        {SEARCH_EXAMPLES.map((example, idx) => (
          <React.Fragment key={example}>
            <button
              type="button"
              onClick={() => handleExampleClick(example)}
              className="font-medium text-brand-bright underline underline-offset-2 transition-colors hover:text-white"
            >
              {example}
            </button>
            {idx < SEARCH_EXAMPLES.length - 1 && <span className="text-slate-600">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
