import { describe, expect, it } from 'vitest';
import { BaseRssAdapter } from '../../src/adapters/rss/base.js';
import { parseRssItem } from '../../src/extraction/rss.js';
import type { HttpClient } from '../../src/http/client.js';

describe('RSS source text preservation', () => {
  it('keeps a full source text alongside the short description excerpt', () => {
    const fullText = 'Full feed text '.repeat(80).trim();
    const document = parseRssItem({
      link: 'https://example.gov.in/notices/1',
      title: 'Notice',
      contentSnippet: 'Short generated snippet',
      'content:encoded': `<p>${fullText}</p>`,
    });

    expect(document.description).toBe(fullText.slice(0, 500));
    expect(document.description).not.toBe(fullText);
    expect(document.metadata?.['sourceText']).toBe(fullText);
  });

  it('carries the full feed source text into fetched content', async () => {
    const source = {
      id: 'generic-rss',
      name: 'Generic RSS',
      domain: 'example.gov.in',
      sourceType: 'rss' as const,
      adapterType: 'rss',
      baseUrl: 'https://example.gov.in',
      feedUrl: 'https://example.gov.in/feed.xml',
      trustLevel: 'official' as const,
      rateLimit: { requestsPerMinute: 10 },
    };
    const adapter = new BaseRssAdapter(source);
    const testAdapter = Object.create(adapter) as BaseRssAdapter & {
      createHttpClient: () => HttpClient;
    };
    testAdapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          url: 'https://example.gov.in/notices/1',
          statusCode: 200,
          headers: { 'content-type': 'text/html' },
          body: Buffer.from('<main>Detail page text.</main>'),
          contentType: 'text/html',
          contentHash: 'detail-hash',
          etag: null,
          lastModified: null,
          wasCached: false,
        }),
      }) as unknown as HttpClient;

    const fetched = await testAdapter.fetchDocument(
      {
        url: 'https://example.gov.in/notices/1',
        title: 'Notice',
        metadata: { sourceText: 'Full feed source text beyond the excerpt.' },
      },
      {
        runId: 'test-run',
        dryRun: true,
        userAgent: 'ClaimRadar India/1.0',
        timeoutMs: 1_000,
      },
    );

    expect(fetched.content).toContain('Full feed source text beyond the excerpt.');
    expect(fetched.content).toContain('Detail page text.');
  });

  it('does not let a short contentSnippet replace full content', () => {
    const document = parseRssItem({
      link: 'https://example.gov.in/notices/2',
      contentSnippet: 'Short snippet',
      content: 'Longer source content with the evidence text.',
    });

    expect(document.metadata?.['sourceText']).toBe('Longer source content with the evidence text.');
    expect(document.description).toBe('Longer source content with the evidence text.');
  });
});
