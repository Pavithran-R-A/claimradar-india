import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  Radar,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { ClaimableCard, ClaimableRow } from '@/components/directory/claimable-card';
import { Reveal } from '@/components/directory/reveal';
import { DemoDataBanner, EmptyDirectoryNotice } from '@/components/repository-states';
import {
  getPublishedClaimables,
  getPublishedCompanies,
  getPublishedSectors,
} from '@/lib/claimables-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ClaimRadar India — Grounded Refund, Compensation & Claim Opportunities',
  description:
    'ClaimRadar India discovers and structures refund, compensation and claim opportunities from official Indian sources — regulators, courts and public notices.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ClaimRadar India — Grounded Refund, Compensation & Claim Opportunities',
    description:
      'ClaimRadar India discovers and structures refund, compensation and claim opportunities from official Indian sources.',
    url: '/',
    type: 'website',
  },
};

const faqItems = [
  {
    question: 'What is ClaimRadar India?',
    answer:
      'ClaimRadar is an independent information platform that monitors publicly available refund, compensation and claim opportunities from official sources in India. We explain who may be affected and direct users to official portals. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government website or legal representative?',
    answer:
      'No. ClaimRadar is an independent platform. We are not affiliated with the Government of India, any court, regulator, law firm, or listed company. We link directly to official sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive a refund or compensation?',
    answer:
      'No. We surface potential opportunities based on official announcements and public records. Whether you qualify or receive a refund depends strictly on official criteria, your evidence, and the official scheme process.',
  },
  {
    question: 'How does ClaimRadar discover and verify opportunities?',
    answer:
      'We continuously monitor consumer authorities, courts and tribunals, financial regulators (SEBI, RBI), company public notices, and government press releases (PIB). Extracted data undergoes human editorial verification before publication.',
  },
  {
    question: 'How do I report an error or outdated information?',
    answer:
      'Visit our Corrections page to submit a report. Our editorial team reviews all correction requests and updates published records promptly when verified.',
  },
];

const STATUS_EXPLAINERS = [
  {
    status: 'Open',
    icon: CheckCircle2,
    tone: 'text-success',
    body: 'The official process is active and accepting submissions based on the latest source checked.',
  },
  {
    status: 'Closing soon',
    icon: CalendarClock,
    tone: 'text-deadline',
    body: 'A published deadline is approaching. Dates are displayed in IST — confirm on official portals before acting.',
  },
  {
    status: 'Under review',
    icon: Eye,
    tone: 'text-info',
    body: 'Official notice detected; currently undergoing editorial verification of scope, criteria, and official links.',
  },
  {
    status: 'Closed',
    icon: ShieldCheck,
    tone: 'text-text-muted',
    body: 'The official submission window has concluded. Records are preserved for transparency and reference.',
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

  const sectors = sectorsOutcome.ok ? sectorsOutcome.data.slice(0, 8) : [];
  const companies = companiesOutcome.ok ? companiesOutcome.data.slice(0, 8) : [];

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  Hero — "Evidence in Motion" deep ink canvas with fluid aura glow */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div aria-hidden className="hero-backdrop" />

        <div className="relative mx-auto max-w-content px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="anim-rise inline-flex items-center gap-2 rounded-full border border-brand-bright/30 bg-brand-bright/10 px-4 py-1.5 text-xs font-semibold text-brand-bright backdrop-blur-md">
              <Radar aria-hidden className="h-3.5 w-3.5" />
              Independent Information Directory — India
            </div>

            <h1 className="anim-rise anim-delay-1 mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find refunds, compensation, and public claim opportunities in India.
            </h1>

            <p className="anim-rise anim-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              ClaimRadar monitors official sources and explains who may be affected, what official
              information says, and where to verify or act directly.
            </p>

            {/* Central Interactive Search Experience */}
            <div className="anim-rise anim-delay-3 mt-10">
              <InteractiveHeroSearch />
            </div>

            {/* Trust disclaimer badge */}
            <p className="anim-rise anim-delay-4 mt-8 text-xs font-medium text-slate-400">
              Independent information platform. Not a government portal, court, or law firm.
            </p>
          </div>
        </div>

        {/* Seamless visual transition curve to off-white canvas */}
        <div className="h-12 w-full bg-gradient-to-b from-ink-950 to-background opacity-90" />
      </section>

      {/* Demo data notice banner when using fallback mock data */}
      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Section: Evidence Flow Diagram ("Source to Opportunity Flow")   */}
      {/* ------------------------------------------------------------------ */}
      <Reveal className="border-b border-border bg-surface/30">
        <EvidenceFlowDiagram />
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  Section: Latest Opportunities Grid                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Ground Evidence
            </span>
            <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
              Latest Verified Opportunities
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Recently processed opportunities from official regulatory and court filings.
            </p>
          </div>
          <Link
            href="/claimables"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary transition-colors hover:text-trust-primary-hover"
          >
            Browse all opportunities ({items.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <ClaimableCard key={item.id} claim={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyDirectoryNotice
              title="No published opportunities found"
              body="No published claim opportunities are currently listed. Please check back as new official notices are verified."
            />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Section: Closing Soon (Future Deadlines)                          */}
      {/* ------------------------------------------------------------------ */}
      {closingSoon.length > 0 && (
        <section className="border-t border-border bg-background-elevated/40 py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-deadline">
                  Approaching Windows
                </span>
                <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
                  Closing Soon
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Opportunities with official deadlines approaching. Confirm dates on linked
                  official portals.
                </p>
              </div>
              <Link
                href="/closing-soon"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-deadline transition-colors hover:opacity-80"
              >
                View all deadlines <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 divide-y divide-border rounded-card border border-border bg-surface shadow-card">
              {closingSoon.map((item) => (
                <ClaimableRow key={item.id} claim={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Section: Browse by Sector & Company                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Sectors */}
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5 text-trust-primary" />
                Browse by Sector
              </h3>
              <Link
                href="/sectors"
                className="text-xs font-semibold text-trust-primary hover:underline"
              >
                All Sectors →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
              {sectors.map((sector) => (
                <Link
                  key={sector.slug}
                  href={`/sectors/${sector.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                >
                  <span className="text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                    {sector.name}
                  </span>
                  <span className="mt-2 text-xs text-text-muted">
                    {sector.activeClaimCount} {sector.activeClaimCount === 1 ? 'record' : 'records'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Users className="h-5 w-5 text-trust-primary" />
                Browse by Company
              </h3>
              <Link
                href="/companies"
                className="text-xs font-semibold text-trust-primary hover:underline"
              >
                All Companies →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
              {companies.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/companies/${comp.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                >
                  <span className="text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                    {comp.name}
                  </span>
                  <span className="mt-2 text-xs text-text-muted">
                    {comp.activeClaimCount} {comp.activeClaimCount === 1 ? 'record' : 'records'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Section: Status Explanations                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-surface/50 py-16">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Understanding Status Indicators
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Every listing displays a clear, human-verified status paired with icon and text
              labels.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_EXPLAINERS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.status} className="rounded-card border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-5 w-5 ${item.tone}`} />
                    <span className={`text-base font-semibold ${item.tone}`}>{item.status}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Section: FAQ                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Common questions regarding our platform, sources, and independence.
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </>
  );
}
