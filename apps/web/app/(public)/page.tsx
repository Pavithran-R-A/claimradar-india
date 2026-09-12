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
  ['DISCOVER', 'Find relevant records', '8%'],
  ['VERIFY', 'Read the official source', '36%'],
  ['UNDERSTAND', 'See what may apply', '65%'],
  ['ACT', 'Follow the official route', '91%'],
] as const;

function SourceIcon({ code }: { code: string }) {
  const Icon = SOURCE_MARKS[code as keyof typeof SOURCE_MARKS] ?? FileText;
  return <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

export default async function LandingPage() {
  const claimables = await getPublishedClaimables({ limit: 200 });
  const items = claimables.ok ? claimables.data.items : [];
  const latest = [...items]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 5);

  return (
    <main className="overflow-hidden bg-background">
      <section aria-labelledby="home-hero-heading" className="relative bg-white">
        <div className="mx-auto max-w-content px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-8 lg:pt-9">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(520px,0.94fr)] lg:gap-8">
            <div className="max-w-3xl">
              <span aria-hidden="true" className="block h-1.5 w-9 rounded-full bg-gold-bright" />
              <h1
                id="home-hero-heading"
                className="enter-seq-1 mt-5 max-w-[760px] font-display text-5xl font-bold leading-[0.96] tracking-[-0.048em] text-trust-primary sm:text-6xl lg:text-[4.45rem]"
              >
                Find what&apos;s rightfully yours.
              </h1>
              <p className="enter-seq-2 mt-5 max-w-2xl text-lg leading-8 text-text-secondary sm:text-[1.22rem]">
                {brandConfig.siteName} checks official sources for refunds, benefits, compensation,
                and claim opportunities — so you can find what you may be eligible for.
              </p>

              <div className="enter-seq-3 mt-7 max-w-[760px]">
                <InteractiveHeroSearch />
              </div>

              <div className="enter-seq-4 mt-8 grid max-w-[760px] gap-4 border-t border-border pt-5 sm:grid-cols-3">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Official sources</strong>
                    <br />
                    Direct links to the record.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Pan-India view</strong>
                    <br />
                    Public sources across India.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" />
                  <p className="text-sm leading-5 text-text-secondary">
                    <strong className="text-text-primary">Your next step</strong>
                    <br />
                    You act on the official portal.
                  </p>
                </div>
              </div>
            </div>

            <div className="enter-seq-5 relative lg:-mr-10">
              <EvidenceRadarVisual />
              <div className="pointer-events-none absolute -right-2 -top-8 hidden xl:block">
                <p className="max-w-[10rem] -rotate-5 font-display text-lg italic leading-tight text-trust-primary/80">
                  Checking trusted sources for you
                </p>
                <svg viewBox="0 0 92 58" className="ml-8 mt-1 h-12 w-20 text-trust-primary/65" aria-hidden="true">
                  <path d="M5 8 C54 6 79 20 68 45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="m62 40 6 6 7-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative mt-6 hidden h-[116px] lg:block" aria-label="ClaimKhoj discovery journey">
            <div className="absolute left-0 top-1 flex items-center gap-3 text-trust-primary/75">
              <div className="relative h-12 w-14" aria-hidden="true">
                <FileText className="absolute left-0 top-2 h-9 w-9 -rotate-6" strokeWidth={1.25} />
                <FileText className="absolute left-4 top-0 h-9 w-9 rotate-3" strokeWidth={1.25} />
              </div>
              <p className="max-w-[180px] -rotate-3 font-display text-sm italic leading-tight">
                From official records to your next step
              </p>
            </div>

            <svg
              viewBox="0 0 1200 96"
              preserveAspectRatio="none"
              className="absolute inset-x-0 bottom-2 h-[82px] w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M20 50 C170 82 250 22 385 46 C535 74 640 27 765 48 C900 70 1000 24 1180 48"
                fill="none"
                stroke="#2B679C"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                className="animate-draw-line"
              />
            </svg>

            {JOURNEY.map(([label, description, left]) => (
              <div
                key={label}
                className="absolute bottom-0 -translate-x-1/2"
                style={{ left }}
              >
                <div className="journey-step-dot mx-auto h-3 w-3 rounded-full border-2 border-white bg-gold-bright shadow-[0_0_0_1px_rgba(244,163,64,0.45)]" />
                <p className="mt-3 text-center text-[0.65rem] font-extrabold tracking-[0.18em] text-trust-primary">
                  {label}
                </p>
                <p className="mt-1 whitespace-nowrap text-center text-xs text-text-muted">{description}</p>
              </div>
            ))}
            <p className="absolute bottom-7 right-0 rotate-[-4deg] font-display text-sm italic text-trust-primary/70">
              Better information. Fairer outcomes.
            </p>
          </div>
        </div>
      </section>

      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-content px-4 pt-5 sm:px-6 lg:px-8">
          <DemoDataBanner />
        </div>
      )}

      <Reveal
        as="section"
        className="border-y border-border bg-surface-strong/45"
        aria-labelledby="sources-strip-heading"
      >
        <div className="mx-auto flex max-w-content flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="shrink-0 lg:w-56">
            <p
              id="sources-strip-heading"
              className="text-xs font-bold uppercase tracking-[0.14em] text-trust-primary"
            >
              Official sources we check
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Monitored source families, linked to official domains.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
            {publicSourceFamilies.map((source) => {
              const tone = SOURCE_TONES[source.shortName as keyof typeof SOURCE_TONES] ?? {
                accent: '#214E80',
                pale: '#EEF4F8',
              };
              return (
                <Link
                  key={source.id}
                  href={`/sources#${source.id}`}
                  className="group flex min-h-[76px] items-center gap-3 rounded-lg border border-border bg-white px-3 py-2.5 shadow-[0_6px_18px_rgba(13,33,72,0.025)] transition-all duration-fast hover:-translate-y-1 hover:border-trust-primary/30 hover:shadow-[0_10px_24px_rgba(13,33,72,0.08)] focus-visible:ring-2 focus-visible:ring-trust-primary"
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
            className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-trust-primary hover:underline"
          >
            View all sources{' '}
            <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8 lg:py-14"
        aria-labelledby="latest-opportunities-heading"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.14fr)] lg:gap-12">
          <div>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2
                  id="latest-opportunities-heading"
                  className="font-display text-3xl font-bold tracking-tight text-trust-primary"
                >
                  Latest verified opportunities
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Recent records from official source families.
                </p>
              </div>
              <Link
                href="/claimables"
                className="group shrink-0 text-sm font-semibold text-trust-primary hover:underline"
              >
                View all{' '}
                <ArrowRight className="inline h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
              </Link>
            </div>
            {latest.length > 0 ? (
              <div className="divide-y divide-border">
                {latest.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/claimables/${item.slug}`}
                    className="group flex min-h-[66px] items-center gap-3 px-1 py-3 transition-all duration-fast hover:bg-surface-strong/45 motion-safe:animate-rise"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-[#2563EB] transition-transform duration-fast group-hover:scale-105">
                      <FileText className="h-4 w-4" />
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
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-fast group-hover:translate-x-1 group-hover:text-trust-primary" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyDirectoryNotice showActions={false} />
            )}
          </div>

          <div
            className="border-l-0 border-border lg:border-l lg:pl-10"
            aria-labelledby="how-it-works-heading"
          >
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2
                  id="how-it-works-heading"
                  className="font-display text-3xl font-bold tracking-tight text-trust-primary"
                >
                  How {brandConfig.siteName} works
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  A simple path from source record to official action.
                </p>
              </div>
              <Link
                href="/how-it-works"
                className="group shrink-0 text-sm font-semibold text-trust-primary hover:underline"
              >
                Learn more{' '}
                <ArrowRight className="inline h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
              </Link>
            </div>
            <EvidenceFlowDiagram />
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="border-t border-border bg-[#EAF7F5]"
        aria-labelledby="public-benefit-heading"
      >
        <div className="mx-auto flex max-w-content flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0F8B8D] shadow-sm">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="public-benefit-heading"
                className="font-display text-xl font-bold text-trust-primary"
              >
                Built for a more informed India
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                {brandConfig.siteName} helps consumers discover public refunds, benefits, and claim
                opportunities from official records.
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-trust-primary hover:underline"
          >
            Learn more{' '}
            <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
