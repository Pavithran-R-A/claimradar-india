import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  FileText,
  Landmark,
  Radio,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { EvidenceFlowDiagram } from '@/components/landing/evidence-flow-diagram';
import { EvidenceRadarVisual } from '@/components/landing/evidence-radar-visual';
import { InteractiveHeroSearch } from '@/components/landing/interactive-hero-search';
import { EmptyDirectoryNotice, DemoDataBanner } from '@/components/repository-states';
import { Reveal } from '@/components/motion/reveal';
import { getPublishedClaimables } from '@/lib/claimables-repository';
import { formatIstDate } from '@/lib/dates';
import { publicSourceFamilies } from '@claimradar/source-registry';
import { brandConfig } from '@claimradar/config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${brandConfig.siteName} - Find what you can claim`,
  description: brandConfig.tagline,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${brandConfig.siteName} - Find what you can claim`,
    description: brandConfig.tagline,
    url: '/',
    type: 'website',
  },
};

const SOURCE_MARKS = {
  SEBI: BarChart3,
  RBI: Landmark,
  IBBI: FileText,
  TRAI: Radio,
  PIB: Building2,
} as const;

const SOURCE_TONES = {
  SEBI: { accent: '#3B82F6', pale: '#EAF3FF' },
  RBI: { accent: '#D99A18', pale: '#FFF5D6' },
  IBBI: { accent: '#0F8B8D', pale: '#E5F7F4' },
  TRAI: { accent: '#0B7F86', pale: '#E6F6F6' },
  PIB: { accent: '#2563EB', pale: '#EAF1FF' },
} as const;

const JOURNEY = [
  ['DISCOVER', 'Find relevant records'],
  ['VERIFY', 'Read the official source'],
  ['UNDERSTAND', 'See what may apply'],
  ['ACT', 'Follow the official route'],
] as const;

function SourceIcon({ code }: { code: string }) {
  const Icon = SOURCE_MARKS[code as keyof typeof SOURCE_MARKS] ?? FileText;
  return <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-trust-primary/65">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="mt-1 font-display text-3xl font-bold tracking-[-0.02em] text-trust-primary sm:text-[2.15rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}

export default async function LandingPage() {
  const claimables = await getPublishedClaimables({ limit: 200 });
  const items = claimables.ok ? claimables.data.items : [];
  const latest = [...items]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 5);

  return (
    <div className="overflow-hidden bg-background">
      <section aria-labelledby="home-hero-heading" className="relative bg-white">
        <div className="mx-auto max-w-content px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-11 lg:px-8 lg:pb-10 lg:pt-14">
          <div
            data-ui="hero-grid"
            className="grid items-center gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:gap-10"
          >
            <div className="max-w-3xl">
              <span aria-hidden="true" className="block h-1.5 w-9 rounded-full bg-gold-bright" />
              <h1
                id="home-hero-heading"
                className="enter-seq-1 mt-5 max-w-[760px] font-display text-[clamp(3.2rem,6vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.048em] text-trust-primary"
              >
                Find what&apos;s rightfully yours.
              </h1>
              <p className="enter-seq-2 mt-5 max-w-[680px] text-[1.05rem] leading-8 text-text-secondary sm:text-[1.18rem]">
                {brandConfig.siteName} checks official sources for refunds, benefits, compensation,
                and claim opportunities — so you can find what you may be eligible for.
              </p>

              <div className="enter-seq-3 mt-7 max-w-[760px]">
                <InteractiveHeroSearch />
              </div>

              <div className="enter-seq-4 mt-8 grid max-w-[760px] gap-4 border-t border-border pt-5 sm:grid-cols-3 sm:gap-5">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" aria-hidden="true" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Official sources</strong>
                    <br />
                    Direct links to the record.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" aria-hidden="true" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Pan-India view</strong>
                    <br />
                    Public sources across India.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" aria-hidden="true" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Your next step</strong>
                    <br />
                    You act on the official portal.
                  </p>
                </div>
              </div>
            </div>

            <div className="enter-seq-5 relative pt-2 xl:pt-12">
              <div
                data-ui="hero-annotation"
                className="pointer-events-none absolute right-2 top-0 hidden items-end gap-2 xl:flex"
                aria-hidden="true"
              >
                <p className="max-w-[10rem] text-right font-display text-base italic leading-tight text-trust-primary/70">
                  Scanning official sources for you
                </p>
                <svg viewBox="0 0 72 44" className="h-10 w-16 text-trust-primary/50">
                  <path
                    d="M4 6 C38 5 58 14 54 34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="m49 29 5 6 6-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <EvidenceRadarVisual />
            </div>
          </div>

          <ol
            data-ui="claim-journey"
            aria-label="ClaimKhoj discovery journey"
            className="journey-rail relative mt-8 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:border-t-0 lg:pt-7"
          >
            <svg
              viewBox="0 0 1000 70"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-0 top-[3.15rem] hidden h-12 w-full lg:block"
              aria-hidden="true"
            >
              <path
                d="M10 38 C120 8 180 62 280 38 S450 12 535 38 S700 58 790 36 S920 18 990 42"
                fill="none"
                stroke="#5D94BC"
                strokeWidth="1.4"
                strokeDasharray="5 6"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {JOURNEY.map(([label, description], index) => (
              <li
                key={label}
                className="group relative z-10 flex items-center gap-3 rounded-xl px-2 py-3 lg:flex-col lg:gap-2 lg:px-4 lg:py-0 lg:text-center"
              >
                <span className="order-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-bright/45 bg-[#FFF7DD] text-xs font-extrabold text-trust-primary shadow-[0_0_0_5px_rgba(255,255,255,0.95)] lg:h-3 lg:w-3 lg:text-[0px]">
                  {index + 1}
                </span>
                <span className="order-1 lg:min-h-[34px]">
                  <span className="block text-[0.66rem] font-extrabold tracking-[0.16em] text-trust-primary">
                    {label}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-text-secondary lg:hidden">{description}</span>
                </span>
                <span className="order-3 hidden max-w-[11rem] text-xs leading-5 text-text-muted lg:block">
                  {description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-5 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      <Reveal
        as="section"
        className="border-y border-border bg-surface-strong/55"
        aria-labelledby="sources-strip-heading"
      >
        <div className="mx-auto max-w-content px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="shrink-0 lg:w-56">
              <p
                id="sources-strip-heading"
                className="text-xs font-bold uppercase tracking-[0.14em] text-trust-primary"
              >
                Official sources we check
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Monitored source families linked to official domains.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {publicSourceFamilies.map((source) => {
                const tone = SOURCE_TONES[source.shortName as keyof typeof SOURCE_TONES] ?? {
                  accent: '#214E80',
                  pale: '#EEF4F8',
                };

                return (
                  <Link
                    key={source.id}
                    href={`/sources#${source.id}`}
                    className="public-focus group flex min-h-[80px] items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 transition-all duration-fast hover:-translate-y-0.5 hover:border-trust-primary/25 hover:shadow-[0_10px_24px_rgba(13,33,72,0.06)]"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-fast group-hover:scale-105"
                      style={{ backgroundColor: tone.pale, color: tone.accent }}
                    >
                      <SourceIcon code={source.shortName} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm text-text-primary">{source.shortName}</strong>
                      <span className="block truncate text-[0.68rem] leading-4 text-text-muted">
                        {source.scope}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/sources"
              className="public-focus group inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-md px-1 text-sm font-semibold text-trust-primary hover:underline"
            >
              View all sources
              <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="public-section mx-auto max-w-content px-4 sm:px-6 lg:px-8"
        aria-labelledby="latest-opportunities-heading"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:gap-14">
          <div>
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                id="latest-opportunities-heading"
                eyebrow="Recently verified"
                title="Latest opportunities"
                description="Recent records from official source families, with direct routes back to the source."
              />
              <Link
                href="/claimables"
                className="public-focus group inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-md px-1 text-sm font-semibold text-trust-primary hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>

            {latest.length > 0 ? (
              <div className="divide-y divide-border">
                {latest.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/claimables/${item.slug}`}
                    className="public-focus group flex min-h-[76px] items-center gap-3 rounded-lg px-2 py-3 transition-all duration-fast hover:bg-surface-strong/55 motion-safe:animate-rise"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[#2563EB] transition-transform duration-fast group-hover:scale-105">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                        {item.title}
                      </strong>
                      <span className="mt-1 block truncate text-xs text-text-muted">
                        {item.authority || 'Official source'}
                        {item.publishedAt ? ` · ${formatIstDate(item.publishedAt)}` : ''}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-fast group-hover:translate-x-1 group-hover:text-trust-primary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="pt-4">
                <EmptyDirectoryNotice showActions={false} />
              </div>
            )}
          </div>

          <div className="border-border lg:border-l lg:pl-12" aria-labelledby="how-it-works-heading">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                id="how-it-works-heading"
                eyebrow="From record to action"
                title={`How ${brandConfig.siteName} works`}
                description="A clear path from official records to the next official step."
              />
              <Link
                href="/how-it-works"
                className="public-focus group inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-md px-1 text-sm font-semibold text-trust-primary hover:underline"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
            <EvidenceFlowDiagram />
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="border-y border-border bg-[#EEF8F6]"
        aria-labelledby="public-benefit-heading"
      >
        <div className="mx-auto grid max-w-content gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8 lg:py-12">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0F8B8D] shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-trust-primary/65">
                Public-source first
              </p>
              <h2
                id="public-benefit-heading"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-trust-primary sm:text-3xl"
              >
                Better information before you act
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                {brandConfig.siteName} helps you discover public refunds, benefits, compensation,
                and claim opportunities from official records. It does not file claims, promise
                payouts, or collect official filing fees.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href="/claimables"
              className="public-focus inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-trust-primary px-5 text-sm font-bold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
            >
              Explore opportunities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="public-focus inline-flex min-h-[48px] items-center justify-center rounded-xl border border-trust-primary/20 bg-white px-5 text-sm font-semibold text-trust-primary transition-colors duration-fast hover:bg-white/70"
            >
              About ClaimKhoj
            </Link>
          </div>
        </div>
      </Reveal>

      <section className="bg-white" aria-label="Start searching ClaimKhoj">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="font-display text-2xl font-bold text-trust-primary">Ready to check what may apply to you?</p>
            <p className="mt-1 text-sm text-text-secondary">Start with a search, then verify the record on the official source.</p>
          </div>
          <Link
            href="/claimables"
            className="public-focus inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#F5B940] px-6 text-sm font-extrabold text-[#0D2148] shadow-[0_10px_24px_rgba(217,154,24,0.18)] transition-all duration-fast hover:bg-[#F0AE2F] hover:shadow-[0_12px_28px_rgba(217,154,24,0.24)]"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search claims
          </Link>
        </div>
      </section>
    </div>
  );
}