import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_TERMS } from '@/lib/glossary-content';

export const metadata: Metadata = {
  title: 'Glossary | ClaimRadar India',
  description:
    'Plain-language definitions of core consumer and investor claim terms — settlement, refund scheme, compensation fund, claim window and more.',
  alternates: { canonical: '/glossary' },
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Glossary
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          Plain-language definitions of the terms used across claim and refund opportunities.
        </p>
      </header>

      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {GLOSSARY_TERMS.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/glossary/${entry.slug}`}
              className="block px-5 py-4 transition-colors hover:bg-background"
            >
              <span className="block text-sm font-semibold text-text-primary">{entry.term}</span>
              <span className="mt-1 block text-sm text-text-secondary">{entry.definition}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
