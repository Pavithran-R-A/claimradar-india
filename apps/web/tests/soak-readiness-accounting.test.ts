import { describe, it, expect } from 'vitest';
import {
  evaluateSoakMetrics,
  calculateElapsedSoakHours,
  calculateExpectedSoakRuns,
  isRunValidSoakExecution,
} from '../../../scripts/summarize-soak-readiness.mjs';

const mockBaselineConfig = {
  runtimeFreezeHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineGhaRun: '33310672900',
  finalSoakBaselineHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakStartUtc: '2026-08-30T12:08:03Z',
  scheduleIntervalHours: 6,
  thresholdHours48: 48,
  thresholdHours72: 72,
  minRunsFor48h: 8,
  minRunsFor72h: 12,
};

function createMockRun(overrides = {}) {
  return {
    id: 'test-run-' + Math.random().toString(36).substring(7),
    started_at: '2026-08-30T12:08:03.000Z',
    completed_at: '2026-08-30T12:12:01.000Z',
    status: 'completed',
    sources_attempted: 7,
    sources_succeeded: 7,
    sources_failed: 0,
    documents_discovered: 106,
    candidates_created: 0,
    error_count: 0,
    unexpected_error_count: 0,
    records_published: 0,
    metadata: {
      effectivePolicyGuards: {
        APP_ENV: 'staging',
        AUTO_VERIFY_CLAIMABLES: false,
        ENABLE_BILLING: false,
        NOTIFY_CUSTOMERS_ENABLED: false,
      },
    },
    ...overrides,
  };
}

