'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { Button } from '@claimradar/design-system';

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-trust-primary/20 bg-trust-primary/10 px-3.5 py-1 text-xs font-bold text-trust-primary mb-3">
          <ShieldCheck className="h-4 w-4" />
          Consumer Guide
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
          How ClaimRadar Works
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed">
          From official court notices to your direct action: how we discover, verify, structure, and
          surface public refund and compensation schemes across India without middlemen or fees.
        </p>
      </header>

      {/* Step by Step Walkthrough */}
      <section className="space-y-6 mb-16">
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-primary text-white font-bold text-base">
              01
            </span>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Continuous Monitoring of Official Indian Sources
              </h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Our ingestion pipelines monitor public notices, press releases, gazette
                notifications, and regulatory orders from statutory authorities including SEBI, RBI,
                IBBI, TRAI, and PIB. We do not crawl unverified blogs or social media rumors.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-primary text-white font-bold text-base">
              02
            </span>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Structured Evidence Extraction &amp; Integrity Check
              </h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                When an order or refund scheme is discovered, our systems extract deterministic
                parameters: affected groups, eligible dates, compensation terms, required proofs,
                and the official portal endpoint. The original PDF or order text is checked directly
                against the regulator&apos;s server.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-primary text-white font-bold text-base">
              03
            </span>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Human Editorial Review Gate</h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                No record is ever published automatically. ClaimRadar editors verify every extracted
                fact against the primary source document. Only records that meet our strict
                verification criteria are approved for the public directory.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-primary text-white font-bold text-base">
              04
            </span>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Direct Official Action — No Middlemen, No Fees
              </h2>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Every listing surfaces the authentic official submission route. You submit your
                claim directly on the official regulator or court committee website. ClaimRadar
                never files claims for you, never takes a percentage, and never asks for bank
                account details or Aadhaar numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Section */}
      <section className="mb-16 rounded-2xl border border-border bg-surface-strong/40 p-6 sm:p-10">
        <h2 className="text-2xl font-extrabold text-text-primary mb-6">
          The 7-Stage Evidence Pipeline
        </h2>
        <EvidenceFlowDiagram />
      </section>

      {/* What ClaimRadar Does and Does NOT Do */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-4">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-lg">What ClaimRadar Does</h2>
          </div>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Monitors official Indian regulators, courts, and gazette releases daily.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Translates complex legal notices into plain, clear English.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Links directly to authentic authority portals where you submit for free.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Alerts you when relevant notices match your watchlist.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold mb-4">
            <XCircle className="h-5 w-5" />
            <h2 className="text-lg">What ClaimRadar Does NOT Do</h2>
          </div>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>We do NOT file claims, collect fees, or take cuts of refunds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>We do NOT decide your legal eligibility — only the official scheme does.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>We do NOT collect Aadhaar, PAN, bank credentials, or private IDs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <span>We are NOT affiliated with any government agency or law firm.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-border bg-ink-950 p-8 sm:p-12 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
          Explore Active Opportunities Now
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
          Browse verified listings in our directory or create your free watchlist to receive alerts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/claimables">
            <Button variant="signal" size="lg" className="rounded-xl font-bold">
              <span>Browse directory</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Create free alert account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
