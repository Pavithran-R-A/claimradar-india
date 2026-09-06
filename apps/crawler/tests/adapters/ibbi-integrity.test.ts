import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(({ data }: { data: Uint8Array }) => {
    const empty = Buffer.from(data).toString('utf-8') === 'EMPTY_PDF';
    return {
      promise: Promise.resolve({
        numPages: 1,
        getPage: async () => ({
          getTextContent: async () => ({
            items: empty
              ? []
              : [
                  { str: 'Official extracted IBBI PDF text', hasEOL: false },
                  { str: 'with creditor claim instructions.', hasEOL: false },
                ],
          }),
        }),
        getMetadata: async () => ({
          info: { Title: 'Official IBBI Announcement' },
        }),
      }),
    };
  }),
}));

import { IbbiPublicAnnouncementAdapter } from '../../src/adapters/html/ibbi.js';
import type { CrawlContext, DiscoveredDocument } from '../../src/adapters/types.js';
import type { SourceDefinition } from '@claimradar/source-registry';

const source: SourceDefinition = {
  id: 'ibbi-public-announcements',
  name: 'IBBI Corporate Insolvency Creditor Claims Notices',
  domain: 'ibbi.gov.in',
  sourceType: 'html_listing',
  adapterType: 'ibbi-public-announcement',
  baseUrl: 'https://ibbi.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

const context: CrawlContext = {
  runId: 'ibbi-test-run',
  dryRun: true,
  userAgent: 'ClaimRadar India/1.0',
  timeoutMs: 5000,
};

describe('IBBI PDF evidence integrity', () => {
  it('leaves the publication date unknown when the listing omits it', async () => {
    const adapter = Object.create(
      new IbbiPublicAnnouncementAdapter(source),
    ) as IbbiPublicAnnouncementAdapter;
    adapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          body: Buffer.from(
            '<table><tr><td>Public Announcement</td><td></td><td>31-12-2099</td><td>Example Debtor</td></tr></table>',
          ),
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

  it('uses extracted PDF text instead of row metadata', async () => {
    const adapter = Object.create(
      new IbbiPublicAnnouncementAdapter(source),
    ) as IbbiPublicAnnouncementAdapter;
    adapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          url: 'https://ibbi.gov.in/announcement.pdf',
          statusCode: 200,
          headers: { 'content-type': 'application/pdf' },
          body: Buffer.from('PDF_BYTES'),
          contentType: 'application/pdf',
          contentHash: 'pdf-hash',
          etag: null,
          lastModified: null,
          durationMs: 1,
          wasCached: false,
        }),
      }) as never;

    const document: DiscoveredDocument = {
      url: 'https://ibbi.gov.in/announcement.pdf',
      title: 'CIRP: Metadata Corporation',
      metadata: {
        corporateDebtor: 'Metadata Corporation',
        claimDeadline: '31-12-2099',
      },
    };

    const fetched = await adapter.fetchDocument(document, context);

    expect(fetched.content).toBe(
      'Official extracted IBBI PDF text with creditor claim instructions.',
    );
    expect(fetched.content).not.toContain('Metadata Corporation');
    expect(fetched.metadata['pageCount']).toBe(1);
    expect(fetched.metadata['warnings']).toEqual(expect.any(Array));
  });

  it('keeps scanned PDF content empty for OCR review', async () => {
    const adapter = Object.create(
      new IbbiPublicAnnouncementAdapter(source),
    ) as IbbiPublicAnnouncementAdapter;
    adapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          url: 'https://ibbi.gov.in/scanned.pdf',
          statusCode: 200,
          headers: { 'content-type': 'application/pdf' },
          body: Buffer.from('EMPTY_PDF'),
          contentType: 'application/pdf',
          contentHash: 'scanned-hash',
          etag: null,
          lastModified: null,
          durationMs: 1,
          wasCached: false,
        }),
      }) as never;

    const fetched = await adapter.fetchDocument(
      { url: 'https://ibbi.gov.in/scanned.pdf', title: 'Scanned notice' },
      context,
    );

    expect(fetched.content).toBe('');
    expect(fetched.metadata['ocr_required']).toBe(true);
  });
});
