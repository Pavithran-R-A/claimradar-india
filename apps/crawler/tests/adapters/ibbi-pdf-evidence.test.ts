import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getMetadata: () => Promise.resolve({ info: { Title: 'Official IBBI Notice' } }),
      getPage: () =>
        Promise.resolve({
          getTextContent: () =>
            Promise.resolve({
              items: [{ str: 'Actual PDF text from the official IBBI notice.', hasEOL: false }],
            }),
        }),
    }),
  })),
}));

import type { HttpClient } from '../../src/http/client.js';
import { IbbiPublicAnnouncementAdapter } from '../../src/adapters/html/ibbi.js';

describe('IBBI PDF evidence', () => {
  it('uses extracted PDF text instead of synthesized metadata text', async () => {
    const adapter = new IbbiPublicAnnouncementAdapter({
      id: 'ibbi-public-announcements',
      name: 'IBBI Corporate Insolvency Creditor Claims Notices',
      domain: 'ibbi.gov.in',
      sourceType: 'html_listing',
      adapterType: 'ibbi-public-announcement',
      baseUrl: 'https://ibbi.gov.in',
      trustLevel: 'official',
      rateLimit: { requestsPerMinute: 10 },
    });
    const testAdapter = Object.create(adapter) as IbbiPublicAnnouncementAdapter & {
      createHttpClient: () => HttpClient;
    };
    testAdapter.createHttpClient = () =>
      ({
        fetch: async () => ({
          url: 'https://ibbi.gov.in/public-announcement/notice.pdf',
          statusCode: 200,
          headers: { 'content-type': 'application/pdf' },
          body: Buffer.from('PDF_BYTES'),
          contentType: 'application/pdf',
          contentHash: 'pdf-hash',
          etag: null,
          lastModified: null,
          wasCached: false,
        }),
      }) as unknown as HttpClient;

    const fetched = await testAdapter.fetchDocument(
      {
        url: 'https://ibbi.gov.in/public-announcement/notice.pdf',
        title: 'Public Announcement: Example Debtor (Claims Deadline: 30-09-2026)',
        publishedAt: '2026-08-01T00:00:00.000Z',
        metadata: {
          corporateDebtor: 'Example Debtor',
          claimDeadline: '30-09-2026',
        },
      },
      {
        runId: 'test-run',
        dryRun: true,
        userAgent: 'ClaimRadar India/1.0',
        timeoutMs: 1_000,
      },
    );

    expect(fetched.content).toContain('Actual PDF text from the official IBBI notice.');
    expect(fetched.content).not.toContain('IBBI Public Announcement Document');
    expect(fetched.metadata['pageCount']).toBe(1);
  });
});
