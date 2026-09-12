'use client';

import * as React from 'react';
import Link from 'next/link';
import { Scale, ArrowRight } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 rounded border border-trust-primary/20 bg-trust-primary/10 px-3.5 py-1 text-xs font-bold text-trust-primary mb-3">
          <Scale className="h-4 w-4" />
          Technical Standards
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-primary tracking-tight">
          Verification Methodology
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
          The principles, cryptographic provenance checks, and editorial standards governing every
          record published on ClaimKhoj India.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              1. Deterministic Source Ingestion
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              We ingest public notifications using deterministic crawler workers that target
              configured public source families. Each crawled document is hashed (SHA-256) and
              paired with its canonical HTTP source URL and server timestamp. This ensures every
              extracted datum has an auditable origin trail.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              2. Structured Parameter Extraction
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Legal documents are parsed into structured database candidate entities consisting of:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base text-text-secondary space-y-2">
              <li>
                <strong className="text-text-primary">Entity Identification:</strong> Exact legal
                corporate name, CIN, or regulatory registration identifier.
              </li>
              <li>
                <strong className="text-text-primary">Affected Scope:</strong> Clearly bounded group
                of consumers, investors, or creditors.
              </li>
              <li>
                <strong className="text-text-primary">Submission Deadline:</strong> Explicit cutoff
                date parsed in Indian Standard Time (IST).
              </li>
              <li>
                <strong className="text-text-primary">Action Portal:</strong> The direct HTTPS
                endpoint hosted by the official regulator or statutory administrator.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">3. The Human Editorial Gate</h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Automated extraction alone is never trusted for publication. A trained editorial
              reviewer manually compares each candidate record against the official order text. A
              record is only marked{' '}
              <code className="rounded bg-surface-strong px-1.5 py-0.5 text-xs">
                is_published = true
              </code>{' '}
              when:
            </p>
            <ol className="list-decimal pl-5 text-sm sm:text-base text-text-secondary space-y-2">
              <li>The source URL resolves to an authentic government or regulatory domain.</li>
              <li>
                The claim action route is active and does not charge unofficial intermediary fees.
              </li>
              <li>
                The eligibility summary accurately reflects the official criteria without hyperbole.
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              4. Freshness and Lifecycle Tracking
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Records in ClaimKhoj undergo regular re-verification sweeps. If an official deadline
              passes, the record status transitions immediately to{' '}
              <code className="rounded bg-surface-strong px-1.5 py-0.5 text-xs">closed</code> or{' '}
              <code className="rounded bg-surface-strong px-1.5 py-0.5 text-xs">expired</code>. If a
              deadline is officially extended by a court, the record is updated with an editorial
              change note.
            </p>
          </section>
        </div>

        {/* Right Rail: Principles Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-3">Editorial Tenets</h3>
            <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
              <div className="rounded-lg border border-border/80 bg-surface-strong p-3">
                <strong className="text-text-primary block mb-1">Zero Speculation</strong>
                We never publish unverified rumors, leak blogs, or social media speculation.
              </div>
              <div className="rounded-lg border border-border/80 bg-surface-strong p-3">
                <strong className="text-text-primary block mb-1">Direct Official Links</strong>
                Every listing must point to the legitimate government or official committee portal.
              </div>
              <div className="rounded-lg border border-border/80 bg-surface-strong p-3">
                <strong className="text-text-primary block mb-1">Rapid Correction</strong>
                Community and legal correction requests are reviewed promptly by our desk.
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link
                href="/corrections"
                className="inline-flex items-center gap-1 text-xs font-bold text-trust-primary hover:underline"
              >
                Submit a correction <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
