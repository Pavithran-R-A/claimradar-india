import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileSearch,
  Landmark,
  Newspaper,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { FaqAccordion } from '@/components/landing/interactive';
import { ClaimableCard, ClaimableRow } from '@/components/directory/claimable-card';
import { Reveal } from '@/components/directory/reveal';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';
import {
  getPublishedClaimables,
  getPublishedCompanies,
  getPublishedSectors,
} from '@/lib/claimables-repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ClaimRadar India — Track Refunds, Compensation & Claim Opportunities',
  description:
    'ClaimRadar India aggregates refund, compensation and claim opportunities from official Indian sources — regulators, courts and public notices — so you never miss what you may be owed.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ClaimRadar India — Track Refunds, Compensation & Claim Opportunities',
    description:
      'ClaimRadar India aggregates refund, compensation and claim opportunities from official Indian sources so you never miss what you may be owed.',
    url: '/',
    type: 'website',
  },
};

const faqItems = [
  {
    question: 'What is ClaimRadar?',
    answer:
      'ClaimRadar is an independent information platform that aggregates publicly available refund, compensation and claim opportunities from official sources in India. We do not file claims on your behalf.',
  },
  {
    question: 'Is ClaimRadar a government website?',
    answer:
      'No. ClaimRadar is an independent platform. We are not affiliated with the Government of India, any court, regulator or listed company. We link to official sources so you can verify information yourself.',
  },
  {
    question: 'Does ClaimRadar guarantee I will receive money?',
    answer:
      'No. We surface potential opportunities based on publicly available information. Whether you qualify or receive a refund depends on the specific scheme, your circumstances and the official process.',
  },
  {
    question: 'How does ClaimRadar find opportunities?',
    answer:
      'We monitor consumer authorities, courts and tribunals, financial regulators, company public notices and government press releases. Our systems extract structured data and our editorial team reviews it before publication.',
  },
  {
    question: 'How do I report an error or outdated information?',
    answer:
      'Visit our Corrections page and submit a report. Our editorial team reviews all correction requests and updates published content when verified.',
  },
];

