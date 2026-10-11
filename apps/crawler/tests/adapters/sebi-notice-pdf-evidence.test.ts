import { describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../../src/http/client.js';

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getMetadata: () => Promise.resolve({ info: {} }),
      getPage: () =>
        Promise.resolve({
          getTextContent: () =>
            Promise.resolve({
              items: [
                {
                  str: 'Official SEBI refund notice. Investors with valid eligible receipts must follow the committee procedure and read all applicable conditions from this notice.',
                },
              ],
            }),
        }),
    }),
  })),
}));

import {
  findOfficialSebiNoticePdf,
  SebiPublicNoticesAdapter,
} from '../../src/adapters/html/sebi-public-notices.js';

const pageUrl =
  'https://www.sebi.gov.in/media-and-notifications/public-notices/sep-2026/example.html';
const pdfUrl = 'https://www.sebi.gov.in/sebi_data/attachdocs/sep-2026/1789025940211.pdf';
const html = `<html><body>
  <h1>OFFICIAL REFUND PUBLIC NOTICE</h1>
  <div class="date_value"><h5>Sep 10, 2026</h5></div>
  <div class="cover"><iframe src="https://www.sebi.gov.in/web/?file=${pdfUrl}"></iframe></div>
  </body></html>`;

describe('SEBI embedded official PDF evidence', () => {
  it('resolves an official viewer attachment, not arbitrary external viewer URLs', () => {
    expect(findOfficialSebiNoticePdf(html, pageUrl)).toBe(pdfUrl);
    const unsafeHtml = `<iframe src="https://www.sebi.gov.in/web/?file=https://evil.example/not-a-sebi-file.pdf"></iframe>`;
    expect(findOfficialSebiNoticePdf(unsafeHtml, pageUrl)).toBeNull();
  });

  it('fetches the actual PDF text and hashes enriched evidence, not the HTML wrapper', async () => {
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
    ) as SebiPublicNoticesAdapter & { createHttpClient: () => HttpClient };

    const fetchedUrls: string[] = [];
    adapter.createHttpClient = () =>
      ({
        fetch: async ({ url }: { url: string }) => {
          fetchedUrls.push(url);
          return {
            body: url === pdfUrl ? Buffer.from('%PDF mock bytes') : Buffer.from(html),
            contentHash: url === pdfUrl ? 'pdf-hash' : 'html-hash',
            contentType: url === pdfUrl ? 'application/pdf' : 'text/html',
            etag: null,
            lastModified: null,
          };
        },
      }) as unknown as HttpClient;

    const doc = await adapter.fetchDocument(
      { url: pageUrl, title: 'OFFICIAL REFUND PUBLIC NOTICE' },
      {
        runId: 'sebi-pdf-test',
        dryRun: true,
        userAgent: 'ClaimRadar India/1.0',
        timeoutMs: 5000,
      },
    );
    expect(fetchedUrls).toEqual([pageUrl, pdfUrl]);
    expect(doc.content).toContain('Investors with valid eligible receipts');
    expect(doc.contentHash).not.toBe('html-hash');
    expect(doc.metadata['officialPdfUrl']).toBe(pdfUrl);
    expect(doc.metadata['pdfLinks']).toEqual([pdfUrl]);
    expect(doc.metadata['evidenceComplete']).toBe(true);
    expect(doc.metadata['publishedAt']).toBe('2026-09-10T00:00:00.000Z');
  });

  it('never presents title-only HTML as complete PDF evidence', async () => {
    const url = 'https://evil.example/untrusted.pdf';
    const bad = `<h1>Claim something</h1><iframe src="${url}"></iframe>`;
    expect(findOfficialSebiNoticePdf(bad, pageUrl)).toBeNull();
  });
});
