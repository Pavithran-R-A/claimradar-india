import { describe, it, expect } from 'vitest';
import { evaluateMissedRun } from '../../src/observability/missed-run.js';

const NOW = new Date('2026-08-06T12:00:00Z');
const HOURS = 3600_000;

describe('Missed-run detection', () => {
  it('1. brand-new staging: reports initializing (no alert) when totalCrawlRuns is 0', () => {
    const result = evaluateMissedRun({
      lastRunAt: null,
      lastRunStatus: null,
      lastSuccessAt: null,
      totalCrawlRuns: 0,
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('initializing');
    expect(result.alert).toBe(false);
    expect(result.reason).toContain('Fresh environment initializing (0 historical crawl runs)');
  });

  it('1b. brand-new staging: reports initializing (no alert) when environment is fresh within grace window', () => {
    const result = evaluateMissedRun({
      lastRunAt: null,
      lastRunStatus: null,
      lastSuccessAt: null,
      environmentCreatedAt: new Date(NOW.getTime() - 2 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('initializing');
    expect(result.alert).toBe(false);
    expect(result.reason).toContain('Fresh environment initializing');
  });

  it('2. first crawl success: reports ok (no alert) when a successful run exists inside window', () => {
    const result = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 2 * HOURS).toISOString(),
      lastRunStatus: 'completed',
      lastSuccessAt: new Date(NOW.getTime() - 2 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('ok');
    expect(result.alert).toBe(false);
    expect(result.ageHours).toBeCloseTo(2, 5);
  });

  it('3. missed scheduled crawl after baseline: reports stale (alert true) when age exceeds maxAgeHours', () => {
    const result = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 40 * HOURS).toISOString(),
      lastRunStatus: 'failed',
      lastSuccessAt: new Date(NOW.getTime() - 40 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('stale');
    expect(result.alert).toBe(true);
    expect(result.reason).toContain('40.0h');
  });

  it('4. recovery: new successful run arrives and restores verdict to ok (no alert)', () => {
    // Before recovery (stale)
    const staleResult = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 30 * HOURS).toISOString(),
      lastRunStatus: 'failed',
      lastSuccessAt: new Date(NOW.getTime() - 30 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(staleResult.verdict).toBe('stale');
    expect(staleResult.alert).toBe(true);

    // After recovery run completes
    const recoveredNow = new Date(NOW.getTime() + 1 * HOURS);
    const recoveredResult = evaluateMissedRun({
      lastRunAt: new Date(recoveredNow.getTime() - 10 * 60 * 1000).toISOString(),
      lastRunStatus: 'completed',
      lastSuccessAt: new Date(recoveredNow.getTime() - 10 * 60 * 1000).toISOString(),
      maxAgeHours: 26,
      now: recoveredNow,
    });
    expect(recoveredResult.verdict).toBe('ok');
    expect(recoveredResult.alert).toBe(false);
  });

  it('reports never_ran when no successful run exists, totalCrawlRuns > 0, and environment age exceeds threshold', () => {
    const result = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 30 * HOURS).toISOString(),
      lastRunStatus: 'failed',
      lastSuccessAt: null,
      totalCrawlRuns: 1,
      environmentCreatedAt: new Date(NOW.getTime() - 30 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('never_ran');
    expect(result.alert).toBe(true);
  });
});
