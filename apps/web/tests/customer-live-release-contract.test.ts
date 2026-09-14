import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('ClaimKhoj customer-live release invariants', () => {
  it('keeps the canonical Vercel origin as the default public identity', () => {
    const config = read('../../../packages/config/src/index.ts');
    expect(config).toContain("'https://claimradar-staging.vercel.app'");
    expect(config).not.toContain("'https://claimradar.in'");
  });

  it('keeps the production sitemap dynamic and the preview crawl policy explicit', () => {
    const sitemap = read('../app/sitemap.ts');
    const robots = read('../app/robots.ts');
    expect(sitemap).toContain("export const dynamic = 'force-dynamic'");
    expect(robots).toContain("process.env.VERCEL_ENV === 'production'");
    expect(robots).toContain("process.env.VERCEL_ENV");
  });

  it('keeps IndexNow discovery fail-open and separate from publication safety', () => {
    const indexNow = read('../lib/indexnow.ts');
    expect(indexNow).toContain("reason: 'network_error'");
    expect(indexNow).toContain('console.warn');
    expect(indexNow).not.toContain('throw new Error');
  });
});
