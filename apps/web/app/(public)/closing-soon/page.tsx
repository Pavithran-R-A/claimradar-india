import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedClaimables } from '@/lib/claimables-repository';

export const metadata: Metadata = {
  title: 'Closing Soon — Approaching Filing Deadlines | ClaimRadar India',
  description:
    'Urgent claim opportunities with valid future filing deadlines closing within 7 days.',
};

export default async function ClosingSoonPage() {
  const result = await getPublishedClaimables({ closingSoonOnly: true });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Closing Soon</h1>
        <p className="text-slate-600">
          Claim opportunities with valid upcoming deadlines requiring urgent filing.
        </p>
      </div>

      {result.items.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 border border-slate-200">
          No urgent closing-soon deadlines at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {result.items.map((claim) => (
            <div
              key={claim.id}
              className="p-6 bg-white rounded-xl border border-amber-200 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                  Closing Soon
                </span>
                {claim.deadlineDate && (
                  <span className="text-xs font-semibold text-slate-700">
                    Deadline: {new Date(claim.deadlineDate).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                <Link href={`/claimables/${claim.slug}`} className="hover:text-blue-600">
                  {claim.title}
                </Link>
              </h2>
              <p className="text-sm text-slate-600 mb-3">{claim.statusExplanation}</p>
              <Link
                href={`/claimables/${claim.slug}`}
                className="text-xs font-semibold text-blue-600"
              >
                View Official Filing Portal &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