const STATUS_EXPLAINERS = [
  {
    status: 'Open',
    icon: CheckCircle2,
    tone: 'text-success',
    body: 'The official process is active and accepting submissions based on the latest source we checked.',
  },
  {
    status: 'Closing soon',
    icon: CalendarClock,
    tone: 'text-deadline',
    body: 'A published deadline is approaching. Dates are shown in IST — always confirm on the official site before acting.',
  },
  {
    status: 'Under review',
    icon: Eye,
    tone: 'text-info',
    body: 'We have seen the announcement but are still verifying scope, eligibility or the official route.',
  },
  {
    status: 'Closed',
    icon: ShieldCheck,
    tone: 'text-text-muted',
    body: 'The window has ended or the scheme concluded. We keep the record for reference and corrections.',
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
      {/*  Hero — dark deep-ink with restrained CSS-only aurora + survey grid */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {/* Decorative aurora + survey-grid layer only — never a layout container. */}
        <div aria-hidden className="hero-backdrop" />
        <div className="relative mx-auto max-w-content px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
              <Radar aria-hidden className="h-3.5 w-3.5 text-brand-bright" />
              Independent directory of official claim opportunities
            </p>
            <h1 className="anim-rise anim-delay-1 mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Refunds and compensation you may be owed,{' '}
              <span className="font-serif italic text-brand-bright">
                verified from official sources.
              </span>
            </h1>
            <p className="anim-rise anim-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              ClaimRadar monitors consumer authorities, courts, regulators and company notices
              across India, then publishes each opportunity with its eligibility, evidence
              requirements and the official route to act.
            </p>

            {/* Hero search — plain GET navigation to the directory */}
            <form
              action="/claimables"
              method="GET"
              role="search"
              className="anim-rise anim-delay-3 mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <label htmlFor="hero-search" className="sr-only">
                  Search claim opportunities
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                />
                <input
                  id="hero-search"
                  type="search"
                  name="search"
                  placeholder="Search a company, scheme or sector…"
                  className="h-12 w-full rounded-field border border-white/15 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm transition-colors duration-fast focus:border-brand-bright focus:outline-none focus:ring-2 focus:ring-brand-bright/30"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 rounded-field bg-brand-bright px-6 text-sm font-semibold text-ink-950 transition-colors duration-fast hover:bg-white"
              >
                Search directory
              </button>
            </form>

            <div className="anim-rise anim-delay-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/claimables"
                className="inline-flex h-12 items-center gap-2 rounded-field border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-fast hover:border-white/40 hover:bg-white/10"
              >
                Browse all claimables
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-field bg-trust-primary px-6 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
              >
                <BellRing aria-hidden className="h-4 w-4" />
                Create a free watchlist
              </Link>
            </div>

            <p className="anim-rise anim-delay-4 mt-6 text-xs text-white/50">
              Independent platform — not affiliated with any government or company. We never
              guarantee eligibility or payouts.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Trust strip                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Platform guarantees" className="border-b border-border bg-surface">
        <div className="mx-auto max-w-content px-4 py-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-text-secondary sm:text-sm">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck aria-hidden className="h-4 w-4 text-success" />
              Official sources linked on every listing
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 aria-hidden className="h-4 w-4 text-success" />
              No fabricated amounts or statistics
            </li>
            <li className="inline-flex items-center gap-2">
              <CalendarClock aria-hidden className="h-4 w-4 text-deadline" />
              Deadlines shown in IST
            </li>
            <li className="inline-flex items-center gap-2">
              <FileSearch aria-hidden className="h-4 w-4 text-trust-primary" />
              Corrections reviewed by editors
            </li>
          </ul>
        </div>
      </section>

      {claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Current opportunities                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Current opportunities
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                The most recently published records from our verified directory.
              </p>
            </div>
            <Link
              href="/claimables"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
            >
              View all claimables
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {!ok ? (
              <DataUnavailableNotice message={claimables.error} />
            ) : latest.length === 0 ? (
              <EmptyDirectoryNotice
                title="No published opportunities yet"
                body="As soon as our editors verify a refund, compensation or claim opportunity from an official source, it will appear here."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((claim, i) => (
                  <Reveal key={claim.id} delay={Math.min(i, 5) * 60} className="h-full">
                    <ClaimableCard claim={claim} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Closing soon                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border bg-background-elevated py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Deadlines coming up
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Published records with the nearest future deadlines. Always confirm dates on the
                official source before acting.
              </p>
            </div>
            <Link
              href="/deadlines"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
            >
              All deadlines
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {!ok ? (
              <DataUnavailableNotice message={claimables.error} />
            ) : closingSoon.length === 0 ? (
              <EmptyDirectoryNotice
                title="No upcoming deadlines right now"
                body="None of the currently published records carry a future deadline. New records are added as official sources publish them."
              />
            ) : (
              <div className="space-y-3">
                {closingSoon.map((claim, i) => (
                  <Reveal key={claim.id} delay={Math.min(i, 4) * 60}>
                    <ClaimableRow claim={claim} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  How it works                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Discover opportunities',
                desc: 'Search the directory by company, sector or keyword, or watch the companies you use to be alerted when relevant records are published.',
              },
              {
                step: '02',
                icon: FileSearch,
                title: 'Review the evidence',
                desc: 'Every listing shows who may qualify, what relief is stated, what proof you would need and the official sources we verified it against.',
              },
              {
                step: '03',
                icon: Landmark,
                title: 'Act through the official route',
                desc: 'Each record links to the official claim or complaint process. You file directly with the company or authority — ClaimRadar never files for you.',
              },
            ].map((s) => (
              <Reveal key={s.step} className="h-full">
                <div className="h-full rounded-card border border-border bg-surface p-6 shadow-card">
                  <span className="text-xs font-bold tracking-widest text-trust-primary">
                    {s.step}
                  </span>
                  <s.icon aria-hidden className="mt-3 h-7 w-7 text-text-muted" />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-text-muted">
            ClaimRadar does not approve, submit or file claims. We provide information only.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Browse by sector / company                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border bg-background-elevated py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Browse the directory
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                <Building2 aria-hidden className="h-4 w-4" />
                By sector
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {sectors.map((sector) => (
                  <li key={sector.slug}>
                    <Link
                      href={`/sectors/${sector.slug}`}
                      className="group flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 text-sm shadow-card transition-colors duration-fast hover:border-trust-primary"
                    >
                      <span className="font-medium text-text-primary group-hover:text-trust-primary">
                        {sector.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {sector.activeClaimCount} active
                      </span>
                    </Link>
                  </li>
                ))}
                {sectors.length === 0 && (
                  <li className="text-sm text-text-muted sm:col-span-2">
                    Sectors will appear here once records are published.
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
                <Users aria-hidden className="h-4 w-4" />
                By company
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {companies.map((company) => (
                  <li key={company.slug}>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="group flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 text-sm shadow-card transition-colors duration-fast hover:border-trust-primary"
                    >
                      <span className="font-medium text-text-primary group-hover:text-trust-primary">
                        {company.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {company.activeClaimCount} active
                      </span>
                    </Link>
                  </li>
                ))}
                {companies.length === 0 && (
                  <li className="text-sm text-text-muted sm:col-span-2">
                    Companies will appear here once records are published.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Status explanation                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            What our statuses mean
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-text-secondary">
            Every listing carries one of four editorial statuses derived from official sources —
            never colour alone, always labelled.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_EXPLAINERS.map((s) => (
              <div
                key={s.status}
                className="rounded-card border border-border bg-surface p-5 shadow-card"
              >
                <s.icon aria-hidden className={`h-5 w-5 ${s.tone}`} />
                <h3 className="mt-3 text-sm font-semibold text-text-primary">{s.status}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Methodology                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border bg-background-elevated py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Source methodology
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                We monitor five categories of official sources. Each candidate record is checked
                against its primary source, given a freshness timestamp, and reviewed by an editor
                before publication. If a source later changes, the record is updated and the
                previous state is kept in its update history.
              </p>
              <Link
                href="/methodology"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
              >
                Read the full methodology
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Users, label: 'Consumer authorities' },
                { icon: Scale, label: 'Courts and tribunals' },
                { icon: Landmark, label: 'Financial regulators' },
                { icon: Building2, label: 'Company public notices' },
                { icon: Newspaper, label: 'Government press releases' },
              ].map((s) => (
                <li
                  key={s.label}
                  className="inline-flex items-center gap-2.5 rounded-card border border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary shadow-card"
                >
                  <s.icon aria-hidden className="h-4 w-4 text-text-muted" />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Watchlist CTA                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            {/* Decorative aurora + survey-grid layer only — never a layout container. */}
            <div aria-hidden className="hero-backdrop rounded-2xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
                Watch the companies you already use
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Create a free watchlist and receive email updates when new refund, compensation or
                claim opportunities are published for companies and sectors you care about. You can
                change or stop alerts at any time.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-field bg-brand-bright px-8 text-sm font-semibold text-ink-950 transition-colors duration-fast hover:bg-white"
              >
                <BellRing aria-hidden className="h-4 w-4" />
                Create free watchlist
              </Link>
              <p className="mt-4 text-xs text-white/50">
                Watchlists inform you about published records — they do not guarantee eligibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FAQ                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            <FaqAccordion items={faqItems} />
          </div>
          <p className="mt-8 text-center text-sm text-text-secondary">
            Still have questions?{' '}
            <Link
              href="/contact"
              className="font-medium text-trust-primary underline-offset-2 hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Final disclaimer                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section
        aria-label="Disclaimer"
        className="border-t border-border bg-background-elevated py-10"
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-text-muted">
            ClaimRadar India is an independent information platform. We are not affiliated with,
            endorsed by or connected to the Government of India, any court, regulator or the
            companies listed here. Information is provided for general awareness only and is not
            legal advice. Publication of a record does not mean you are eligible, and we never
            guarantee refunds, compensation or outcomes. Deadlines are shown in Indian Standard Time
            based on the latest source we checked — always verify on the official website before
            submitting anything.
          </p>
        </div>
      </section>
    </>
  );
}
