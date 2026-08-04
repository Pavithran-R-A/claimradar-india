import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sectors Directory — ClaimRadar India',
  description: 'Browse published claimable opportunities by industry sector.',
};

const SECTORS = [
  { name: 'Financial Services', slug: 'financial-services', count: 1 },
  { name: 'Banking', slug: 'banking', count: 1 },
];

export default function SectorsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Industry Sectors</h1>
        <p className="text-slate-600">Browse published claim opportunities by market sector.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SECTORS.map((sec) => (
          <div key={sec.slug} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">{sec.name}</h2>
            <p className="text-xs text-slate-500 mb-4">{sec.count} Active Opportunity</p>
            <Link
              href={`/claimables?sector=${sec.slug}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Browse Sector Claims &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
