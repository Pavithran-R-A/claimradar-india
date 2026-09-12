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

export default async function LandingPage() {
  const claimables = await getPublishedClaimables({ limit: 200 });
  const items = claimables.ok ? claimables.data.items : [];
  const latest = [...items]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 5);

  return (
    <main className="overflow-hidden bg-background">
      <section aria-labelledby="home-hero-heading" className="relative bg-white">
        <div className="mx-auto max-w-content px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-12 lg:pt-12">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:gap-8">
            <div className="max-w-3xl">
              <span aria-hidden="true" className="block h-1.5 w-9 rounded-full bg-gold-bright" />
              <h1
                id="home-hero-heading"
                className="enter-seq-1 mt-6 max-w-3xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-trust-primary sm:text-6xl lg:text-[4.9rem]"
              >
                Find what&apos;s rightfully yours.
              </h1>
              <p className="enter-seq-2 mt-6 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
                {brandConfig.siteName} checks official sources for refunds, benefits, compensation,
                and claim opportunities - so you can find what you may be eligible for.
              </p>

              <div className="enter-seq-3 mt-8 max-w-3xl">
                <InteractiveHeroSearch />
              </div>

              <div className="enter-seq-4 mt-10 grid max-w-3xl gap-5 border-t border-border pt-5 sm:grid-cols-3">
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

            <div className="enter-seq-5 relative lg:-mr-8">
              <EvidenceRadarVisual />
              <p className="pointer-events-none absolute -right-1 -top-9 hidden max-w-[9rem] -rotate-6 font-display text-lg italic leading-tight text-trust-primary/80 xl:block">
                Checking trusted sources for you
              </p>
            </div>
          </div>

          <div
            className="journey-rail mt-10 hidden items-end gap-0 lg:flex"
            aria-label="ClaimKhoj discovery journey"
          >
            {JOURNEY.map(([label, description], index) => (
              <div key={label} className="relative flex flex-1 items-center gap-3">
                <div className="relative z-10 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-gold-bright shadow-[0_0_0_1px_rgba(244,163,64,0.45)]" />
                <div className="-ml-3 border-t border-dashed border-trust-primary/60 pt-4 pl-6">
                  <p className="text-[0.65rem] font-bold tracking-[0.18em] text-trust-primary">
                    {label}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">{description}</p>
                </div>
                {index < JOURNEY.length - 1 && (
                  <div
                    className="absolute left-3 right-0 top-1.5 border-t border-dashed border-trust-primary/60"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
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
              Configured source families, linked to their official domains.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
            {publicSourceFamilies.map((source) => (
              <Link
                key={source.id}
                href={`/sources#${source.id}`}
                className="group flex min-h-[72px] items-center gap-3 rounded-md border border-border bg-white px-3 py-2 transition-all duration-fast hover:-translate-y-0.5 hover:border-trust-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-trust-primary"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trust-primary/10 text-trust-primary transition-colors duration-fast group-hover:bg-trust-primary group-hover:text-white">
                  <SourceIcon code={source.shortName} />
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm text-text-primary">{source.shortName}</strong>
                  <span className="block truncate text-[0.68rem] leading-4 text-text-muted">
                    {source.scope}
                  </span>
                </span>
              </Link>
            ))}
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
        className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
        aria-labelledby="latest-opportunities-heading"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:gap-14">
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
                    className="group flex min-h-[74px] items-center gap-3 py-3 transition-colors duration-fast hover:bg-surface-strong/40 motion-safe:animate-rise"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-bright/10 text-trust-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                        {item.title}
                      </strong>
                      <span className="mt-1 block truncate text-xs text-text-muted">
                        {item.authority || 'Official source'}
                        {item.publishedAt ? ` - ${formatIstDate(item.publishedAt)}` : ''}
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
            className="border-l-0 border-border lg:border-l lg:pl-12"
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
        className="border-t border-border bg-brand-bright/10"
        aria-labelledby="public-benefit-heading"
      >
        <div className="mx-auto flex max-w-content flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-bright shadow-sm">
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
