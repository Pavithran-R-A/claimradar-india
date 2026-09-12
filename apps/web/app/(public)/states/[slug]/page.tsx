import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedClaimables, getPublishedStateBySlug } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const dynamic = 'force-dynamic';

interface StatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const outcome = await getPublishedStateBySlug(slug);
  if (!outcome.ok || !outcome.data) {
    return { title: 'State not found | ClaimKhoj India', robots: { index: false, follow: false } };
  }
  return {
    title: `${outcome.data.name} — Claim Opportunities | ClaimKhoj India`,
    description: `Published claim and refund opportunities related to ${outcome.data.name}, sourced from official records.`,
    alternates: { canonical: `/states/${outcome.data.slug}` },
  };
}

export default async function StateDetailPage({ params }: StatePageProps) {
  const { slug } = await params;
  const stateOutcome = await getPublishedStateBySlug(slug);

  if (!stateOutcome.ok) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <DataUnavailableNotice message={stateOutcome.error} />
      </div>
    );
  }

  const state = stateOutcome.data;
  if (!state) {
    notFound();
  }

  const claimablesOutcome = await getPublishedClaimables({ stateSlug: state.slug, limit: 50 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link href="/states" className="text-sm text-blue-600 hover:text-blue-800">
        &larr; All states
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{state.name}</h1>
        <p className="mt-2 text-base text-slate-600">
          Published opportunities related to {state.name}, derived from the geographic scope of
          official records.
        </p>
      </header>

      {!claimablesOutcome.ok ? (
        <DataUnavailableNotice message={claimablesOutcome.error} />
      ) : (
        <>
          {claimablesOutcome.demo && <DemoDataBanner />}
          {claimablesOutcome.data.items.length === 0 ? (
            <EmptyDirectoryNotice
              title={`No published opportunities for ${state.name} yet`}
              body="There are currently no published records associated with this state. Published opportunities appear here only after they pass the full publication policy."
            />
          ) : (
            <div className="space-y-4">
              {claimablesOutcome.data.items.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {claim.sector}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        claim.status === 'closing_soon'
                          ? 'bg-amber-100 text-amber-800'
                          : claim.status === 'under_review'
                            ? 'bg-sky-100 text-sky-800'
                            : claim.status === 'closed'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {claim.status === 'closing_soon'
                        ? 'Closing Soon'
                        : claim.status === 'under_review'
                          ? 'Under Review'
                          : claim.status === 'closed'
                            ? 'Closed'
                            : 'Open'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {claim.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {claim.statusExplanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">Company:</span>{' '}
                      {claim.companyName}
                    </div>
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
