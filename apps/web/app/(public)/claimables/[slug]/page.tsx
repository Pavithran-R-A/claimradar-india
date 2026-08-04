import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedClaimableBySlug } from '@/lib/claimables-repository';

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const claim = await getPublishedClaimableBySlug(slug);
  if (!claim) {
    return { title: 'Claim Not Found | ClaimRadar India' };
  }
  return {
    title: `${claim.title} — Official Claim Details | ClaimRadar India`,
    description: `${claim.statusExplanation} Verification and official source links for ${claim.companyName}.`,
    alternates: {
      canonical: `https://claimradar.in/claimables/${claim.slug}`,
    },
  };
}

export default async function ClaimableDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const claim = await getPublishedClaimableBySlug(slug);

  if (!claim) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/claimables"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          &larr; Back to Directory
        </Link>
      </div>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 text-slate-800">
              {claim.sector}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                claim.status === 'closing_soon'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {claim.status === 'closing_soon' ? 'Closing Soon' : 'Active'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">{claim.title}</h1>
          <p className="text-sm font-medium text-slate-600">
            Company: <span className="text-slate-900 font-semibold">{claim.companyName}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-slate-700">
          {claim.freshnessWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
              ⚠️ <span className="font-bold">Freshness Advisory:</span> {claim.freshnessWarning}
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Status & Explanation
            </h2>
            <p className="text-sm text-slate-800 leading-relaxed">{claim.statusExplanation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Affected Group
              </h3>
              <p className="text-sm text-slate-800 font-medium">{claim.affectedGroup}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Relief Amount / Benefit
              </h3>
              <p className="text-sm text-slate-800 font-medium">
                {claim.reliefAmount || 'Specified in official order'}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Official Claim Action Route
            </h2>
            <p className="text-sm text-slate-800 mb-3">{claim.actionRoute}</p>
            <a
              href={claim.officialRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Access Official Filing Portal &rarr;
            </a>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Proof Documents
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {claim.proofRequirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Official Sources & Evidence
            </h2>
            <div className="space-y-2">
              {claim.officialSources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-800">{src.name}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Official Order
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
            <div>Last Checked: {new Date(claim.lastCheckedAt).toLocaleString('en-IN')}</div>
            <div>Last Verified: {new Date(claim.lastVerifiedAt).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </article>

      <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-600 text-center">
        <strong>Independent Information Disclaimer:</strong> ClaimRadar India is an independent
        informational tracking service. We are not a law firm, claim filing agent, or government
        authority. Submit all claims directly via official government/company portals.
      </div>
    </div>
  );
}
