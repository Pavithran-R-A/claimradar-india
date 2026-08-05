import { describe, it, expect } from 'vitest';
import { createEmptySummary } from '../../src/observability/summary.js';

describe('Crawl Summary Aggregation Suite', () => {
  it('should accurately aggregate candidate decisions across dry-run and live executions', () => {
    const summary = createEmptySummary('test-run-1');

    summary.sourcesAttempted = 4;
    summary.sourcesSucceeded = 3;
    summary.sourcesFailed = 1;
    summary.documentsDiscovered = 60;
    summary.documentsFetched = 39;
    summary.candidatesCreated = 3;
    summary.recordsPublished = 0;
    summary.recordsQueued = 1;
    summary.recordsRejected = 2;
    summary.errorCount = 21;

    expect(summary.sourcesAttempted).toBe(4);
    expect(summary.sourcesSucceeded).toBe(3);
    expect(summary.sourcesFailed).toBe(1);
    expect(summary.candidatesCreated).toBe(3);
    expect(summary.recordsPublished + summary.recordsQueued + summary.recordsRejected).toBe(3);
    expect(summary.recordsRejected).toBe(2);
    expect(summary.recordsQueued).toBe(1);
  });
});
