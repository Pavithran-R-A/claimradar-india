'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const PRINCIPLES = [
  {
    title: '1. Official-Source Mandate',
    body: 'Every listing requires an authentic official order or regulatory publication. We never publish speculative rumors or unverified social media claims.',
  },
  {
    title: '2. Zero Automated Publishing',
    body: 'Algorithms discover documents, but human editors verify claim terms, eligibility constraints, and direct portal links before any public publication.',
  },
  {
    title: '3. Transparent Disclaimers & Independence',
    body: 'We are an independent technology service. We never pretend to be a government body, we do not decide eligibility, and we never collect claim filing fees.',
  },
  {
    title: '4. Rapid Correction & Update Policy',
    body: 'If an official deadline changes, a portal updates, or an error is identified, our editorial desk updates or archives records immediately.',
  },
];

export function EditorialPrinciples() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-trust-primary mb-2">
            <ShieldCheck className="h-4 w-4" />
            Editorial Rigor
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary leading-tight">
            Why ClaimRadar publishes less, not more.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            In financial and legal notices, false signals cause real harm. We deliberately enforce
            strict editorial filters so every record in our directory is genuine, grounded in an
            official order, and actionable.
          </p>
          <div className="mt-6">
            <Link
              href="/editorial-policy"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary hover:underline"
            >
              Read our full Editorial Policy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border border-border/80 bg-surface-strong p-4">
              <h3 className="text-sm font-bold text-text-primary">{p.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
