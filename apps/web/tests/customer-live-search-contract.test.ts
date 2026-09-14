import { afterEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { brandConfig } from '@claimradar/config';
import robots from '../app/robots';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

const originalVercelEnv = process.env.VERCEL_ENV;
const originalAppEnv = process.env.APP_ENV;

afterEach(() => {
  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnv;

  if (originalAppEnv === undefined) delete process.env.APP_ENV;
  else process.env.APP_ENV = originalAppEnv;
});

describe('ClaimKhoj customer-live search contract', () => {
  it('makes the Vercel production deployment crawlable while keeping private routes blocked', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.APP_ENV = 'staging';

    const policy = robots();
    expect(policy.sitemap).toBe(`${brandConfig.url}/sitemap.xml`);
    expect(policy.rules).toEqual([
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
    ]);
  });

  it('keeps Vercel previews non-indexable even if APP_ENV was copied as production', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.APP_ENV = 'production';

    expect(robots()).toEqual({
      rules: [{ userAgent: '*', disallow: '/' }],
    });
  });

  it('uses the configured public origin for dynamic canonicals', () => {
    const detail = read('../app/(public)/claimables/[slug]/page.tsx');
    const company = read('../app/(public)/companies/[slug]/page.tsx');
    const sector = read('../app/(public)/sectors/[slug]/page.tsx');

    for (const source of [detail, company, sector]) {
      expect(source).not.toContain('https://claimradar.in');
      expect(source).toContain('brandConfig.url');
    }
  });
});
