import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedClaimables } from '@/lib/claimables-repository';

export const metadata: Metadata = {
  title: 'Filing Deadlines Schedule — ClaimRadar India',
  description: 'Chronological schedule of official filing deadlines for published consumer claims.',
};

export default async function DeadlinesPage() {
  const { items } = await getPublishedClaimables();
  const sorted = [...items].sort((a, b) => {
    const da = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Infinity;
    const db = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Infinity;
    return da - db;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Filing Deadlines Calendar
        </h1>
        <p className="text-slate-600">
          Machine-readable chronological deadline schedule for verified claims.
        </p>
      </div>

      <div className="space-y-4">
        {sorted.map((claim) => (
          <div
            key={claim.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                <Link href={`/claimables/${claim.slug}`} className="hover:text-blue-600">
                  {claim.title}
                </Link>
              </h2>
              <p className="text-xs text-slate-500">
                {claim.companyName} • {claim.sector}
              </p>
            </div>
            {claim.deadlineDate ? (
              <time
                dateTime={claim.deadlineDate}
                className="text-sm font-semibold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-800 self-start md:self-auto"
              >
                {new Date(claim.deadlineDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            ) : (
              <span className="text-xs font-medium text-slate-400">No deadline set</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
