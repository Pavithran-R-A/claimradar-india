'use client';

import * as React from 'react';
import { MonitoredSourcesNetwork } from '@/components/landing/monitored-sources-network';
import { ArrowRight, Landmark } from 'lucide-react';

const supportEmail = 'support@claimradar.in';

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-trust-primary/20 bg-trust-primary/10 px-3.5 py-1 text-xs font-bold text-trust-primary mb-3">
          <Landmark className="h-4 w-4" />
          Official Coverage
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
          Monitored Sources &amp; Regulators
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
          ClaimRadar continuously interfaces with authenticated public feeds and gazettes across
          India. Below is the active coverage matrix.
        </p>
      </header>

      {/* Monitored Sources Network */}
      <section className="mb-16">
        <MonitoredSourcesNetwork />
      </section>

      {/* Coverage Disclaimer */}
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm max-w-3xl mx-auto text-center">
        <h2 className="text-lg font-bold text-text-primary mb-2">Suggest an Official Source</h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
          If there is an authentic public tribunal or regulator portal you believe our automated
          ingestion desk should monitor, let our editorial team know.
        </p>
        <a
          href={`mailto:${supportEmail}?subject=Official%20Source%20Suggestion`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:underline"
        >
          Contact Editorial Desk ({supportEmail}) <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
