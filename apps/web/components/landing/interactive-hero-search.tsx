'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

interface QuickSuggestion {
  query: string;
  category: 'sector' | 'company' | 'trending';
  label: string;
}

const POPULAR_SUGGESTIONS: QuickSuggestion[] = [
  { query: 'Banking & Financial Services', category: 'sector', label: 'Banking & Finance' },
  { query: 'Aviation', category: 'sector', label: 'Airlines & Flight Refunds' },
  { query: 'Insurance Claims', category: 'sector', label: 'Insurance & Claims' },
  { query: 'Telecom', category: 'sector', label: 'Telecom & Tariff Refunds' },
  { query: 'E-Commerce', category: 'sector', label: 'E-Commerce & Delivery' },
];

export function InteractiveHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/claimables?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/claimables?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
          focused
            ? 'border-brand-bright bg-white/10 shadow-[0_0_24px_rgba(45,212,191,0.25)] ring-2 ring-brand-bright/30'
            : 'border-white/20 bg-white/5 backdrop-blur-md hover:border-white/30'
        }`}
      >
        <div className="pl-4 pr-2 text-white/50">
          <Search className={`h-5 w-5 transition-colors ${focused ? 'text-brand-bright' : ''}`} />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search by company, sector, or authority notice..."
          className="w-full bg-transparent py-4 text-base font-normal text-white placeholder-white/50 focus:outline-none"
          aria-label="Search claim opportunities"
        />
        <button
          type="submit"
          className="mr-2.5 inline-flex items-center gap-1.5 rounded-xl bg-brand-bright px-5 py-2.5 text-sm font-semibold text-ink-950 transition-all duration-200 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-bright"
        >
          <span>Search</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Instant Suggestions Bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-white/60 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-brand-bright" />
          Popular searches:
        </span>
        {POPULAR_SUGGESTIONS.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => handleSuggestionClick(item.query)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80 transition-colors hover:border-brand-bright/50 hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
