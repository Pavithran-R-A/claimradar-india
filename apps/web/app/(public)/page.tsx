import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Users, ShieldCheck } from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
import { EvidenceRadarVisual } from '@/components/landing/evidence-radar-visual';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { MonitoredSourcesNetwork } from '@/components/landing/monitored-sources-network';
import { EditorialPrinciples } from '@/components/landing/editorial-principles';
import { AccountCta } from '@/components/landing/account-cta';
import { ClaimableCard, ClaimableRow } from '@/components/directory/claimable-card';
import { DemoDataBanner, EmptyDirectoryNotice } from '@/components/repository-states';
import { Button } from '@claimradar/design-system';
import {
  getPublishedClaimables,
  getPublishedCompanies,
  getPublishedSectors,
} from '@/lib/claimables-repository';

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
      'ClaimRadar is an independent information service that monitors official Indian statutory sources (such as SEBI, RBI, IBBI, TRAI, and PIB press releases) for public refund, compensation, and claims notices. We explain who may be affected and direct users to official portals. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government portal or legal representative?',
    answer:
      'No. ClaimRadar is strictly an independent platform. We are not affiliated with the Government of India, any court, tribunal, regulator, law firm, or listed company. We link directly to official authority sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive a refund or compensation?',
    answer:
      'No. We surface potential opportunities based on official regulatory announcements and government notices. Whether you qualify or receive compensation depends strictly on the official eligibility criteria, your submitted evidence, and the official scheme process.',
  },
  {
    question: 'How does ClaimRadar discover and verify opportunities?',
    answer:
      'We continuously monitor statutory regulators (SEBI, RBI), insolvency authorities (IBBI), telecom regulation (TRAI), and government press releases (PIB). Every extracted candidate undergoes strict human editorial verification before publication — zero automated or placeholder listings.',
  },
  {
    question: 'How do I submit a correction or update for a listing?',
    answer:
      'Visit our Corrections page to submit an update. Our editorial desk reviews all correction requests against the underlying official order and updates published records promptly.',
  },
];

