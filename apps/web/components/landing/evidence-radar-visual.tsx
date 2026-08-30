'use client';

import * as React from 'react';
import { Landmark, FileText, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const MONITORED_AUTHORITIES = [
  { code: 'SEBI', name: 'Securities and Exchange Board of India' },
  { code: 'RBI', name: 'Reserve Bank of India' },
  { code: 'IBBI', name: 'Insolvency & Bankruptcy Board of India' },
  { code: 'TRAI', name: 'Telecom Regulatory Authority of India' },
  { code: 'PIB', name: 'Press Information Bureau' },
];

const VERIFICATION_STEPS = [
  {
    step: '1',
    title: 'Official notice detected',
    description:
      'Captured from official RSS feeds, public notice boards, or official press releases.',
    icon: Landmark,
  },
  {
    step: '2',
    title: 'Source document verified',
    description:
      'Original gazette notification, regulatory order, or circular validated at the source.',
    icon: FileText,
  },
  {
    step: '3',
    title: 'Eligibility & timeline structured',
    description:
      'Claim categories, cutoff dates, required documents, and recovery limits clearly formatted.',
    icon: CheckCircle2,
  },
  {
    step: '4',
    title: 'Human editorial review',
    description: 'Fact-checked by our editorial desk before any public listing is created.',
    icon: ShieldAlert,
  },
  {
    step: '5',
    title: 'Direct official action link',
    description: 'We point you directly to the official filing portal or designated authority.',
    icon: ExternalLink,
  },
];

export function EvidenceRadarVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[480px] flex-col rounded-xl border border-white/15 bg-ink-950 p-5 sm:p-6 text-white shadow-xl lg:max-w-[500px]',
        className,
      )}
      aria-label="How ClaimRadar Verifies Public Notices"
    >
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-bright">
            SOURCE VERIFICATION
          </span>
          <span className="text-xs text-slate-400">Official Source Standards</span>
        </div>
        <h2 className="mt-1.5 text-base sm:text-lg font-bold text-white tracking-tight font-serif">
          Every listing is checked against the source.
        </h2>
      </div>

      {/* Monitored Official Sources Row */}
      <div className="my-4 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Monitored official sources
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {MONITORED_AUTHORITIES.map((auth) => (
            <span
              key={auth.code}
              className="inline-flex items-center rounded bg-ink-900 border border-white/15 px-2 py-0.5 text-xs font-mono font-bold text-slate-200"
              title={auth.name}
            >
              {auth.code}
            </span>
          ))}
        </div>
      </div>

      {/* Vertical Verification Steps */}
      <div className="space-y-3.5">
        {VERIFICATION_STEPS.map((stepItem, idx) => {
          return (
            <div key={stepItem.step} className="relative flex items-start gap-3">
              {/* Connector line between steps */}
              {idx < VERIFICATION_STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-3.5 top-7 bottom-[-14px] w-px bg-white/10"
                />
              )}
              <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-ink-900 text-xs font-bold font-mono text-brand-bright">
                {stepItem.step}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="text-xs sm:text-sm font-semibold text-white">{stepItem.title}</div>
                <div className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                  {stepItem.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grounded Guarantee Footer */}
      <div className="mt-5 border-t border-white/10 pt-3.5 text-center text-xs text-slate-300">
        <div>
          ClaimRadar does not file claims or collect official filing fees. You act on the official
          portal.
        </div>
        <div className="mt-1 text-xs text-slate-400">
          This shows our verification process. It is not a live activity feed.
        </div>
      </div>
    </div>
  );
}
