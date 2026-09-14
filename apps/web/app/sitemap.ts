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

export const dynamic = 'force-dynamic';

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

const validDate = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: generatedAt,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const glossaryEntries: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((entry) => ({
    url: `${SITE_URL}/glossary/${entry.slug}`,
    lastModified: generatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const claimables = await getPublishedClaimables({ limit: 5000 });
    if (claimables.ok && !claimables.demo) {
      for (const item of claimables.data.items) {
        dynamicEntries.push({
          url: `${SITE_URL}/claimables/${item.slug}`,
          lastModified: validDate(item.lastVerifiedAt) ?? validDate(item.publishedAt) ?? generatedAt,
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
          lastModified: generatedAt,
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
          lastModified: generatedAt,
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
          lastModified: generatedAt,
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
  } catch {
    // Never fabricate dynamic URLs when the publication database is unavailable.
  }

  return [...staticEntries, ...glossaryEntries, ...dynamicEntries];
}
