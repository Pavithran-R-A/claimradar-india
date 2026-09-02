import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Landmark } from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
import { EvidenceRadarVisual } from '@/components/landing/evidence-radar-visual';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { MonitoredSourcesNetwork } from '@/components/landing/monitored-sources-network';
import { EditorialPrinciples } from '@/components/landing/editorial-principles';
import { AccountCta } from '@/components/landing/account-cta';
import { ClaimableCard, ClaimableRow } from '@/components/directory/claimable-card';
import { DemoDataBanner, EmptyDirectoryNotice } from '@/components/repository-states';
import { Reveal } from '@/components/motion/reveal';
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
      'ClaimRadar is an independent public information service that monitors official Indian statutory sources (such as SEBI, RBI, IBBI, TRAI, and PIB press releases) for public refund, compensation, and claims notices. We explain who may be affected and direct users to official portals. We do not file claims on your behalf.',
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

const MONITORED_AUTHORITIES = [
  {
    code: 'SEBI',
    name: 'Securities and Exchange Board of India',
    domain: 'Securities & Investor Refunds',
  },
  { code: 'RBI', name: 'Reserve Bank of India', domain: 'Banking & Unclaimed Deposits' },
  {
    code: 'IBBI',
    name: 'Insolvency and Bankruptcy Board of India',
    domain: 'Corporate Insolvency Claims',
  },
  {
    code: 'TRAI',
    name: 'Telecom Regulatory Authority of India',
    domain: 'Consumer Directives & Refunds',
  },
  { code: 'PIB', name: 'Press Information Bureau', domain: 'Union Government Gazettes' },
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
      {/*  1. HERO — Light-First Editorial Search Hero & Source Ledger       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-background pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-border">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Dominant Left: Value Proposition & Signature Search */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Human Headline with 0ms entrance */}
              <h1 className="enter-seq-0 text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-text-primary leading-[1.15]">
                Find refunds and claims you may be entitled to.
              </h1>

              {/* Concise Supporting Copy with 70ms entrance */}
              <p className="enter-seq-1 mt-4 text-base sm:text-lg leading-relaxed text-text-secondary max-w-xl">
                Search official Indian notices from regulators and public authorities. We monitor
                government gazettes, insolvency filings, and court orders for verified claim
                opportunities.
              </p>

              {/* Dominant Search Input Experience with 140ms entrance */}
              <div className="enter-seq-2 mt-8 w-full max-w-2xl">
                <InteractiveHeroSearch />
              </div>

              {/* Understated Independence & Navigation Links with 210ms entrance */}
              <div className="enter-seq-3 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-text-muted">
                <span className="flex items-center gap-1.5 text-text-secondary font-medium">
                  <ShieldCheck className="h-4 w-4 text-trust-primary" />
                  Independent service
                </span>
                <span className="text-border" aria-hidden>
                  •
                </span>
                <Link
                  href="/claimables"
                  className="text-trust-primary hover:underline font-semibold transition-colors duration-fast"
                >
                  {items.length > 0
                    ? `Browse all verified notices (${items.length})`
                    : 'Browse verified notices'}
                </Link>
                <span className="text-border" aria-hidden>
                  •
                </span>
                <Link
                  href="/editorial-policy"
                  className="text-text-muted hover:text-text-primary transition-colors duration-fast"
                >
                  Editorial standards
                </Link>
              </div>
            </div>

            {/* Right: Restrained Official Source Ledger with 260ms entrance */}
            <div className="enter-seq-4 lg:col-span-5 w-full">
              <div className="rounded-md border border-border bg-surface p-5 shadow-xs transition-colors duration-fast hover:border-border/90">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-trust-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      Monitored Official Sources
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">India</span>
                </div>

                <div className="divide-y divide-border/60">
                  {MONITORED_AUTHORITIES.map((auth, idx) => (
                    <div
                      key={auth.code}
                      className={`enter-seq-${5 + Math.min(idx, 2)} group relative flex items-center justify-between py-2.5 px-2 rounded -mx-2 text-xs transition-all duration-fast hover:bg-surface-strong/70`}
                    >
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-trust-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-fast origin-center" />
                      <div className="flex items-center gap-2 min-w-0 pr-2 transition-transform duration-fast group-hover:translate-x-1">
                        <span className="font-bold text-text-primary shrink-0">{auth.code}</span>
                        <span className="text-text-muted truncate hidden sm:inline">
                          {auth.name}
                        </span>
                      </div>
                      <span className="text-text-secondary font-medium text-right shrink-0">
                        {auth.domain}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <span>Continuous statutory indexing</span>
                  <Link
                    href="/sources"
                    className="font-semibold text-trust-primary hover:underline transition-colors duration-fast"
                  >
                    All sources →
                  </Link>
                </div>
              </div>
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
      {/*  2. VERIFIED OPPORTUNITIES (OR TRUTHFUL EDITORIAL EMPTY STATE)     */}
      {/* ------------------------------------------------------------------ */}
      <Reveal
        as="section"
        className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="latest-opps-heading"
      >
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end mb-8 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verified Notices
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
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:text-trust-primary-hover shrink-0 transition-colors duration-fast"
          >
            <span>{items.length > 0 ? `View directory (${items.length})` : 'View directory'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <ClaimableCard key={item.id} claim={item} />
            ))}
          </div>
        ) : (
          <EmptyDirectoryNotice />
        )}
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  3. CLOSING SOON STATUTORY DEADLINES                               */}
      {/* ------------------------------------------------------------------ */}
      {closingSoon.length > 0 && (
        <Reveal as="section" className="border-t border-border bg-surface-strong/30 py-14">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-deadline">
                  Statutory Windows
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary tracking-tight">
                  Closing Soon
                </h2>
              </div>
              <Link
                href="/closing-soon"
                className="group text-xs sm:text-sm font-semibold text-trust-primary hover:underline flex items-center gap-1"
              >
                <span>View all deadlines</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="divide-y divide-border rounded-md border border-border bg-surface shadow-xs">
              {closingSoon.map((item) => (
                <ClaimableRow key={item.id} claim={item} />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  4. METHODOLOGY & RADAR SECTION — Relocated Scientific Diagram     */}
      {/* ------------------------------------------------------------------ */}
      <Reveal as="section" className="border-t border-border bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: 4-Stage Precision Pipeline Narrative */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
                Verification Methodology
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-text-primary tracking-tight">
                How ClaimRadar verifies an official notice.
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-secondary max-w-2xl">
                Every record in our public index undergoes strict human and cryptographic
                verification against primary Indian regulatory endpoints before publication.
              </p>

              <div className="mt-8 w-full">
                <EvidenceFlowDiagram />
              </div>
            </div>

            {/* Right: Relocated Scientific Radar Visual */}
            <div className="lg:col-span-5 flex justify-center w-full lg:pt-2">
              <EvidenceRadarVisual />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  5. MONITORED AUTHORITIES NETWORK                                  */}
      {/* ------------------------------------------------------------------ */}
      <Reveal as="section" className="border-t border-border bg-background py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Authoritative Coverage
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
              Monitored Indian Regulatory Authorities
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              We track primary regulatory dispatches, gazette notifications, and tribunal orders
              across union and state authorities.
            </p>
          </div>
          <MonitoredSourcesNetwork />
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  6. EDITORIAL MANIFESTO                                            */}
      {/* ------------------------------------------------------------------ */}
      <Reveal as="section" className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <EditorialPrinciples />
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  7. WATCHLIST ALERT CTA                                            */}
      {/* ------------------------------------------------------------------ */}
      <Reveal as="section" className="border-t border-border bg-background py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <AccountCta />
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  8. FREQUENTLY ASKED QUESTIONS                                     */}
      {/* ------------------------------------------------------------------ */}
      <Reveal as="section" className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
                Public FAQ
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Clear facts on our public directory, independence, and verification standards.
              </p>
            </div>
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </Reveal>
    </>
  );
}
