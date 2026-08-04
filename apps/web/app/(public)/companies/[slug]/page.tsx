import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getPublishedCompanyBySlug,
  getPublishedClaimables,
} from '../../../../lib/claimables-repository';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getPublishedCompanyBySlug(slug);
  if (!company) {
    return {
      title: 'Company Not Found — ClaimRadar India',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${company.name} — Regulatory Orders & Claimables | ClaimRadar India`,
    description: `Official regulatory orders, disgorgement schemes, and public claimable notices referencing ${company.name}.`,
    alternates: {
      canonical: `https://claimradar.in/companies/${company.slug}`,
    },
  };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getPublishedCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const { items: claimables } = await getPublishedClaimables({ companySlug: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/companies" className="hover:text-gray-700">
          Companies
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{company.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-500">Sector: {company.sector}</p>
          </div>
        </div>

        {/* Neutral Disclosure Notice per Section 13 */}
        <div className="mt-6 rounded-md bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600">
          <strong>Neutral Listing Disclaimer:</strong> Listing on ClaimRadar India indicates that
          this entity has been named in official regulatory, judicial, or corporate public notices.
          It does not imply wrongdoing or liability by the company or its officers.
        </div>
      </header>

      {/* Published Records */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Official Orders & Public Notices ({claimables.length})
        </h2>

        {claimables.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 border border-gray-200">
            No published public notices currently active for this company.
          </div>
        ) : (
          <div className="space-y-4">
            {claimables.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      <Link href={`/claimables/${c.slug}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{c.affectedGroup}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
