import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('ClaimKhoj customer-live release invariants', () => {
  it('uses the verified ClaimKhoj domain as the default public identity', () => {
    const config = read('../../../packages/config/src/index.ts');
    expect(config).toContain("'https://claimkhoj.app'");
    expect(config).not.toContain("'https://claimradar-staging.vercel.app'");
  });

  it('keeps the production sitemap dynamic and the preview crawl policy explicit', () => {
    const sitemap = read('../app/sitemap.ts');
    const robots = read('../app/robots.ts');
    expect(sitemap).toContain("export const dynamic = 'force-dynamic'");
    expect(robots).toContain("process.env.VERCEL_ENV === 'production'");
    expect(robots).toContain('process.env.VERCEL_ENV');
  });

  it('keeps IndexNow discovery fail-open and separate from publication safety', () => {
    const indexNow = read('../lib/indexnow.ts');
    expect(indexNow).toContain("reason: 'network_error'");
    expect(indexNow).toContain('console.warn');
    expect(indexNow).not.toContain('throw new Error');
  });
});
