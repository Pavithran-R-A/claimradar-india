import type { MetadataRoute } from 'next';
import { brandConfig } from '@claimradar/config';

const SITE_URL = brandConfig.url;

const isPublicProductionDeployment = () =>
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && process.env.APP_ENV === 'production');

export default function robots(): MetadataRoute.Robots {
  // Only the real production deployment is crawlable. A Vercel Preview must
  // remain blocked even if APP_ENV was accidentally copied as "production".
  if (!isPublicProductionDeployment()) {
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
