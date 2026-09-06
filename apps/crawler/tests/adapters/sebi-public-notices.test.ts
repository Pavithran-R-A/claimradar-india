import { describe, expect, it } from 'vitest';
import { SebiPublicNoticesAdapter } from '../../src/adapters/html/sebi-public-notices.js';
import type { CrawlContext } from '../../src/adapters/types.js';

const context: CrawlContext = {
  runId: 'sebi-notices-test',
  dryRun: true,
  userAgent: 'ClaimRadar India/1.0',
  timeoutMs: 5_000,
};

describe('SEBI public notices adapter', () => {
  it('does not invent a publication date from crawl time', async () => {
    const adapter = Object.create(
      new SebiPublicNoticesAdapter({
        id: 'sebi-public-notices',
        name: 'SEBI Public Notices',
        domain: 'sebi.gov.in',
        sourceType: 'html_listing',
        adapterType: 'sebi-public-notices',
        baseUrl: 'https://www.sebi.gov.in',
        trustLevel: 'official',
        rateLimit: { requestsPerMinute: 10 },
      }),
    ) as SebiPublicNoticesAdapter;
    adapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          body: Buffer.from('<a href="/notice.html">Public notice without a source date</a>'),
          contentHash: 'listing-hash',
          contentType: 'text/html',
          statusCode: 200,
          etag: null,
          lastModified: null,
          durationMs: 1,
          wasCached: false,
        }),
      }) as never;

    const [document] = await adapter.discover(context);

    expect(document?.publishedAt).toBeUndefined();
  });
});
