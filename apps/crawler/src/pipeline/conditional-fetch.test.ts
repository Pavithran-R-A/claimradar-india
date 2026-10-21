import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { SourceDefinition } from '@claimradar/source-registry';
import type { HttpClient } from '../http/client.js';
import { IbbiPublicAnnouncementAdapter } from '../adapters/html/ibbi.js';
import { DatabaseWriter, type SourceDocumentDedupItem } from './db-writer.js';
import { withIbbiConditionalHeaders } from './conditional-fetch.js';

const PDF_URL = 'https://ibbi.gov.in/uploads/announcement/notice.pdf';
const document = { url: PDF_URL, title: 'Notice (Claims Deadline: 30-11-2026)' };
const previous: SourceDocumentDedupItem = {
  id: 'doc-1',
  source_id: 'ibbi-source',
  canonical_url: PDF_URL,
  title: document.title,
  content_hash: 'known-hash',
  source_identifier: null,
  published_at: null,
  etag: '"etag-v1"',
  last_modified: 'Wed, 21 Oct 2026 10:00:09 GMT',
};

describe('conditional IBBI PDF revalidation', () => {
  it('uses stored validators only for the exact same retained notice', () => {
    const fetched = withIbbiConditionalHeaders(
      document,
      'ibbi-public-announcement',
      'ibbi-source',
      [previous],
    );
    expect(fetched.conditionalHeaders).toEqual({
      etag: '"etag-v1"',
      lastModified: 'Wed, 21 Oct 2026 10:00:09 GMT',
    });
    expect(
      withIbbiConditionalHeaders(
        { ...document, title: 'Notice (Claims Deadline: 01-12-2026)' },
        'ibbi-public-announcement',
        'ibbi-source',
        [previous],
      ).conditionalHeaders,
    ).toBeUndefined();
    expect(
      withIbbiConditionalHeaders(document, 'sebi-public-notices', 'ibbi-source', [previous])
        .conditionalHeaders,
    ).toBeUndefined();
    expect(
      withIbbiConditionalHeaders(document, 'ibbi-public-announcement', 'other-source', [previous])
        .conditionalHeaders,
    ).toBeUndefined();
  });

  it('blocks unsafe persisted header values', () => {
    const result = withIbbiConditionalHeaders(document, 'ibbi-public-announcement', 'ibbi-source', [
      {
        ...previous,
        etag: 'bad' + String.fromCharCode(13, 10) + 'Injection: yes',
        last_modified: null,
      },
    ]);
    expect(result.conditionalHeaders).toBeUndefined();
  });

  it('passes validators into IBBI requests and accepts HTTP 304 without PDF parsing', async () => {
    const fetch = vi.fn().mockResolvedValue({
      statusCode: 304,
      body: Buffer.alloc(0),
      contentType: null,
      contentHash: '',
      etag: '"etag-v1"',
      lastModified: null,
      wasCached: true,
    });
    class StubAdapter extends IbbiPublicAnnouncementAdapter {
      protected override createHttpClient(): HttpClient {
        return { fetch } as unknown as HttpClient;
      }
    }
    const source = {
      id: 'ibbi-source',
      adapterType: 'ibbi-public-announcement',
      rateLimit: { requestsPerMinute: 10 },
    } as SourceDefinition;
    const adapter = new StubAdapter(source);
    const context = { runId: 'run', dryRun: true, userAgent: 'test', timeoutMs: 1000 };
    const data = await adapter.fetchDocument(
      withIbbiConditionalHeaders(document, 'ibbi-public-announcement', 'ibbi-source', [previous]),
      context,
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'If-None-Match': '"etag-v1"',
          'If-Modified-Since': previous.last_modified,
        },
      }),
      source.rateLimit,
    );
    expect(data.content).toBe('');
    expect(data.metadata['wasCached']).toBe(true);
  });

  it('paginates more than 1,000 historical rows in the direct database writer', async () => {
    const items = Array.from({ length: 1002 }, (_, i) => ({
      ...previous,
      id: `stored-${String(i).padStart(5, '0')}`,
    }));
    const pages: number[] = [];
    const database = {
      from(table: string) {
        expect(table).toBe('source_documents');
        return {
          select() {
            return {
              order(column: string) {
                expect(column).toBe('id');
                return {
                  async range(start: number, end: number) {
                    pages.push(start);
                    return { data: items.slice(start, end + 1), error: null };
                  },
                };
              },
            };
          },
        };
      },
    };
    const writer = new DatabaseWriter(database as never);
    const actual = await writer.getSourceDocumentsForDedup('ibbi-source');
    expect(actual).toHaveLength(1002);
    expect(actual[1001]?.etag).toBe('"etag-v1"');
    expect(pages).toEqual([0, 1000]);
  });

  it('preserves pagination on the deployed proxy source', () => {
    const source = readFileSync(
      new URL(
        '../../../../supabase/functions/claimradar-crawler-db-proxy/index.ts',
        import.meta.url,
      ),
      'utf8',
    );
    const operation = source
      .split("case 'getSourceDocumentsForDedup': {")[1]
      ?.split("case 'assignSourceDocumentToCluster': {")[0];
    expect(operation).toContain(".order('id', { ascending: true })");
    expect(operation).toContain('.range(page * pageSize, (page + 1) * pageSize - 1)');
    expect(operation).toContain('last_modified');
  });
});
