import type { MetadataRoute } from 'next';
import { brandConfig } from '@claimradar/config';
import { GLOSSARY_TERMS } from '@/lib/glossary-content';
import {
  getPublishedClaimables,
  getPublishedCompanies,
  getPublishedSectors,
  getPublishedStates,
} from '@/lib/claimables-repository';

const SITE_URL = brandConfig.url;

/**
 * Genuine, indexable static routes.
 *
 * Deliberately excluded: auth pages, admin, the signed-in app, coming-soon
 * pages (/guides, /updates) and no-genuine-content detail routes. We never
 * list placeholder or demo content here.
 */
const STATIC_ROUTES = [
  '',
  '/how-it-works',
  '/pricing',
  '/about',
  '/faq',
  '/contact',
  '/methodology',
  '/sources',
  '/editorial-policy',
  '/corrections',
  '/disclaimer',
  '/security',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/subscription-policy',
  '/cookie-policy',
  '/acceptable-use',
  '/glossary',
  '/claimables',
  '/companies',
  '/sectors',
  '/states',
  '/deadlines',
  '/new',
  '/closing-soon',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const glossaryEntries: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((entry) => ({
    url: `${SITE_URL}/glossary/${entry.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Directory detail routes are only listed when the publication database
  // actually returns published, non-demo records. When the database is
  // unreachable or empty these entries are simply omitted — never fabricated.
  const dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const claimables = await getPublishedClaimables({ limit: 5000 });
    if (claimables.ok && !claimables.demo) {
      for (const item of claimables.data.items) {
        dynamicEntries.push({
          url: `${SITE_URL}/claimables/${item.slug}`,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    }

    const companies = await getPublishedCompanies();
    if (companies.ok && !companies.demo) {
      for (const company of companies.data) {
        dynamicEntries.push({
          url: `${SITE_URL}/companies/${company.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    const sectors = await getPublishedSectors();
    if (sectors.ok && !sectors.demo) {
      for (const sector of sectors.data) {
        dynamicEntries.push({
          url: `${SITE_URL}/sectors/${sector.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    const states = await getPublishedStates();
    if (states.ok && !states.demo) {
      for (const state of states.data) {
        dynamicEntries.push({
          url: `${SITE_URL}/states/${state.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
  } catch {
    // If anything unexpected happens while querying, ship only the static and
    // glossary entries rather than inventing URLs.
  }

  return [...staticEntries, ...glossaryEntries, ...dynamicEntries];
}
