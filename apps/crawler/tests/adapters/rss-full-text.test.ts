import { describe, expect, it } from 'vitest';
import { BaseRssAdapter } from '../../src/adapters/rss/base.js';
import { parseRssItem } from '../../src/extraction/rss.js';
import type { CrawlContext, DiscoveredDocument } from '../../src/adapters/types.js';
import type { SourceDefinition } from '@claimradar/source-registry';

const source: SourceDefinition = {
  id: 'test-rss-source',
  name: 'Test RSS Source',
  domain: 'example.gov.in',
  sourceType: 'rss',
  adapterType: 'rss',
  baseUrl: 'https://example.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 60 },
  feedUrl: 'https://example.gov.in/feed.xml',
};

const context: CrawlContext = {
  runId: 'rss-test-run',
  dryRun: true,
  userAgent: 'ClaimRadar India/1.0',
  timeoutMs: 5000,
};

describe('RSS full-text preservation', () => {
  it('keeps a short excerpt alongside full item text', () => {
    const fullText = `Full item text ${'with detailed evidence '.repeat(40)}`.trim();
    const document = parseRssItem({
      title: 'Long RSS item',
      link: 'https://example.gov.in/item-1',
      contentSnippet: 'Short feed excerpt',
      content: `<p>${fullText}</p>`,
    });

    expect(document.description).toBe(fullText.slice(0, 500));
    expect(document.metadata?.['sourceText']).toBe(fullText);
    expect(document.metadata?.['rssExcerpt']).toBe(fullText.slice(0, 500));
  });

  it('carries full feed text into fetched source content', async () => {
    const adapter = Object.create(new BaseRssAdapter(source)) as BaseRssAdapter;
    adapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          url: 'https://example.gov.in/item-1',
          statusCode: 200,
          headers: { 'content-type': 'text/html' },
          body: Buffer.from('<main>Detail page text</main>'),
          contentType: 'text/html',
          contentHash: 'detail-hash',
          etag: null,
          lastModified: null,
          durationMs: 1,
          wasCached: false,
        }),
      }) as never;

    const fullText = `Full item text ${'with detailed evidence '.repeat(40)}`.trim();
    const document: DiscoveredDocument = {
      url: 'https://example.gov.in/item-1',
      title: 'Long RSS item',
      description: 'Short feed excerpt',
      metadata: { sourceText: fullText, rssExcerpt: fullText.slice(0, 500) },
    };

    const fetched = await adapter.fetchDocument(document, context);

    expect(fetched.content).toContain(fullText);
    expect(fetched.content).toContain('Detail page text');
    expect(fetched.metadata['sourceText']).toBe(fullText);
  });
});
