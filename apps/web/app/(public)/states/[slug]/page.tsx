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
    title: `${outcome.data.name}: Claim Opportunities | ClaimKhoj India`,
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
      <Link href="/states" className="text-sm text-trust-primary hover:text-trust-primary-hover">
        &larr; All states
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{state.name}</h1>
        <p className="mt-2 text-base text-text-secondary">
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
                  className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-background-elevated px-2.5 py-1 text-xs font-medium text-text-secondary">
                      {claim.sector}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        claim.status === 'closing_soon'
                          ? 'bg-deadline-background text-deadline'
                          : claim.status === 'under_review'
                            ? 'bg-info/10 text-info'
                            : claim.status === 'closed'
                              ? 'bg-background-elevated text-text-secondary'
                              : 'bg-verified-background text-success'
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

                  <h2 className="mb-2 text-xl font-bold text-text-primary">
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="transition-colors hover:text-trust-primary"
                    >
                      {claim.title}
                    </Link>
                  </h2>

                  <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
                    {claim.statusExplanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3 text-xs text-text-muted">
                    <div>
                      <span className="font-semibold text-text-secondary">Company:</span>{' '}
                      {claim.companyName}
                    </div>
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="font-semibold text-trust-primary transition-colors hover:text-trust-primary-hover"
                    >
                      View details
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
