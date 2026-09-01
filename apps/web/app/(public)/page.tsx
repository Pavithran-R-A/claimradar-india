import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
import { EvidenceRadarVisual } from '@/components/landing/evidence-radar-visual';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { MonitoredSourcesNetwork } from '@/components/landing/monitored-sources-network';
import { EditorialPrinciples } from '@/components/landing/editorial-principles';
import { AccountCta } from '@/components/landing/account-cta';
import { ClaimableCard, ClaimableRow } from '@/components/directory/claimable-card';
import { DemoDataBanner, EmptyDirectoryNotice } from '@/components/repository-states';
import { getPublishedClaimables } from '@/lib/claimables-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ClaimRadar India — Grounded Refund, Compensation & Claim Opportunities',
  description:
    'ClaimRadar India discovers, verifies, and structures refund, compensation and claim opportunities from official Indian regulatory and government notices.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ClaimRadar India — Grounded Refund, Compensation & Claim Opportunities',
    description:
      'ClaimRadar India discovers, verifies, and structures refund, compensation and claim opportunities from official Indian regulatory and government notices.',
    url: '/',
    type: 'website',
  },
};

const FAQ_ITEMS = [
  {
    question: 'What is ClaimRadar India?',
    answer:
      'ClaimRadar is an independent information instrument that monitors official Indian statutory sources (such as SEBI, RBI, IBBI, TRAI, and PIB press releases) for public refund, compensation, and claims notices. We explain who may be affected and direct users to official portals. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government portal or legal representative?',
    answer:
      'No. ClaimRadar is strictly an independent information service. We are not affiliated with the Government of India, any court, tribunal, regulator, law firm, or listed company. We link directly to authentic official authority sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive a refund or compensation?',
    answer:
      'No. We surface potential opportunities based on official regulatory announcements and government notices. Whether you qualify or receive compensation depends strictly on the official eligibility criteria, your submitted evidence, and the official scheme process.',
  },
  {
    question: 'How does ClaimRadar discover and verify opportunities?',
    answer:
      'We continuously monitor statutory regulators (SEBI, RBI), insolvency authorities (IBBI), telecom regulation (TRAI), and government press releases (PIB). Every extracted candidate undergoes strict human editorial verification before publication — zero automated or speculative placeholder listings.',
  },
  {
    question: 'How do I submit a correction or update for a listing?',
    answer:
      'Visit our Corrections page to submit an update. Our editorial desk reviews all correction requests against the underlying official order and updates published records promptly.',
  },
];

