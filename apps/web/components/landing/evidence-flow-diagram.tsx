'use client';

import * as React from 'react';
import {
  Landmark,
  Radio,
  FileCheck2,
  Cpu,
  UserCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@claimradar/design-system';

const PIPELINE_STEPS = [
  {
    num: '01',
    label: 'Official Notice',
    icon: Landmark,
    desc: 'Public notices from SEBI, RBI, IBBI, TRAI, and PIB.',
    detail: 'Monitored across authenticated public portals and gazette releases.',
  },
  {
    num: '02',
    label: 'Signal Detected',
    icon: Radio,
    desc: 'Automated discovery flags relevant refund and claim windows.',
    detail: 'Ingested idempotently with hash-deduplicated canonical URLs.',
  },
  {
    num: '03',
    label: 'Document Checked',
    icon: FileCheck2,
    desc: 'Authentic PDF / order text retrieved from source domain.',
    detail: 'Direct cryptographic integrity checking against source host.',
  },
  {
    num: '04',
    label: 'Evidence Structured',
    icon: Cpu,
    desc: 'Affected parties, deadline dates, and claims criteria parsed.',
    detail: 'Structured into deterministic claimable candidate records.',
  },
  {
    num: '05',
    label: 'Human Review',
    icon: UserCheck,
    desc: 'Editorial team verifies facts against the official order.',
    detail: 'Zero automated publication. Every listing requires human verification.',
  },
  {
    num: '06',
    label: 'Published with Source',
    icon: ShieldCheck,
    desc: 'Surfaced with direct provenance and official portal links.',
    detail: 'Clear, plain-language guidance on eligibility and timeline.',
  },
  {
    num: '07',
    label: 'User Acts Directly',
    icon: ExternalLink,
    desc: 'You submit your claim directly on the official authority portal.',
    detail: 'No intermediaries, no fees, no filing on your behalf.',
  },
];

export function EvidenceFlowDiagram() {
  const [activeStep, setActiveStep] = React.useState<number>(4);

  return (
    <div className="w-full">
      {/* Horizontal Continuous Rail for Desktop */}
      <div className="hidden xl:grid xl:grid-cols-7 gap-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          const isFinal = idx === PIPELINE_STEPS.length - 1;

          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={cn(
                'group relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-150',
                isSelected
                  ? 'border-trust-primary bg-surface shadow-md ring-1 ring-trust-primary/20'
                  : 'border-border bg-surface hover:border-trust-primary/30 hover:bg-surface-strong',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-trust-primary">
                    Step {step.num}
                  </span>
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                      isSelected
                        ? 'bg-trust-primary text-white'
                        : 'bg-surface-strong text-text-secondary group-hover:text-trust-primary',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-primary leading-tight">{step.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{step.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/60">
                <span className="text-[11px] font-medium text-text-muted">
                  {isFinal ? 'Official Portal' : 'ClaimRadar Rigor'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Grid for Tablets & Small Desktops (2-3 Cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:hidden gap-4">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;

          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={cn(
                'flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-all',
                isSelected
                  ? 'border-trust-primary bg-surface shadow-sm ring-1 ring-trust-primary/20'
                  : 'border-border bg-surface hover:border-trust-primary/30',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-trust-primary">STEP {step.num}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-strong text-trust-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-text-primary">{step.label}</h3>
                <p className="mt-2 text-xs text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
              <p className="mt-3 text-[11px] text-text-muted border-t border-border pt-2">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