describe('Soak Readiness Accounting & Baseline Scoping', () => {
  it('A: excludes old successful runs before baseline from final soak count', () => {
    const oldRun = createMockRun({
      started_at: '2026-08-29T10:00:00.000Z',
      completed_at: '2026-08-29T10:02:00.000Z',
    });
    const currentRun = createMockRun({
      started_at: '2026-08-30T12:09:00.000Z',
      completed_at: '2026-08-30T12:11:00.000Z',
    });

    const metrics = evaluateSoakMetrics(
      [oldRun, currentRun],
      mockBaselineConfig,
      new Date('2026-08-30T13:08:03Z'),
    );

    expect(metrics.preBaselineRunsCount).toBe(1);
    expect(metrics.finalSoakRunsCount).toBe(1);
    expect(metrics.validFinalSoakRunsCount).toBe(1);
  });

  it('B: excludes old failed runs before baseline from FINAL_FAILED_SOAK_RUNS', () => {
    const oldFailedRun = createMockRun({
      started_at: '2026-08-29T12:00:00.000Z',
      status: 'failed',
      sources_failed: 2,
    });
    const validPostBaselineRun = createMockRun({
      started_at: '2026-08-30T12:08:03.000Z',
    });

    const metrics = evaluateSoakMetrics(
      [oldFailedRun, validPostBaselineRun],
      mockBaselineConfig,
      new Date('2026-08-30T13:08:03Z'),
    );

    expect(metrics.preBaselineFailuresCount).toBe(1);
    expect(metrics.failedFinalSoakRunsCount).toBe(0);
    expect(metrics.validFinalSoakRunsCount).toBe(1);
  });

  it('C: counts successful runs after baseline', () => {
    const run1 = createMockRun({ started_at: '2026-08-30T12:08:03.000Z' });
    const run2 = createMockRun({ started_at: '2026-08-30T18:17:00.000Z' });

    const metrics = evaluateSoakMetrics(
      [run1, run2],
      mockBaselineConfig,
      new Date('2026-08-30T19:00:00Z'),
    );

    expect(metrics.finalSoakRunsCount).toBe(2);
    expect(metrics.validFinalSoakRunsCount).toBe(2);
    expect(metrics.failedFinalSoakRunsCount).toBe(0);
  });

  it('D: counts failed run after baseline as failure and prevents PASS', () => {
    const run1 = createMockRun({ started_at: '2026-08-30T12:08:03.000Z' });
    const run2Failed = createMockRun({
      started_at: '2026-08-30T18:17:00.000Z',
      status: 'failed',
      error_count: 1,
    });

    const metrics = evaluateSoakMetrics(
      [run1, run2Failed],
      mockBaselineConfig,
      new Date('2026-09-02T13:00:00Z'), // >48h later
    );

    expect(metrics.failedFinalSoakRunsCount).toBe(1);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('E: 47h59m elapsed -> SOAK_48H=PENDING_TIME_SOAK', () => {
    // 47 hours and 59 minutes after 2026-08-30T12:08:03Z -> 2026-09-01T12:07:03Z
    const currentTime = new Date('2026-09-01T12:07:03Z');
    const runs = [];
    for (let i = 0; i < 9; i++) {
      runs.push(
        createMockRun({
          started_at: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 5 * 3600000,
          ).toISOString(),
        }),
      );
    }

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.elapsedSoakHours).toBeLessThan(48);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('F: 48h elapsed but missing expected scheduled runs -> still not PASS', () => {
    const currentTime = new Date('2026-09-01T13:08:03Z'); // 49 hours elapsed
    // Only 2 runs present (expected at least 8)
    const runs = [
      createMockRun({ started_at: '2026-08-30T12:08:03.000Z' }),
      createMockRun({ started_at: '2026-08-30T18:17:00.000Z' }),
    ];

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.validFinalSoakRunsCount).toBe(2);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('G: 48h elapsed with valid expected runs -> PASS', () => {
    const currentTime = new Date('2026-09-01T13:08:03Z'); // 49 hours elapsed
    const runs = [];
    for (let i = 0; i < 9; i++) {
      runs.push(
        createMockRun({
          started_at: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 5 * 3600000,
          ).toISOString(),
        }),
      );
    }

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.validFinalSoakRunsCount).toBe(9);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('H: 71h59m -> SOAK_72H=PENDING_TIME_SOAK', () => {
    const currentTime = new Date('2026-09-02T12:07:03Z'); // 71h59m
    const runs = [];
    for (let i = 0; i < 13; i++) {
      runs.push(
        createMockRun({
          started_at: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 5 * 3600000,
          ).toISOString(),
        }),
      );
    }

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.elapsedSoakHours).toBeLessThan(72);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('I: 72h with valid schedule/run evidence -> PASS', () => {
    const currentTime = new Date('2026-09-02T13:08:03Z'); // 73 hours
    const runs = [];
    for (let i = 0; i < 13; i++) {
      runs.push(
        createMockRun({
          started_at: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 5 * 3600000,
          ).toISOString(),
        }),
      );
    }

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(72);
    expect(metrics.validFinalSoakRunsCount).toBe(13);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PASS');
  });

  it('J: many manual runs cannot accelerate elapsed soak time', () => {
    const currentTime = new Date('2026-08-30T13:08:03Z'); // only 1 hour after baseline
    const runs = [];
    for (let i = 0; i < 20; i++) {
      runs.push(
        createMockRun({
          started_at: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 60000,
          ).toISOString(),
        }),
      );
    }

    const metrics = evaluateSoakMetrics(runs, mockBaselineConfig, currentTime);
    expect(metrics.validFinalSoakRunsCount).toBe(20);
    expect(metrics.elapsedSoakHours).toBe(1);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('K: future or invalid baseline timestamp fails closed', () => {
    const invalidConfig = {
      ...mockBaselineConfig,
      finalSoakStartUtc: '2099-01-01T00:00:00Z', // Future date
    };
    const metrics = evaluateSoakMetrics(
      [createMockRun()],
      invalidConfig,
      new Date('2026-08-30T13:08:03Z'),
    );

    expect(metrics.isBaselineValid).toBe(false);
    expect(metrics.elapsedSoakHours).toBe(0);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('L: tests helper functions calculateElapsedSoakHours, calculateExpectedSoakRuns, and isRunValidSoakExecution', () => {
    expect(calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z')).toBe(6);
    expect(calculateExpectedSoakRuns(0)).toBe(1);
    expect(calculateExpectedSoakRuns(6)).toBe(2);
    expect(calculateExpectedSoakRuns(48)).toBe(9);

    const validRun = createMockRun();
    expect(isRunValidSoakExecution(validRun)).toBe(true);

    const invalidRunNoSources = createMockRun({ sources_attempted: 0 });
    expect(isRunValidSoakExecution(invalidRunNoSources)).toBe(false);

    const invalidRunErrors = createMockRun({ error_count: 1 });
    expect(isRunValidSoakExecution(invalidRunErrors)).toBe(false);

    const invalidRunGuard = createMockRun({
      metadata: { effectivePolicyGuards: { ENABLE_BILLING: true } },
    });
    expect(isRunValidSoakExecution(invalidRunGuard)).toBe(false);
  });
});
