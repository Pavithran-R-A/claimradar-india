/**
 * Crawl run summary generator — produces human-readable and JSON output.
 */

export interface CrawlSummary {
  runId: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  documentsDiscovered: number;
  documentsFetched: number;
  documentsUnchanged: number;
  documentsDuplicate: number;
  candidatesCreated: number;
  aiCallsUsed: number;
  aiCallsFailed: number;
  recordsPublished: number;
  recordsQueued: number;
  recordsRejected: number;
  errorCount: number;
}

export function createEmptySummary(runId: string): CrawlSummary {
  return {
    runId,
    startedAt: new Date(),
    completedAt: new Date(),
    durationMs: 0,
    sourcesAttempted: 0,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    documentsDiscovered: 0,
    documentsFetched: 0,
    documentsUnchanged: 0,
    documentsDuplicate: 0,
    candidatesCreated: 0,
    aiCallsUsed: 0,
    aiCallsFailed: 0,
    recordsPublished: 0,
    recordsQueued: 0,
    recordsRejected: 0,
    errorCount: 0,
  };
}

/** Human-readable summary text. */
export function formatSummaryText(s: CrawlSummary): string {
  const lines = [
    `=== Crawl Run ${s.runId} ===`,
    `Duration:      ${(s.durationMs / 1000).toFixed(1)}s`,
    `Sources:       ${s.sourcesSucceeded}/${s.sourcesAttempted} succeeded, ${s.sourcesFailed} failed`,
    `Documents:     ${s.documentsDiscovered} discovered, ${s.documentsFetched} fetched`,
    `               ${s.documentsUnchanged} unchanged, ${s.documentsDuplicate} duplicates`,
    `Candidates:    ${s.candidatesCreated} created`,
    `AI calls:      ${s.aiCallsUsed} used, ${s.aiCallsFailed} failed`,
    `Publications:  ${s.recordsPublished} published, ${s.recordsQueued} queued, ${s.recordsRejected} rejected`,
    `Errors:        ${s.errorCount}`,
  ];
  return lines.join('\n');
}

/** JSON-formatted summary (for machine consumption). */
export function formatSummaryJson(s: CrawlSummary): string {
  return JSON.stringify(
    {
      ...s,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt.toISOString(),
    },
    null,
    2,
  );
}
