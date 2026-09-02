import { describe, expect, beforeEach, it, vi } from 'vitest';
import type { SourceDefinition } from '@claimradar/source-registry';
import type { SourceAdapter } from '../../src/adapters/types.js';
import type { FetchedDocument } from '../../src/adapters/types.js';
import { InMemoryDryRunWriter } from '../../src/pipeline/db-writer.js';

vi.mock('../../src/adapters/registry.js', () => ({ getAdapter: vi.fn() }));

import { getAdapter } from '../../src/adapters/registry.js';
import { runPipeline } from '../../src/pipeline/index.js';

const getAdapterMock = vi.mocked(getAdapter);

function fetchedDocument(url: string): FetchedDocument {
  return {
    url,
    content: 'Routine administrative notice.',
    contentType: 'text/html',
    contentHash: `hash-${url}`,
    etag: null,
    lastModified: null,
    fetchedAt: new Date('2026-09-01T00:00:00.000Z'),
    metadata: {},
  };
}

describe('pipeline document failure propagation', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = 'true';
    process.env.LIVE_ADAPTERS_ENABLED = 'false';
    getAdapterMock.mockReset();
  });

  it('marks a source failed when one document fetch fails', async () => {
    const source: SourceDefinition = {
      id: 'legacy-pib',
      name: 'Legacy PIB source',
      domain: 'pib.gov.in',
      sourceType: 'rss',
      adapterType: 'pib_rss_demo',
      baseUrl: 'https://pib.gov.in',
      feedUrl: 'https://pib.gov.in/feed.xml',
      trustLevel: 'official',
      rateLimit: { requestsPerMinute: 10 },
    };
    const adapter: SourceAdapter = {
      sourceKey: source.id,
      discover: async () => [
        { url: 'https://pib.gov.in/failed' },
        { url: 'https://pib.gov.in/healthy', title: 'Routine notice' },
      ],
      fetchDocument: async (document) => {
        if (document.url.endsWith('/failed')) throw new Error('HTTP 403 error');
        return fetchedDocument(document.url);
      },
      healthCheck: async () => ({ ok: true, latencyMs: 1 }),
    };
    const receivedDefinitions: SourceDefinition[] = [];
    getAdapterMock.mockImplementation((definition) => {
      receivedDefinitions.push(definition);
      return adapter;
    });

    const summary = await runPipeline({
      dryRun: true,
      skipAI: true,
      storage: new InMemoryDryRunWriter([source]),
    });

    expect(receivedDefinitions[0]?.adapterType).toBe('rss-pib');
    expect(summary.documentsDiscovered).toBe(2);
    expect(summary.documentsFetched).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.sourcesSucceeded).toBe(0);
    expect(summary.sourcesFailed).toBe(1);
    expect(summary.perSource[0]).toMatchObject({
      status: 'failed',
      errors: 1,
    });
  });
});
