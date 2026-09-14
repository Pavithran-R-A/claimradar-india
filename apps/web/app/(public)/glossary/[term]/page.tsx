import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { brandConfig } from '@claimradar/config';
import { buildBreadcrumbListJsonLd, buildDefinedTermJsonLd } from '@claimradar/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { getGlossaryTermBySlug } from '@/lib/glossary-content';

interface GlossaryTermPageProps {
  params: Promise<{ term: string }>;
}

export async function generateMetadata({ params }: GlossaryTermPageProps): Promise<Metadata> {
  const { term } = await params;
  const entry = getGlossaryTermBySlug(term);
  if (!entry) {
    return { title: 'Term not found | ClaimKhoj India', robots: { index: false, follow: false } };
  }
  return {
    title: `${entry.term} | Glossary | ClaimKhoj India`,
    description: entry.definition,
    alternates: { canonical: `${brandConfig.url}/glossary/${entry.slug}` },
  };
}

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { term } = await params;
  const entry = getGlossaryTermBySlug(term);
  if (!entry) notFound();

  const canonical = `${brandConfig.url}/glossary/${entry.slug}`;
  const structuredData = [
    buildDefinedTermJsonLd({ name: entry.term, description: entry.definition, url: canonical }),
    buildBreadcrumbListJsonLd([
      { name: 'Home', url: brandConfig.url },
      { name: 'Glossary', url: `${brandConfig.url}/glossary` },
      { name: entry.term, url: canonical },
    ]),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <JsonLd data={structuredData} />
      <Link href="/glossary" className="text-sm text-trust-primary hover:underline">
        &larr; Back to Glossary
      </Link>
      <article className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{entry.term}</h1>
        <p className="mt-4 text-base leading-relaxed text-text-primary">{entry.definition}</p>
        <h2 className="mt-8 text-lg font-semibold text-text-primary">Context</h2>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">{entry.context}</p>
      </article>
    </div>
  );
}
