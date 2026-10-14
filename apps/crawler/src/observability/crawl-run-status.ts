/**
 * Customer-facing crawl health must distinguish controlled source exclusions
 * from actual ingestion/AI failures. The full audit counts are kept intact:
 * an oversized PDF or known restricted detail page is not a healthy fetch,
 * but does not automatically mean the entire scheduled crawl failed.
 */
export interface CrawlRunFinalization {
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  errorCount: number;
  expectedLimitationCount: number;
  unexpectedErrorCount: number;
  aiCallsFailed: number;
}

export function crawlRunCompletionStatus(
  summary: CrawlRunFinalization,
): 'completed' | 'completed_with_errors' {
  const counters = [
    summary.sourcesAttempted,
    summary.sourcesSucceeded,
    summary.sourcesFailed,
    summary.errorCount,
    summary.expectedLimitationCount,
    summary.unexpectedErrorCount,
    summary.aiCallsFailed,
  ];
  const audited = counters.every((count) => Number.isSafeInteger(count) && count >= 0);
  const healthy =
    audited &&
    summary.sourcesAttempted > 0 &&
    summary.sourcesAttempted === summary.sourcesSucceeded &&
    summary.sourcesFailed === 0 &&
    summary.unexpectedErrorCount === 0 &&
    summary.aiCallsFailed === 0 &&
    summary.errorCount === summary.expectedLimitationCount;
  return healthy ? 'completed' : 'completed_with_errors';
}
