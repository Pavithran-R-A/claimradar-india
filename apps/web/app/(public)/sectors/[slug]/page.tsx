import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getPublishedSectorBySlug,
  getPublishedClaimables,
} from '../../../../lib/claimables-repository';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getPublishedSectorBySlug(slug);
  if (!sector) {
    return {
      title: 'Sector Not Found — ClaimRadar India',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${sector.name} Sector — Public Claimables & Disgorgements | ClaimRadar India`,
    description: `Official regulatory orders, disgorgement schemes, and public claimable notices in the ${sector.name} sector in India.`,
    alternates: {
      canonical: `https://claimradar.in/sectors/${sector.slug}`,
    },
  };
}

export default async function SectorDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  const sector = await getPublishedSectorBySlug(slug);

  if (!sector) {
    notFound();
  }

  const { items: claimables, totalPages } = await getPublishedClaimables({
    sectorSlug: slug,
    page,
    limit: 10,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/sectors" className="hover:text-gray-700">
          Sectors
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{sector.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{sector.name} Sector</h1>
        <p className="mt-2 text-gray-600">
          Official regulatory orders, refund schemes, and public compensation frameworks in the{' '}
          {sector.name} industry.
        </p>
      </header>

      {/* Published Records */}
      <section>
        {claimables.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 border border-gray-200">
            No published public notices currently active in this sector.
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
                      {c.companyName}
                    </span>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">
                      <Link href={`/claimables/${c.slug}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{c.affectedGroup}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/sectors/${slug}?page=${p}`}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}
