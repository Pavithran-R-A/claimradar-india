'use client';

import * as React from 'react';
import { Landmark, FileCheck2, Cpu, UserCheck, ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const TRAIL_STEPS = [
  {
    step: '01',
    title: 'Official Notice Ingestion',
    short: 'Statutory Feeds',
    icon: Landmark,
    description:
      'We continuously poll official gazettes, regulatory orders, and press releases across SEBI, RBI, IBBI, TRAI, and PIB.',
    verificationStandard:
      'Direct official domain ingestion only; zero unverified third-party feeds.',
  },
  {
    step: '02',
    title: 'Document & Order Validation',
    short: 'Document Check',
    icon: FileCheck2,
    description:
      'Original PDF orders, circulars, or gazette notifications are fetched and validated for authenticity and active validity.',
    verificationStandard: 'Source URLs and document hashes verified against publisher origins.',
  },
  {
    step: '03',
    title: 'Eligibility & Timeline Parsing',
    short: 'Structured Data',
    icon: Cpu,
    description:
      'We structure who may qualify, specific claim categories, cutoff deadlines, required documents, and recovery limits.',
    verificationStandard: 'Deterministic fields extracted without speculative figures.',
  },
  {
    step: '04',
    title: 'Human Editorial Verification',
    short: 'Fact-Checked',
    icon: UserCheck,
    description:
      'Every candidate undergoes manual fact-checking by our editorial desk against the official order before publication.',
    verificationStandard:
      'Zero auto-publication. Every public listing is verified by a human editor.',
  },
  {
    step: '05',
    title: 'Direct Official Action Link',
    short: 'Official Portal',
    icon: ExternalLink,
    description:
      'You are directed straight to the designated statutory portal or nodal authority to submit your claim directly.',
    verificationStandard: 'No filing fees, no commissions, no intermediary representation.',
  },
];

export function EvidenceFlowDiagram() {
  const [activeIdx, setActiveIdx] = React.useState<number>(0);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {TRAIL_STEPS.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeIdx === idx;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={cn(
                'group flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150',
                isSelected
                  ? 'border-trust-primary bg-surface shadow-md ring-1 ring-trust-primary/30'
                  : 'border-border bg-surface hover:border-trust-primary/40 hover:bg-surface-strong',
              )}
            >
              <div className="flex w-full items-center justify-between mb-2">
                <span
                  className={cn(
                    'text-[10px] font-mono font-bold tracking-wider',
                    isSelected ? 'text-trust-primary' : 'text-text-muted',
                  )}
                >
                  STAGE {item.step}
                </span>
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isSelected
                      ? 'text-trust-primary'
                      : 'text-text-muted group-hover:text-text-secondary',
                  )}
                />
              </div>
              <div
                className={cn(
                  'text-xs font-bold tracking-tight line-clamp-1',
                  isSelected ? 'text-text-primary' : 'text-text-secondary',
                )}
              >
                {item.short}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Detail Panel */}
      {(() => {
        const current = TRAIL_STEPS[activeIdx] ?? TRAIL_STEPS[0]!;
        const CurrentIcon = current.icon;
        return (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-trust-primary/10 text-trust-primary border border-trust-primary/20">
                  <CurrentIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-trust-primary">
                    Stage {current.step} of 05
                  </div>
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">
                    {current.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-verified-background px-3 py-1 text-xs font-bold text-success border border-success/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Standard
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  What ClaimRadar Does
                </div>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {current.description}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background-elevated p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Quality & Legal Standard
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {current.verificationStandard}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
