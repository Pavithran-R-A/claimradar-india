import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileCheck2,
  Landmark,
  Radar,
  ShieldCheck,
  Users,
  Bell,
} from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
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

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Monitor Official Feeds',
    body: 'Continuous automated monitoring of SEBI, RBI, PIB press releases, and court portals for public refund and compensation notices.',
    icon: Landmark,
  },
  {
    step: '02',
    title: 'Verify & Structure Evidence',
    body: 'Human editorial review verifies every record against official source filings before publication — zero invented entries.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Direct Official Action',
    body: 'We explain who may be affected and link directly to official portals so you can submit your claim safely without intermediaries.',
    icon: ShieldCheck,
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
      {/*  Hero — "Evidence in Motion" deep ink canvas                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div aria-hidden className="hero-backdrop" />

        <div className="relative mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="anim-rise inline-flex items-center gap-2 rounded-full border border-brand-bright/30 bg-brand-bright/10 px-3.5 py-1 text-xs font-semibold text-brand-bright backdrop-blur-md">
              <Radar aria-hidden className="h-3.5 w-3.5" />
              Independent Information Directory — India
            </div>

            <h1 className="anim-rise anim-delay-1 mt-5 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find refunds, compensation, and public claim opportunities in India.
            </h1>

            <p className="anim-rise anim-delay-2 mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              ClaimRadar monitors official sources and explains who may be affected, what official
              notices state, and where to verify or act directly.
            </p>

            {/* Central Interactive Search Experience */}
            <div className="anim-rise anim-delay-3 mt-8">
              <InteractiveHeroSearch />
            </div>

            {/* Trust disclaimer badge */}
            <p className="anim-rise anim-delay-4 mt-6 text-[11px] font-medium text-slate-400">
              Independent platform. Not a government portal, court, or law firm. No payment or
              eligibility guarantees.
            </p>
          </div>
        </div>

        {/* Seamless visual transition curve to off-white canvas */}
        <div className="h-8 w-full bg-gradient-to-b from-ink-950 to-background opacity-90" />
      </section>

      {/* Demo data notice banner when using fallback mock data */}
      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Section 3: Primary Product — Latest Opportunities                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Official Evidence
            </span>
            <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
              Latest Verified Opportunities
            </h2>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm">
              Recently processed opportunities verified against official regulatory and court
              filings.
            </p>
          </div>
          <Link
            href="/claimables"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-trust-primary transition-colors hover:text-trust-primary-hover sm:text-sm"
          >
            Browse directory ({items.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((item) => (
              <ClaimableCard key={item.id} claim={item} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyDirectoryNotice
              title="No published opportunities listed yet"
              body="ClaimRadar actively monitors SEBI, RBI, PIB, and court feeds. Opportunities are published here only after passing human verification — zero placeholder or invented entries."
              showActions={true}
            />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Section 4: Closing Soon (Rendered ONLY if records exist)           */}
      {/* ------------------------------------------------------------------ */}
      {closingSoon.length > 0 && (
        <section className="border-t border-border bg-surface-strong/30 py-12">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-deadline">
                  Approaching Windows
                </span>
                <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
                  Closing Soon
                </h2>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  Opportunities with official submission deadlines approaching. Confirm dates on
                  official portals.
                </p>
              </div>
              <Link
                href="/closing-soon"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-deadline transition-colors hover:opacity-80 sm:text-sm"
              >
                View deadlines <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 divide-y divide-border rounded-card border border-border bg-surface shadow-card">
              {closingSoon.map((item) => (
                <ClaimableRow key={item.id} claim={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Section 5: Active Sectors & Companies (Rendered ONLY when count > 0) */}
      {/* ------------------------------------------------------------------ */}
      {(activeSectors.length > 0 || activeCompanies.length > 0) && (
        <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Sectors */}
            {activeSectors.length > 0 && (
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                    <Building2 className="h-4 w-4 text-trust-primary" />
                    Browse by Sector
                  </h3>
                  <Link
                    href="/sectors"
                    className="text-xs font-semibold text-trust-primary hover:underline"
                  >
                    All Sectors →
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activeSectors.map((sector) => (
                    <Link
                      key={sector.slug}
                      href={`/sectors/${sector.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 transition-all duration-200 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                    >
                      <span className="text-xs font-semibold text-text-primary group-hover:text-trust-primary sm:text-sm">
                        {sector.name}
                      </span>
                      <span className="mt-1 text-[11px] text-text-muted">
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
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                    <Users className="h-4 w-4 text-trust-primary" />
                    Browse by Company
                  </h3>
                  <Link
                    href="/companies"
                    className="text-xs font-semibold text-trust-primary hover:underline"
                  >
                    All Companies →
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activeCompanies.map((comp) => (
                    <Link
                      key={comp.slug}
                      href={`/companies/${comp.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 transition-all duration-200 hover:border-trust-primary/40 hover:bg-surface-strong hover:shadow-sm"
                    >
                      <span className="text-xs font-semibold text-text-primary group-hover:text-trust-primary sm:text-sm">
                        {comp.name}
                      </span>
                      <span className="mt-1 text-[11px] text-text-muted">
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
      {/*  Section 6: How ClaimRadar Works (Streamlined 3-step overview)       */}
      {/* ------------------------------------------------------------------ */}
      <Reveal className="border-t border-border bg-surface/40 py-12">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              Verification Pipeline
            </span>
            <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
              From Official Source to Direct User Action
            </h2>
            <p className="mt-2 text-xs text-text-secondary sm:text-sm">
              ClaimRadar monitors public notices, structures evidence, and directs you to official
              portals.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative rounded-card border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:border-trust-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-trust-primary">{item.step}</span>
                    <Icon className="h-5 w-5 text-trust-primary/80" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-trust-primary transition-colors hover:underline sm:text-sm"
            >
              Read our complete verification methodology <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  Section 7: Alert Conversion CTA                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-trust-primary/20 bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 p-8 text-white shadow-xl sm:p-10">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-bright/10 text-brand-bright">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-white sm:text-3xl">
              Don&apos;t miss an official deadline.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Set up alerts to get notified whenever a verified refund or compensation opportunity
              matches your saved watchlist.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-field bg-brand-bright px-5 text-xs font-bold text-ink-950 transition-colors hover:bg-white sm:text-sm"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-field border border-white/20 px-5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:text-sm"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              Free limited beta. We never share your details or file claims without authorization.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Section 8: Frequently Asked Questions (Compact Accordion)         */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-1.5 text-xs text-text-secondary sm:text-sm">
              Common questions regarding our platform, sources, and independence.
            </p>
          </div>
          <FaqAccordion items={faqItems} />

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-trust-primary hover:underline sm:text-sm"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
