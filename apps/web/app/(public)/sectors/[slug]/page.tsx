import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublishedClaimables, getPublishedSectorBySlug } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import { Pagination } from '@/components/directory/pagination';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Detail content comes from the live publication database.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const outcome = await getPublishedSectorBySlug(slug);
  if (!outcome.ok || !outcome.data) {
    return {
      title: 'Sector Not Found — ClaimKhoj India',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${outcome.data.name} Sector — Refund & Claim Records | ClaimKhoj India`,
    description: `Published refund, compensation and claim records in the ${outcome.data.name} sector in India, verified from official sources.`,
    alternates: {
      canonical: `https://claimradar.in/sectors/${outcome.data.slug}`,
    },
  };
}

export default async function SectorDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;

  const outcome = await getPublishedSectorBySlug(slug);

  if (outcome.ok && !outcome.data) {
    notFound();
  }

  if (!outcome.ok || !outcome.data) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <DataUnavailableNotice
          message={!outcome.ok ? outcome.error : 'This sector is no longer listed.'}
        />
      </div>
    );
  }

  const sector = outcome.data;
  const claimablesOutcome = await getPublishedClaimables({ sectorSlug: slug, page, limit: 10 });

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li>
            <Link href="/" className="underline-offset-2 hover:text-trust-primary hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href="/sectors"
              className="underline-offset-2 hover:text-trust-primary hover:underline"
            >
              Sectors
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-text-primary">
            {sector.name}
          </li>
        </ol>
      </nav>

      {outcome.demo && <DemoDataBanner />}

      {/* Header */}
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          {sector.name} sector
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
          Published refund, compensation and claim records involving companies in the {sector.name}{' '}
          industry. Every record below links to the official sources it was verified against.
        </p>
      </header>

      {/* Published records */}
      <section aria-labelledby="records-heading" className="mt-10">
        <h2 id="records-heading" className="text-xl font-bold tracking-tight text-text-primary">
          Published records{' '}
          {claimablesOutcome.ok && (
            <span className="font-normal text-text-muted">({claimablesOutcome.data.total})</span>
          )}
        </h2>

        <div className="mt-4">
          {!claimablesOutcome.ok ? (
            <DataUnavailableNotice message={claimablesOutcome.error} />
          ) : claimablesOutcome.data.items.length === 0 ? (
            <EmptyDirectoryNotice
              title={`No published records in the ${sector.name} sector`}
              body="When a verified record categorised under this sector passes our publication policy, it will appear here."
            />
          ) : (
            <>
              <div className="space-y-3">
                {claimablesOutcome.data.items.map((claim) => (
                  <ClaimableRow key={claim.id} claim={claim} />
                ))}
              </div>
              <Pagination
                basePath={`/sectors/${sector.slug}`}
                page={claimablesOutcome.data.page}
                totalPages={claimablesOutcome.data.totalPages}
              />
            </>
          )}
        </div>
      </section>

      <div className="mt-10">
        <Link
          href="/claimables"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Back to the full directory
        </Link>
      </div>
    </div>
  );
}
