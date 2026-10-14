import { describe, expect, it } from 'vitest';
import { crawlRunCompletionStatus } from '../../src/observability/crawl-run-status.js';

const baseline = () => ({
  sourcesAttempted: 7,
  sourcesSucceeded: 7,
  sourcesFailed: 0,
  errorCount: 0,
  expectedLimitationCount: 0,
  unexpectedErrorCount: 0,
  aiCallsFailed: 0,
});

describe('scheduled crawl terminal status', () => {
  it('accepts a clean seven-source crawl', () => {
    expect(crawlRunCompletionStatus(baseline())).toBe('completed');
  });

  it('preserves the warning audit without presenting expected PDF exclusions as failed crawls', () => {
    expect(
      crawlRunCompletionStatus({ ...baseline(), errorCount: 1, expectedLimitationCount: 1 }),
    ).toBe('completed');
  });

  it('does not hide failed AI extraction behind otherwise expected source exclusions', () => {
    expect(
      crawlRunCompletionStatus({
        ...baseline(),
        errorCount: 1,
        expectedLimitationCount: 1,
        aiCallsFailed: 2,
      }),
    ).toBe('completed_with_errors');
  });

  it('rejects unexpected, unclassified, and failed-source outcomes', () => {
    expect(
      crawlRunCompletionStatus({
        ...baseline(),
        errorCount: 1,
        unexpectedErrorCount: 1,
      }),
    ).toBe('completed_with_errors');
    expect(crawlRunCompletionStatus({ ...baseline(), errorCount: 1 })).toBe(
      'completed_with_errors',
    );
    expect(
      crawlRunCompletionStatus({
        ...baseline(),
        sourcesSucceeded: 6,
        sourcesFailed: 1,
        errorCount: 1,
      }),
    ).toBe('completed_with_errors');
  });

  it('treats zero work, inconsistent counts and invalid counters as errors', () => {
    expect(crawlRunCompletionStatus({ ...baseline(), sourcesAttempted: 0, sourcesSucceeded: 0 })).toBe(
      'completed_with_errors',
    );
    expect(crawlRunCompletionStatus({ ...baseline(), sourcesSucceeded: 6 })).toBe(
      'completed_with_errors',
    );
    expect(crawlRunCompletionStatus({ ...baseline(), errorCount: Number.NaN })).toBe(
      'completed_with_errors',
    );
  });
});
