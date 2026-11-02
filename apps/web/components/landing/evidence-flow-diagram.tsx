'use client';

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
  'bg-trust-primary/10 text-trust-primary',
  'bg-verified-background text-success',
  'bg-deadline-background text-deadline',
  'bg-info/10 text-info',
] as const;

export function EvidenceFlowDiagram() {
  return (
    <div className="relative py-4 sm:py-5">
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
              className="group relative flex items-start gap-4 sm:block sm:text-center"
            >
              <div
                className={cn(
                  'relative z-10 mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-auto',
                  tone,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="pt-1 sm:pt-3">
                <p className="text-xs text-text-muted">Step {stage.number}</p>
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
      <div className="mt-4 rounded-xl border border-border bg-surface-strong px-4 py-2.5 text-xs leading-5 text-text-secondary sm:text-center">
        <strong className="text-trust-primary">Built for a more informed India.</strong> ClaimKhoj
        helps you discover what may apply, then sends you to the official route.
      </div>
    </div>
  );
}
