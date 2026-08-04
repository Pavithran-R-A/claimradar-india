import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedClaimables } from '@/lib/claimables-repository';

export const metadata: Metadata = {
  title: 'Newly Published Claimables — ClaimRadar India',
  description: 'Recently published official claim and refund opportunities.',
};

export default async function NewPage() {
  const result = await getPublishedClaimables({ newOnly: true });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Newly Published Opportunities
        </h1>
        <p className="text-slate-600">
          Claimables published from verified official sources within the last 30 days.
        </p>
      </div>

      <div className="space-y-4">
        {result.items.map((claim) => (
          <div key={claim.id} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              <Link href={`/claimables/${claim.slug}`} className="hover:text-blue-600">
                {claim.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-600 mb-3">{claim.statusExplanation}</p>
            <div className="text-xs text-slate-500 flex justify-between">
              <span>Published: {new Date(claim.publishedAt).toLocaleDateString('en-IN')}</span>
              <Link href={`/claimables/${claim.slug}`} className="font-semibold text-blue-600">
                View Details &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
