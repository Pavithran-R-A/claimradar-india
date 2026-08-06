'use client';

import { cn } from '@claimradar/design-system';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Progressive-enhancement accordion built on native <details>/<summary>:
 * keyboard operable and readable without JS. Token-based colours adapt to
 * the active theme.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border">
      {items.map((item, i) => (
        <details key={i} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-left text-base font-medium text-text-primary [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden
              className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-base group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="mt-2 text-sm leading-relaxed text-text-secondary">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

export function HeroCard() {
  return (
    <div className="relative mx-auto mt-10 max-w-2xl">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xl shadow-black/30">
        {/* Search bar mockup */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-background-elevated px-3 py-2">
          <span className="text-text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>
          <span className="text-sm text-text-muted">Search companies, sectors, claim types…</span>
        </div>
        {/* Demo claim cards */}
        <div className="space-y-3">
          <DemoClaimCard
            company="MetroRide Demo"
            title="Refund for overcharged metro passes"
            status="Verified"
            deadline="30 days left"
          />
          <DemoClaimCard
            company="SampleLearn Demo"
            title="Compensation for service outage"
            status="Under Review"
            deadline="—"
          />
          <DemoClaimCard
            company="ShopSquare Demo"
            title="Price-match guarantee claims"
            status="Open"
            deadline="14 days left"
            urgent
          />
        </div>
        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Last checked: 2 hours ago
          </span>
          <span>3 new updates today</span>
        </div>
      </div>
      {/* DEMO label */}
      <span className="absolute -top-3 right-4 rounded-full bg-deadline-background px-2.5 py-0.5 text-xs font-semibold text-deadline">
        DEMO
      </span>
    </div>
  );
}

function DemoClaimCard({
  company,
  title,
  status,
  deadline,
  urgent,
}: {
  company: string;
  title: string;
  status: string;
  deadline: string;
  urgent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background-elevated p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{company}</p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">{title}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            status === 'Verified' && 'bg-verified-background text-success',
            status === 'Under Review' && 'bg-info/10 text-info',
            status === 'Open' && 'bg-trust-primary/10 text-trust-primary',
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
        <span className={cn(urgent && 'text-deadline font-medium')}>⏱ {deadline}</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          Verified source
        </span>
      </div>
    </div>
  );
}