export default async function LandingPage() {
  const [claimables] = await Promise.all([getPublishedClaimables({ limit: 200 })]);

  const ok = claimables.ok;
  const items = ok ? claimables.data.items : [];

  const latest = [...items]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 6);

  const now = Date.now();
  const closingSoon = items
    .filter((c) => c.deadlineDate && Date.parse(c.deadlineDate) >= now)
    .sort((a, b) => Date.parse(a.deadlineDate!) - Date.parse(b.deadlineDate!))
    .slice(0, 5);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  1. HERO — Search is the Hero × Secondary Signature Radar Visual   */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950 text-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-white/10">
        <div aria-hidden="true" className="hero-backdrop" />

        <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Dominant Search & Value Proposition */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Quiet Authority Identifier */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
                <span className="h-2 w-2 rounded-full bg-brand-bright" />
                <span className="tracking-widest uppercase text-slate-300 font-semibold">
                  STATUTORY INTELLIGENCE DESK
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">INDIA</span>
              </div>

              {/* Primary Customer Value Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                Search whether money may be owed to you.
              </h1>

              {/* Concise Supporting Copy */}
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
                ClaimRadar monitors official Indian regulatory orders, insolvency announcements, and
                government gazettes to extract grounded claims and refund opportunities.
              </p>

              {/* Dominant Search Input Experience */}
              <div className="mt-8 w-full max-w-2xl">
                <InteractiveHeroSearch />
              </div>

              {/* Understated Independence & Navigation Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="h-4 w-4 text-brand-bright" />
                  Independent service
                </span>
                <span className="text-slate-600">•</span>
                <Link
                  href="/claimables"
                  className="text-brand-bright hover:text-white font-semibold transition-colors"
                >
                  {items.length > 0
                    ? `Browse all verified notices (${items.length})`
                    : 'Browse verified notices'}
                </Link>
                <span className="text-slate-600">•</span>
                <Link href="/editorial-policy" className="hover:text-slate-200 transition-colors">
                  Editorial standards
                </Link>
              </div>
            </div>

            {/* Right Column: Secondary Signature Radar Instrument */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <EvidenceRadarVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Demo data banner when using fallback data */}
      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  2. LATEST VERIFIED OPPORTUNITIES (OR TRUTHFUL EDITORIAL EMPTY STATE)*/}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="latest-opps-heading"
      >
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end mb-8 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verified Ingestion Feed
            </span>
            <h2
              id="latest-opps-heading"
              className="mt-1 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight"
            >
              Latest Verified Opportunities
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Extracted from official regulatory orders, public notifications, and government
              gazettes.
            </p>
          </div>
          <Link
            href="/claimables"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:text-trust-primary-hover shrink-0"
          >
            <span>{items.length > 0 ? `View directory (${items.length})` : 'View directory'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <ClaimableCard key={item.id} claim={item} />
            ))}
          </div>
        ) : (
          <EmptyDirectoryNotice
            title="No verified public claim is ready today."
            body="ClaimRadar actively monitors notices from official statutory authorities (SEBI, RBI, IBBI, TRAI, and PIB). We deliberately leave this directory empty rather than publish speculative or unverified claims."
            showActions={true}
          />
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  3. CLOSING SOON (IF ACTIVE TIME-SENSITIVE CLAIMS EXIST)           */}
      {/* ------------------------------------------------------------------ */}
      {closingSoon.length > 0 && (
        <section
          className="border-t border-border bg-surface-strong/40 py-14"
          aria-labelledby="closing-soon-heading"
        >
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end mb-8 border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Time-Sensitive Windows
                </span>
                <h2
                  id="closing-soon-heading"
                  className="mt-1 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight"
                >
                  Closing Soon
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Official claim submission windows with upcoming statutory deadlines.
                </p>
              </div>
              <Link
                href="/closing-soon"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-400 hover:opacity-80 shrink-0"
              >
                <span>All upcoming deadlines</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {closingSoon.map((item) => (
                <ClaimableRow key={item.id} claim={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  4. HOW CLAIMRADAR KNOWS — Compact Evidence Pipeline Narrative     */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-t border-border bg-surface-strong/20 py-16"
        aria-labelledby="verification-pipeline-heading"
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verification Methodology
            </span>
            <h2
              id="verification-pipeline-heading"
              className="mt-1 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight"
            >
              How ClaimRadar Knows
            </h2>
            <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
              Every listing traces back through four strict verification stages from official source
              ingestion to direct portal submission.
            </p>
          </div>

          <EvidenceFlowDiagram />

          <div className="mt-8 flex items-center justify-between text-xs text-text-muted">
            <span>Deterministic verification • Human editorial review</span>
            <Link
              href="/methodology"
              className="font-bold text-trust-primary hover:underline flex items-center gap-1"
            >
              Read technical methodology <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  5. OFFICIAL SOURCES WE MONITOR — Refined Regulatory Ledger        */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
        aria-labelledby="source-network-heading"
      >
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
            Statutory Ingestion
          </span>
          <h2
            id="source-network-heading"
            className="mt-1 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight"
          >
            Official Sources We Monitor
          </h2>
          <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
            ClaimRadar continuously interfaces with authenticated statutory portals, insolvency
            authorities, securities regulators, and central government bureaus across India.
          </p>
        </div>

        <MonitoredSourcesNetwork />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  6. EDITORIAL MANIFESTO — "Why ClaimRadar Publishes Less, Not More"*/}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
        <EditorialPrinciples />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  7. WATCHLIST & ALERT SUBSCRIPTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <AccountCta />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  8. FAQ — Clean 2-Column Typographic Layout                        */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
        aria-labelledby="faq-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Clear Answers
            </span>
            <h2
              id="faq-heading"
              className="mt-1 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Common questions regarding our independence, data sources, and how to verify
              information directly.
            </p>
            <div className="mt-6">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:underline"
              >
                <span>View complete FAQ directory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>
    </>
  );
}
