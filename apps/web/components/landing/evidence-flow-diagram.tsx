'use client';

import * as React from 'react';
import { ArrowRight, FileSearch, ListChecks, Search, UserRound } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const STAGES = [
  { number: '1', title: 'Search', description: "Tell us what you're looking for", icon: Search },
  { number: '2', title: 'We scan', description: 'We check official sources', icon: FileSearch },
  {
    number: '3',
    title: 'See matches',
    description: 'Get relevant opportunities',
    icon: ListChecks,
  },
  {
    number: '4',
    title: 'Take action',
    description: 'Follow official steps to claim',
    icon: UserRound,
  },
] as const;

const TONES = [
  { bg: '#EAF3FF', fg: '#2563EB' },
  { bg: '#EAF7F5', fg: '#0F8B8D' },
  { bg: '#FFF5D6', fg: '#D99A18' },
  { bg: '#EAF3FF', fg: '#214E80' },
] as const;

export function EvidenceFlowDiagram() {
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative py-4 sm:py-5">
      <div
        className="absolute left-[8%] right-[8%] top-[3.35rem] hidden border-t border-dashed border-trust-primary/25 sm:block"
        aria-hidden="true"
      />
      <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-2">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const tone = TONES[index] ?? TONES[0];

          return (
            <li
              key={stage.number}
              className={cn(
                'group relative flex items-start gap-4 transition-all duration-enter ease-out sm:block sm:text-center',
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              )}
              style={{ transitionDelay: isInView ? `${index * 90}ms` : '0ms' }}
            >
              <div
                className="relative z-10 mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white shadow-[0_8px_22px_rgba(13,33,72,0.08)] transition-all duration-fast group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(13,33,72,0.12)] sm:mx-auto"
                style={{ backgroundColor: tone.bg, color: tone.fg }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="pt-1 sm:pt-3">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.15em] text-text-muted">
                  Step {stage.number}
                </p>
                <h3 className="mt-0.5 font-display text-base font-bold leading-tight text-trust-primary sm:text-[1.05rem]">
                  {stage.title}
                </h3>
                <p className="mt-1 text-xs leading-4 text-text-secondary sm:text-sm sm:leading-5">
                  {stage.description}
                </p>
              </div>
              {index < STAGES.length - 1 && (
                <ArrowRight
                  className="absolute -right-2 top-[2.25rem] hidden h-5 w-5 text-trust-primary/45 sm:block"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 rounded-xl border border-[#d7e6e4] bg-[#EEF8F6] px-4 py-2.5 text-xs leading-5 text-text-secondary sm:text-center">
        <strong className="text-trust-primary">Built for a more informed India.</strong> ClaimKhoj
        helps you discover what may apply, then sends you to the official route.
      </div>
    </div>
  );
}
