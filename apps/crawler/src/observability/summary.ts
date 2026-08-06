/**
 * Crawl run summary generator — produces human-readable and JSON output.
 */

/** Per-source counters. Every attempted source gets exactly one entry, even on failure. */
export interface SourceSummary {
  sourceId: string;
  sourceName: string;
  status: 'succeeded' | 'failed';
  discovered: number;
  fetched: number;
  unchanged: number;
  duplicates: number;
  candidates: number;
  errors: number;
}

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
  /** One entry per attempted source, in attempt order — includes failed sources. */
  perSource: SourceSummary[];
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
    perSource: [],
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
    'Per-source:    (every attempted source is listed, including failures)',
    ...s.perSource.map(
      (p) =>
        `  ${p.sourceId.padEnd(12)} ${p.status === 'succeeded' ? 'OK  ' : 'FAIL'} ` +
        `discovered=${p.discovered} fetched=${p.fetched} unchanged=${p.unchanged} ` +
        `duplicates=${p.duplicates} candidates=${p.candidates} errors=${p.errors}`,
    ),
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
