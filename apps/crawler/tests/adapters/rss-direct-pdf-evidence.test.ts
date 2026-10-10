import { describe, expect, it, vi } from 'vitest';
import { sebiRssSource } from '@claimradar/source-registry';
import { BaseRssAdapter } from '../../src/adapters/rss/base.js';
import type { CrawlContext } from '../../src/adapters/types.js';

vi.mock('../../src/extraction/pdf.js', () => ({
  extractPdfText: vi.fn(async () => ({
    pageCount: 1,
    pages: [{ pageNumber: 1, text: 'Official SEBI source-backed order text' }],
    metadata: { author: 'SEBI' },
    warnings: [],
    isScanned: false,
  })),
}));

const context: CrawlContext = {
  runId: 'rss-pdf-test',
  dryRun: true,
  userAgent: 'ClaimRadar India/1.0',
  timeoutMs: 5_000,
};

describe('Direct RSS-to-PDF evidence extraction', () => {
  it('accepts official PDF MIME, extracts PDF text, and retains feed provenance', async () => {
    const adapter = Object.create(new BaseRssAdapter(sebiRssSource));
    let accepted: string[] | undefined;
    adapter.createHttpClient = () => ({
      fetch: async (request: { url: string; allowedMimeTypes?: string[] }) => {
        accepted = request.allowedMimeTypes;
        return {
          body: Buffer.from('%PDF-1.4 test bytes'),
          contentType: 'application/pdf',
          contentHash: 'raw-pdf-sha',
          etag: null,
          lastModified: null,
          wasCached: false,
          transport: 'DIRECT',
        };
      },
    });

    const record = await adapter.fetchDocument(
      {
        url: 'https://www.sebi.gov.in/sebi_data/commondocs/oct-2026/order.pdf',
        title: 'Official SEBI document',
        metadata: { originalRssLink: 'original source link', sourceText: 'RSS notice evidence' },
      },
      context,
    );
    expect(accepted).toContain('application/pdf');
    expect(record.content).toContain('Official SEBI source-backed order text');
    expect(record.content).toContain('RSS notice evidence');
    expect(record.contentType).toBe('application/pdf');
    expect(record.metadata?.['originalRssLink']).toBe('original source link');
    expect(record.metadata?.['pageCount']).toBe(1);
    expect(record.metadata?.['ocr_required']).toBeUndefined();
  });
});
