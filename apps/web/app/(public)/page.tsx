import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  Landmark,
  Radio,
} from 'lucide-react';
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

function SourceIcon({ code }: { code: string }) {
  const Icon = SOURCE_MARKS[code as keyof typeof SOURCE_MARKS] ?? FileText;
  return <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />;
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2
        id={id}
        className="mt-1 font-display text-[1.7rem] font-bold tracking-[-0.02em] text-trust-primary sm:text-[1.9rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-5 text-text-secondary">{description}</p>
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
        <div className="mx-auto max-w-[1760px] px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7 lg:px-10 xl:flex xl:min-h-[calc(100svh-4.5rem)] xl:flex-col xl:justify-center xl:pb-3 xl:pt-6 2xl:px-16">
          <div
            data-ui="hero-grid"
            className="grid gap-8 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] xl:items-center xl:gap-8 2xl:gap-10"
          >
            <div className="max-w-[900px] xl:pt-2">
              <span aria-hidden="true" className="block h-1.5 w-9 rounded-full bg-gold-bright" />
              <h1
                id="home-hero-heading"
                className="enter-seq-1 mt-4 max-w-[920px] font-display text-balance text-[clamp(3rem,4.6vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-trust-primary xl:text-[3.8rem] 2xl:whitespace-nowrap 2xl:text-[4.1rem]"
              >
                Find what&apos;s rightfully yours.
              </h1>
              <p className="enter-seq-2 mt-3 max-w-[820px] text-[1.03rem] leading-7 text-text-secondary sm:text-[1.1rem] 2xl:text-[1.14rem]">
                Search official sources for refunds, benefits, and compensation.
              </p>

              <div className="enter-seq-3 mt-5 max-w-[850px]">
                <InteractiveHeroSearch />
              </div>

            </div>

            <div className="enter-seq-5 relative xl:pt-8">
              <EvidenceRadarVisual />
            </div>
          </div>
        </div>
      </section>

      {claimables.ok && claimables.demo && (
        <div className="mx-auto max-w-[1760px] px-4 pt-4 sm:px-6 lg:px-10 2xl:px-16">
          <DemoDataBanner />
        </div>
      )}

      <Reveal
        as="section"
        className="border-y border-border bg-surface-strong/55"
        aria-labelledby="sources-strip-heading"
      >
        <div className="mx-auto max-w-[1760px] px-4 py-16 sm:px-6 lg:px-10 2xl:px-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="shrink-0 lg:w-64">
              <p
                id="sources-strip-heading"
                className="font-display text-lg font-bold text-trust-primary"
              >
                We monitor official sources
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {publicSourceFamilies.map((source) => {
                return (
                  <Link
                    key={source.id}
                    href={`/sources#${source.id}`}
                    className="public-focus group flex min-h-[68px] items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5 transition-[border-color,box-shadow,transform] duration-fast hover:-translate-y-0.5 hover:border-trust-primary/25 hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trust-primary/10 text-trust-primary transition-transform duration-fast group-hover:scale-105">
                      <SourceIcon code={source.shortName} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm text-text-primary">
                        {source.shortName}
                      </strong>
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
              <ArrowRight
                className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="mx-auto max-w-[1760px] px-4 py-16 sm:px-6 lg:px-10 2xl:px-16"
        aria-labelledby="latest-opportunities-heading"
      >
        <div>
            <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                id="latest-opportunities-heading"
                title="Latest opportunities"
              />
              <Link
                href="/claimables"
                className="public-focus group inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-md px-1 text-sm font-semibold text-trust-primary hover:underline"
              >
                View all
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {latest.length > 0 ? (
              <div className="divide-y divide-border">
                {latest.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/claimables/${item.slug}`}
                    className="public-focus group flex min-h-[62px] items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-fast hover:bg-surface-strong/55 motion-safe:animate-rise"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trust-primary/10 text-trust-primary transition-transform duration-fast group-hover:scale-105">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                        {item.title}
                      </strong>
                      <span className="mt-0.5 block truncate text-xs text-text-muted">
                        {item.authority || 'Official source'}
                        {item.publishedAt ? ` · ${formatIstDate(item.publishedAt)}` : ''}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-fast group-hover:translate-x-1 group-hover:text-trust-primary"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="pt-4">
                <EmptyDirectoryNotice
                  title="No opportunities yet"
                  body="Listings appear after editorial review."
                  showActions={false}
                  showProcess={false}
                />
              </div>
            )}
          </div>
      </Reveal>
    </div>
  );
}
