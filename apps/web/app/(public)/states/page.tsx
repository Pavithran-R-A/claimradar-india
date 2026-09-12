import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedStates } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'States | ClaimKhoj India',
  description:
    'Browse published claim and refund opportunities across Indian states, derived from the geographic scope of official records.',
  alternates: { canonical: '/states' },
};

export const dynamic = 'force-dynamic';

export default async function StatesPage() {
  const outcome = await getPublishedStates();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">States</h1>
        <p className="mt-3 text-base text-text-secondary">
          Published opportunities grouped by the Indian state they relate to. This directory is
          built only from records present in the publication database.
        </p>
      </header>

      {!outcome.ok ? (
        <DataUnavailableNotice message={outcome.error} />
      ) : (
        <>
          {outcome.demo && <DemoDataBanner />}
          {outcome.data.length === 0 ? (
            <EmptyDirectoryNotice
              title="No state data available yet"
              body="There are currently no published opportunities with a recorded state. As published records with a geographic scope are added, they will appear here."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {outcome.data.map((state) => (
                <li key={state.slug}>
                  <Link
                    href={`/states/${state.slug}`}
                    className="block rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:bg-background"
                  >
                    <span className="block text-sm font-semibold text-text-primary">
                      {state.name}
                    </span>
                    <span className="mt-1 block text-sm text-text-secondary">
                      {state.claimCount} {state.claimCount === 1 ? 'opportunity' : 'opportunities'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