export default async function LandingPage() {
  const [claimables, sectorsOutcome, companiesOutcome] = await Promise.all([
    getPublishedClaimables({ limit: 200 }),
    getPublishedSectors(),
    getPublishedCompanies(),
  ]);

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

  const activeSectors = sectorsOutcome.ok
    ? sectorsOutcome.data.filter((s) => s.activeClaimCount > 0).slice(0, 8)
    : [];
  const activeCompanies = companiesOutcome.ok
    ? companiesOutcome.data.filter((c) => c.activeClaimCount > 0).slice(0, 8)
    : [];

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  1. HERO — Asymmetric "Evidence Radar" Composition                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950 text-white pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div aria-hidden="true" className="hero-backdrop" />

        <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Customer Messaging & Search */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Civic Service Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-bright/30 bg-brand-bright/10 px-3.5 py-1 text-xs font-semibold text-brand-bright">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Independent claims information service</span>
              </div>

              {/* Primary Customer Headline */}
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl text-white">
                Money you may be owed shouldn&apos;t stay hidden.
              </h1>

              {/* Supporting Copy */}
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
                ClaimRadar discovers public refund and compensation notices from official Indian
                regulatory and government sources, verifies the evidence, and shows you where to act
                directly.
              </p>

              {/* Large Search Input Experience */}
              <div className="mt-8 w-full max-w-2xl">
                <InteractiveHeroSearch />
              </div>

              {/* Secondary Navigation Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
                <Link
                  href="/claimables"
                  className="inline-flex items-center gap-1.5 text-brand-bright hover:text-white transition-colors"
                >
                  <span>
                    {items.length > 0
                      ? `Browse all verified notices (${items.length})`
                      : 'Browse verified notices'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="text-slate-600">•</span>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How verification works
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Radar Instrument */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <EvidenceRadarVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  2. TRUST STRIP — Unmissable Editorial Trust Boundary              */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-y border-border bg-surface-strong/70 py-4"
        aria-label="Trust and Independence Notice"
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 font-semibold text-text-primary">
              <ShieldCheck className="h-5 w-5 text-trust-primary shrink-0" />
              <span>
                <strong>Independent service: </strong>
                Every listing links back to an authentic official source. We do not decide
                eligibility or file claims for you.
              </span>
            </div>
            <Link
              href="/editorial-policy"
              className="font-bold text-trust-primary hover:text-trust-primary-hover shrink-0 underline"
            >
              Our standards →
            </Link>
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
      {/*  3. PRIMARY PRODUCT — Latest Verified Opportunities Feed            */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="latest-opps-heading"
      >
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verified notices
            </span>
            <h2
              id="latest-opps-heading"
              className="mt-1 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
            >
              Latest Verified Opportunities
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Opportunities verified against official regulatory orders, public notifications, and
              government releases.
            </p>
          </div>
          <Link
            href="/claimables"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-trust-primary hover:text-trust-primary-hover"
          >
            <span>{items.length > 0 ? `View directory (${items.length})` : 'View directory'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <ClaimableCard key={item.id} claim={item} />
            ))}
          </div>
        ) : (
          <EmptyDirectoryNotice
            title="No opportunity has cleared publication review yet"
            body="ClaimRadar actively monitors notices from official statutory and government authorities (SEBI, RBI, IBBI, TRAI, and PIB). We deliberately leave this directory empty rather than publish speculative or unverified claims."
            showActions={true}
          />
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  4. CLOSING SOON — Approaching Submission Windows                  */}
      {/* ------------------------------------------------------------------ */}
      {closingSoon.length > 0 && (
        <section
          className="border-t border-border bg-surface-strong/40 py-14"
          aria-labelledby="closing-soon-heading"
        >
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Time-Sensitive Notices
                </span>
                <h2
                  id="closing-soon-heading"
                  className="mt-1 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
                >
                  Closing Soon
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Official claim submission windows with upcoming deadlines. Confirm all
                  requirements on official portals.
                </p>
              </div>
              <Link
                href="/closing-soon"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-400 hover:opacity-80"
              >
                <span>View all deadlines</span>
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
      {/*  5. ACTIVE SECTORS & COMPANIES                                     */}
      {/* ------------------------------------------------------------------ */}
      {(activeSectors.length > 0 || activeCompanies.length > 0) && (
        <section className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 border-t border-border">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Sectors */}
            {activeSectors.length > 0 && (
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                    <Building2 className="h-5 w-5 text-trust-primary" />
                    <span>Browse by Sector</span>
                  </h3>
                  <Link
                    href="/sectors"
                    className="text-xs font-bold text-trust-primary hover:underline"
                  >
                    All Sectors →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {activeSectors.map((sector) => (
                    <Link
                      key={sector.slug}
                      href={`/sectors/${sector.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all duration-150 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                    >
                      <span className="text-sm font-bold text-text-primary group-hover:text-trust-primary">
                        {sector.name}
                      </span>
                      <span className="mt-1 text-xs text-text-muted">
                        {sector.activeClaimCount}{' '}
                        {sector.activeClaimCount === 1 ? 'record' : 'records'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Companies */}
            {activeCompanies.length > 0 && (
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                    <Users className="h-5 w-5 text-trust-primary" />
                    <span>Browse by Entity / Company</span>
                  </h3>
                  <Link
                    href="/companies"
                    className="text-xs font-bold text-trust-primary hover:underline"
                  >
                    All Companies →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {activeCompanies.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/companies/${comp.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all duration-150 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                    >
                      <span className="text-sm font-bold text-text-primary group-hover:text-trust-primary">
                        {comp.name}
                      </span>
                      <span className="mt-1 text-xs text-text-muted">
                        {comp.activeClaimCount} {comp.activeClaimCount === 1 ? 'record' : 'records'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  6. VERIFICATION PROCESS — Continuous Evidence Pipeline Trail      */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="border-t border-border bg-surface-strong/30 py-16"
        aria-labelledby="verification-pipeline-heading"
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verification Methodology
            </span>
            <h2
              id="verification-pipeline-heading"
              className="mt-1 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
            >
              The ClaimRadar Evidence Pipeline
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Every listing traces back through strict verification stages from official source
              detection to direct official portal submission.
            </p>
          </div>

          <EvidenceFlowDiagram />

          <div className="mt-10 text-center">
            <Link href="/methodology">
              <Button variant="outline" size="default" className="rounded-lg">
                <span>Read our complete technical verification methodology</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  7. MONITORED SOURCE NETWORK                                       */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
        aria-labelledby="source-network-heading"
      >
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
            Official Sources
          </span>
          <h2
            id="source-network-heading"
            className="mt-1 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
          >
            Official Sources We Monitor
          </h2>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            ClaimRadar interfaces with authenticated statutory portals, insolvency authorities,
            securities regulators, and central government bureaus across India.
          </p>
        </div>

        <MonitoredSourcesNetwork />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  8. EDITORIAL PRINCIPLES — "Why ClaimRadar Publishes Less, Not More"*/}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <EditorialPrinciples />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  9. ACCOUNT & WATCHLIST CTA                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <AccountCta />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  10. FAQ — 2-Column Editorial Layout                               */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
        aria-labelledby="faq-heading"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Clear Answers
            </span>
            <h2
              id="faq-heading"
              className="mt-1 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight"
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
                View complete FAQ directory <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Accessible Accordion */}
          <div className="lg:col-span-7">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>
    </>
  );
}
