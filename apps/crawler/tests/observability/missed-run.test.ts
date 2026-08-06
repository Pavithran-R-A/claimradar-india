import { describe, it, expect } from 'vitest';
import { evaluateMissedRun } from '../../src/observability/missed-run.js';

const NOW = new Date('2026-08-06T12:00:00Z');
const HOURS = 3600_000;

describe('Missed-run detection', () => {
  it('reports never_ran when no successful run exists', () => {
    const result = evaluateMissedRun({
      lastRunAt: null,
      lastRunStatus: null,
      lastSuccessAt: null,
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('never_ran');
    expect(result.alert).toBe(true);
  });

  it('reports ok when the last success is inside the window', () => {
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

  it('reports stale when the last success exceeds the window', () => {
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

  it('flags in-progress runs in the stale reason for operator clarity', () => {
    const result = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 1 * HOURS).toISOString(),
      lastRunStatus: 'running',
      lastSuccessAt: new Date(NOW.getTime() - 30 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('stale');
    expect(result.reason).toContain('in progress');
  });

  it('treats the boundary exactly at the threshold as ok', () => {
    const result = evaluateMissedRun({
      lastRunAt: new Date(NOW.getTime() - 26 * HOURS).toISOString(),
      lastRunStatus: 'completed',
      lastSuccessAt: new Date(NOW.getTime() - 26 * HOURS).toISOString(),
      maxAgeHours: 26,
      now: NOW,
    });
    expect(result.verdict).toBe('ok');
    expect(result.alert).toBe(false);
  });
});
