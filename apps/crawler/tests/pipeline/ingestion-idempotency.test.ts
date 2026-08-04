import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDryRunWriter } from '../../src/pipeline/db-writer.js';
import {
  assignToCluster,
  createClusteringState,
} from '../../src/deduplication/provenance-dedup.js';

describe('Controlled Ingestion & Double-Run Idempotency Suite', () => {
  let dbWriter: InMemoryDryRunWriter;
  let clusteringState: ReturnType<typeof createClusteringState>;

  beforeEach(() => {
    dbWriter = new InMemoryDryRunWriter();
    clusteringState = createClusteringState();
  });

  it('should prove zero duplicate candidate creation and exact hash reuse on second ingestion run', async () => {
    const documentBatch = [
      {
        documentId: 'doc-ingest-1',
        sourceId: 'sebi-rss',
        url: 'https://sebi.gov.in/notice-101.pdf',
        canonicalUrl: 'https://sebi.gov.in/notice-101.pdf',
        contentHash: 'sha256-sebi-101-hash-value',
        title: 'SEBI Investor Disgorgement Order 101',
      },
      {
        documentId: 'doc-ingest-2',
        sourceId: 'rbi-rss',
        url: 'https://rbi.org.in/press-202.pdf',
        canonicalUrl: 'https://rbi.org.in/press-202.pdf',
        contentHash: 'sha256-rbi-202-hash-value',
        title: 'RBI Customer Relief Framework Notice',
      },
    ];

    // First Ingestion Run
    const run1Results = documentBatch.map((doc) => assignToCluster(clusteringState, doc));
    const firstRunNewClusters = run1Results.filter((r) => r.isNewCluster).length;
    expect(firstRunNewClusters).toBe(2);

    // Record in dry-run storage
    await dbWriter.createCrawlRun('completed');

    // Second Ingestion Run (Identical Document Batch)
    const run2Results = documentBatch.map((doc) => assignToCluster(clusteringState, doc));
    const secondRunNewClusters = run2Results.filter((r) => r.isNewCluster).length;
    const secondRunReusedClusters = run2Results.filter((r) => !r.isNewCluster).length;

    // Idempotency Assertions
    expect(secondRunNewClusters).toBe(0);
    expect(secondRunReusedClusters).toBe(2);
    expect(clusteringState.clusters.size).toBe(2);
  });
});
