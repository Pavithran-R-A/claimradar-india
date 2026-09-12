'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { brandConfig } from '@claimradar/config';

export function EditorialPrinciples() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Manifesto Headline */}
        <div className="lg:col-span-5">
          <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
            Our Standard
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight leading-snug">
            Why {brandConfig.siteName} Publishes Less, Not More.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-text-secondary">
            Public financial notices can be difficult to find and interpret. {brandConfig.siteName}{' '}
            organizes the record around clear eligibility, evidence, and next steps.
          </p>
          <div className="mt-6">
            <Link
              href="/editorial-policy"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:underline"
            >
              <span>Read our complete editorial policy</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Clear Pillars (Hairline dividers, no heavy card stacks) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-border pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-bold text-trust-primary">01</span>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Grounded in Configured Official Source Records
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  We do not publish rumors, social media claims, or press speculation. Each public
                  notice is tied to a record from our configured official source families.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border pb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-bold text-trust-primary">02</span>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Strict Zero-Speculation Publication Gate
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  If a source record does not state a clear public action, eligibility, or deadline,
                  we do not present it as a claim opportunity. A smaller directory is better than
                  misleading one citizen.
                </p>
              </div>
            </div>
          </div>

          <div className="pb-2">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm font-bold text-trust-primary">03</span>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Direct Official Action, No Legal Intermediation
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  We do not take cuts, manage escrow, or file claims on your behalf. We direct you
                  to the official route named in the source record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
