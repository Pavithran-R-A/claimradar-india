import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedClaimables } from '@/lib/claimables-repository';
import {
  DataUnavailableNotice,
  DemoDataBanner,
  EmptyDirectoryNotice,
} from '@/components/repository-states';

export const metadata: Metadata = {
  title: 'Newly Published Claimables — ClaimRadar India',
  description: 'Recently published official claim and refund opportunities.',
};

// Directory content comes from the live publication database.
export const dynamic = 'force-dynamic';

export default async function NewPage() {
  const outcome = await getPublishedClaimables({ newOnly: true, limit: 50 });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Newly Published Opportunities
        </h1>
        <p className="text-slate-600">
          Claimables published from official sources within the last 30 days.
        </p>
      </div>

      {!outcome.ok ? (
        <DataUnavailableNotice message={outcome.error} />
      ) : (
        <>
          {outcome.demo && <DemoDataBanner />}

          {outcome.data.items.length === 0 ? (
            <EmptyDirectoryNotice
              title="Nothing new in the last 30 days"
              body="No claim records were published in the last 30 days. New records appear here as soon as they pass the publication policy."
            />
          ) : (
            <div className="space-y-4">
              {outcome.data.items.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    <Link href={`/claimables/${claim.slug}`} className="hover:text-blue-600">
                      {claim.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 mb-3">{claim.statusExplanation}</p>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>
                      Published: {new Date(claim.publishedAt).toLocaleDateString('en-IN')}
                    </span>
                    <Link
                      href={`/claimables/${claim.slug}`}
                      className="font-semibold text-blue-600"
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
