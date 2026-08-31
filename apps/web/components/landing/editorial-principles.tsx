'use client';

import * as React from 'react';
import { Eye, Lock, FileCheck, XCircle } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: XCircle,
    title: 'Zero Speculative Listings',
    description:
      'We reject unverified rumors, social media claims, and uncorroborated blog posts. Every listing must point directly to a verifiable official gazette or regulatory order.',
  },
  {
    icon: FileCheck,
    title: 'Strict Human Verification',
    description:
      'Zero auto-publishing algorithms. An editorial specialist reads every underlying official notice, confirms eligibility criteria, and verifies filing channels.',
  },
  {
    icon: Lock,
    title: 'Zero Intermediary Representation',
    description:
      'We never take a cut of your claim, charge commissions, or act as legal proxies. We point you directly to the official government filing portal.',
  },
  {
    icon: Eye,
    title: 'Transparent Provenance',
    description:
      'Every claim dossier lists the original regulator order number, publishing authority, date of gazette notification, and direct source link.',
  },
];

export function EditorialPrinciples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PRINCIPLES.map((principle) => {
        const Icon = principle.icon;
        return (
          <div
            key={principle.title}
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card transition-all duration-150 hover:shadow-lift"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-trust-primary/10 text-trust-primary border border-trust-primary/20">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                {principle.title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                {principle.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
