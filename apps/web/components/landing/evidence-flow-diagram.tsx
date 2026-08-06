'use client';

import * as React from 'react';
import {
  Landmark,
  FileCheck2,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Official Notice Monitoring',
    icon: Landmark,
    description:
      'Continuous monitoring of SEBI, RBI, PIB, consumer forums, and public corporate announcements.',
    tag: 'Official Sources',
  },
  {
    step: '02',
    title: 'Structured Evidence Extraction',
    icon: FileCheck2,
    description:
      'Deterministic extraction of affected groups, compensation terms, evidence required, and deadlines.',
    tag: 'Grounded Data',
  },
  {
    step: '03',
    title: 'Human Editorial Review',
    icon: UserCheck,
    description:
      'Strict editorial review and verification before any opportunity is published publicly.',
    tag: 'Editorial Control',
  },
  {
    step: '04',
    title: 'Direct Official Action Route',
    icon: ExternalLink,
    description:
      'Clear guidance surfacing exact official portals, forms, and deadlines to act directly.',
    tag: 'Direct Action',
  },
];

export function EvidenceFlowDiagram() {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-trust-primary/20 bg-trust-primary/10 px-3.5 py-1 text-xs font-semibold text-trust-primary mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Transparency & Methodology
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          From Official Source to Direct User Action
        </h2>
        <p className="mt-4 text-base text-text-secondary">
          How ClaimRadar discovers, structures, and verifies claim opportunities across India.
        </p>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === activeStep;
          return (
            <div
              key={item.step}
              onClick={() => setActiveStep(idx)}
              className={`group relative cursor-pointer rounded-card border p-6 transition-all duration-300 ${
                isActive
                  ? 'border-trust-primary bg-surface shadow-lift ring-1 ring-trust-primary/30'
                  : 'border-border bg-surface/60 hover:border-trust-primary/40 hover:bg-surface'
              }`}
            >
              {/* Connector line on desktop */}
              {idx < FLOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface border border-border p-1 text-text-muted">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
                  Step {item.step}
                </span>
                <span className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                  {item.tag}
                </span>
              </div>

              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-trust-primary/10 text-trust-primary group-hover:scale-105 transition-transform duration-200">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
