import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { brandConfig } from '@claimradar/config';
import { buildBreadcrumbListJsonLd, buildWebPageJsonLd } from '@claimradar/seo';
import { getPublishedClaimables, getPublishedCompanyBySlug } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import { Pagination } from '@/components/directory/pagination';
import { JsonLd } from '@/components/seo/json-ld';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const outcome = await getPublishedCompanyBySlug(slug);
  if (!outcome.ok || !outcome.data) {
    return { title: 'Company Not Found — ClaimKhoj India', robots: { index: false, follow: false } };
  }

  return {
    title: `${outcome.data.name} — Published Refund & Claim Records | ClaimKhoj India`,
    description: `Published refund, compensation and claim records referencing ${outcome.data.name}, verified from official sources.`,
    alternates: { canonical: `${brandConfig.url}/companies/${outcome.data.slug}` },
  };
}

export default async function CompanyDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;
  const outcome = await getPublishedCompanyBySlug(slug);

  if (outcome.ok && !outcome.data) notFound();
  if (!outcome.ok || !outcome.data) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <DataUnavailableNotice message={!outcome.ok ? outcome.error : 'This company is no longer listed.'} />
      </div>
    );
  }

  const company = outcome.data;
  const claimablesOutcome = await getPublishedClaimables({ companySlug: slug, page, limit: 10 });
  const canonical = `${brandConfig.url}/companies/${company.slug}`;
  const structuredData = [
    buildWebPageJsonLd({
      name: `${company.name} published refund and claim records`,
      url: canonical,
      description: `Published records referencing ${company.name}, verified from official sources.`,
    }),
    buildBreadcrumbListJsonLd([
      { name: 'Home', url: brandConfig.url },
      { name: 'Companies', url: `${brandConfig.url}/companies` },
      { name: company.name, url: canonical },
    ]),
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={structuredData} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
          <li><Link href="/" className="underline-offset-2 hover:text-trust-primary hover:underline">Home</Link></li>
          <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/companies" className="underline-offset-2 hover:text-trust-primary hover:underline">Companies</Link></li>
          <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
          <li aria-current="page" className="font-medium text-text-primary">{company.name}</li>
        </ol>
      </nav>

      {outcome.demo && <DemoDataBanner />}

      <header className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-ink-900 text-lg font-bold text-trust-primary">
            {company.name.substring(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{company.name}</h1>
            <p className="mt-1 text-sm text-text-muted">Sector: <span className="font-medium text-text-secondary">{company.sector}</span></p>
          </div>
        </div>
        <p className="mt-6 rounded-field border border-border bg-background-elevated p-4 text-xs leading-relaxed text-text-muted">
          <strong className="font-semibold text-text-secondary">Neutral listing disclaimer:</strong>{' '}
          listing on ClaimKhoj India indicates that this entity has been named in official regulatory, judicial or corporate public notices that we published. It does not imply wrongdoing or liability by the company or its officers.
        </p>
      </header>

      <section aria-labelledby="records-heading" className="mt-10">
        <h2 id="records-heading" className="text-xl font-bold tracking-tight text-text-primary">
          Published records {claimablesOutcome.ok && <span className="font-normal text-text-muted">({claimablesOutcome.data.total})</span>}
        </h2>
        <div className="mt-4">
          {!claimablesOutcome.ok ? (
            <DataUnavailableNotice message={claimablesOutcome.error} />
          ) : claimablesOutcome.data.items.length === 0 ? (
            <EmptyDirectoryNotice title="No published records for this company" body="When a verified record referencing this company passes our publication policy, it will appear here." />
          ) : (
            <>
              <div className="space-y-3">{claimablesOutcome.data.items.map((claim) => <ClaimableRow key={claim.id} claim={claim} />)}</div>
              <Pagination basePath={`/companies/${company.slug}`} page={claimablesOutcome.data.page} totalPages={claimablesOutcome.data.totalPages} />
            </>
          )}
        </div>
      </section>

      <div className="mt-10">
        <Link href="/claimables" className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline">
          <ChevronLeft aria-hidden className="h-4 w-4" /> Back to the full directory
        </Link>
      </div>
    </div>
  );
}
