'use client';

import * as React from 'react';
import { ArrowRight, CheckCircle2, FileSearch, ListChecks, Search } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const STAGES = [
  { number: '1', title: 'Search', description: "Tell us what you're looking for", icon: Search },
  { number: '2', title: 'We check', description: 'We monitor official sources', icon: FileSearch },
  {
    number: '3',
    title: 'See matches',
    description: 'Review relevant opportunities',
    icon: ListChecks,
  },
  {
    number: '4',
    title: 'Take action',
    description: 'Follow the official process',
    icon: CheckCircle2,
  },
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
    <div ref={containerRef} className="relative py-7 sm:py-9">
      <div
        className="absolute left-10 right-10 top-[4.2rem] hidden border-t border-dashed border-trust-primary/35 sm:block"
        aria-hidden="true"
      />
      <ol className="relative grid gap-7 sm:grid-cols-4 sm:gap-3">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <li
              key={stage.number}
              className={cn(
                'group relative flex items-start gap-4 transition-all duration-enter ease-out sm:block sm:text-center',
                isInView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              )}
              style={{ transitionDelay: isInView ? `${index * 100}ms` : '0ms' }}
            >
              <div className="relative z-10 mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-trust-primary/15 bg-[#eef8f8] text-trust-primary shadow-xs transition-all duration-fast group-hover:-translate-y-1 group-hover:border-brand-bright group-hover:bg-brand-bright/10 sm:mx-auto">
                <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-bright text-[0.65rem] font-bold text-white">
                  {stage.number}
                </span>
              </div>
              <div className="pt-1 sm:pt-4">
                <h3 className="font-display text-lg font-bold text-trust-primary">{stage.title}</h3>
                <p className="mt-1 text-sm leading-5 text-text-secondary">{stage.description}</p>
              </div>
              {index < STAGES.length - 1 && (
                <ArrowRight
                  className="absolute right-[-0.6rem] top-5 hidden h-5 w-5 text-trust-primary/50 sm:block"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-text-muted sm:text-center">
        ClaimKhoj directs you to the official route. It does not file claims or promise payouts.
      </p>
    </div>
  );
}
