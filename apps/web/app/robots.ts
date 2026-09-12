import type { MetadataRoute } from 'next';
import { brandConfig } from '@claimradar/config';

const SITE_URL = brandConfig.url;

export default function robots(): MetadataRoute.Robots {
  // Staging and preview deployments must never be indexed. Only the
  // production tier (APP_ENV=production) serves a crawlable robots policy;
  // every other tier (staging, development, unset) disallows everything.
  if (process.env.APP_ENV !== 'production') {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/auth/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/dashboard',
          '/settings',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
