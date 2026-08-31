import { describe, it, expect } from 'vitest';
import {
  loadBaselineConfig,
  validateSoakExecution,
  calculateElapsedSoakHours,
  generateScheduledSlots,
  evaluateSoakProvenance,
} from '../../../scripts/summarize-soak-readiness.mjs';

const mockBaselineConfig = {
  runtimeFreezeHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineGhaRun: '33310672900',
  finalSoakBaselineHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineCrawlRunId: '192c24d3-bcbb-4c21-bb38-b737be5261c0',
  finalSoakStartUtc: '2026-08-30T12:08:03Z',
  firstPostBaselineScheduledSlot: '2026-08-30T18:17:00Z',
  scheduleCron: '17 */6 * * *',
  scheduleIntervalHours: 6,
  thresholdHours48: 48,
  thresholdHours72: 72,
  minRunsFor48h: 8,
  minRunsFor72h: 12,
  minScheduledRunsFor48h: 7,
  minScheduledRunsFor72h: 11,
};

function createMockSoakSample(overrides = {}) {
  const crawlRunId = 'crawl-' + Math.random().toString(36).substring(7);
  return {
    executionType: 'FINAL_SOAK',
    workflowRun: {
      id: 'gha-' + Math.random().toString(36).substring(7),
      workflow: 'staging-soak.yml',
      event: 'schedule',
      conclusion: 'success',
      headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
      startedAt: '2026-08-30T18:17:00Z',
    },
    summary: {
      runId: crawlRunId,
      sourcesAttempted: 7,
      sourcesSucceeded: 7,
      sourcesFailed: 0,
      documentsDiscovered: 106,
      documentsFetched: 106,
      errorCount: 0,
      unexpectedErrorCount: 0,
      recordsPublished: 0,
      effectivePolicyGuards: {
        APP_ENV: 'staging',
        AUTO_VERIFY_CLAIMABLES: false,
        ENABLE_BILLING: false,
        NOTIFY_CUSTOMERS_ENABLED: false,
        LIVE_ADAPTERS_ENABLED: true,
      },
    },
    crawlRunId,
    dbCrawlRun: {
      id: crawlRunId,
      status: 'completed',
      started_at: '2026-08-30T18:18:00Z',
      sources_attempted: 7,
      sources_succeeded: 7,
      documents_discovered: 106,
      metadata: {},
    },
    dbSources: Array.from({ length: 7 }, (_, i) => ({
      id: 'source-' + i,
      crawl_run_id: crawlRunId,
      source_id: 'src-' + i,
      status: 'completed',
      documents_found: 15,
      error_message: null,
    })),
    dbErrors: [],
    runtimeBehaviorChangedForRun: false,
    ...overrides,
  };
}

describe('Dynamic Soak Evidence Collection & Conservative Qualification Model', () => {
  it('A: schedule-triggered run delayed ~175 minutes still counts if runtime, artifact, and DB are valid', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const delayedRun = createMockSoakSample({
      workflowRun: {
        id: '33335730116',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T21:11:31Z', // 174.5 min after 18:17
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, delayedRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T22:00:00Z'),
    });

    expect(metrics.observedScheduleRunsCount).toBe(1);
    expect(metrics.validScheduleRunsCount).toBe(1);
    expect(metrics.failedScheduleRunsCount).toBe(0);
    expect(metrics.maxScheduleStartDelayMinutes).toBeCloseTo(174.5, 0);
  });

  it('B: delayed run does not become a runtime failure merely because it exceeded the old 60-minute grace', () => {
    const delayedRun = createMockSoakSample({
      workflowRun: {
        id: '33335730116',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T21:11:31Z',
      },
    });

    const validation = validateSoakExecution(delayedRun);
    expect(validation.isValid).toBe(true);
    expect(validation.evidenceStatus).toBe('PROVEN_VALID');
  });

  it('C: workflow_dispatch after baseline remains excluded', () => {
    const manualGhaRun = createMockSoakSample({
      executionType: 'MANUAL_GHA',
      workflowRun: {
        id: '33399999999',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T19:00:00Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [manualGhaRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T20:00:00Z'),
    });

    expect(metrics.validScheduleRunsCount).toBe(0);
    expect(metrics.manualGhaRunsCount).toBe(1);
  });

  it('D: failed schedule-triggered run cannot qualify', () => {
    const failedRun = createMockSoakSample({
      workflowRun: {
        id: '33350000001',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'failure',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-31T00:17:00Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [failedRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T01:00:00Z'),
    });

    expect(metrics.failedScheduleRunsCount).toBe(1);
    expect(metrics.validScheduleRunsCount).toBe(0);
  });

  it('E: missing artifact cannot qualify', () => {
    const sample = createMockSoakSample({ summary: null });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('SUMMARY_ARTIFACT_MISSING');
  });

  it('F: missing runId cannot qualify', () => {
    const sample = createMockSoakSample({
      summary: {
        ...createMockSoakSample().summary,
        runId: null,
      },
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('SUMMARY_RUN_ID_MISSING');
  });

  it('G: missing DB corroboration cannot qualify', () => {
    const sampleNoDb = createMockSoakSample({ dbCrawlRun: null });
    expect(validateSoakExecution(sampleNoDb).isValid).toBe(false);

    const sampleNoSources = createMockSoakSample({ dbSources: null });
    expect(validateSoakExecution(sampleNoSources).isValid).toBe(false);

    const sampleNoErrors = createMockSoakSample({ dbErrors: null });
    expect(validateSoakExecution(sampleNoErrors).isValid).toBe(false);
  });

  it('H: runtime-sensitive SHA change cannot qualify', () => {
    const sample = createMockSoakSample({
      runtimeBehaviorChangedForRun: true,
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('RUNTIME_BEHAVIOR_CHANGED_FOR_RUN');
  });

  it('I: reporting-only SHA remains compatible', () => {
    const sample = createMockSoakSample({
      workflowRun: {
        id: 'gha-123',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T18:17:00Z',
      },
      runtimeBehaviorChangedForRun: false,
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(true);
  });

  it('J: 48h cannot PASS with fewer than 7 valid post-baseline schedule events', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    // Only 6 schedule runs instead of required 7
    const scheduleRuns = Array.from({ length: 6 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T18:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-01T13:00:00Z'), // 48.8h later
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.validScheduleRunsCount).toBe(6);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('K: 48h can PASS only with elapsed >=48h AND >=7 valid post-baseline schedule events', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const scheduleRuns = Array.from({ length: 7 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T18:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-01T13:00:00Z'), // 48.8h later
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.validScheduleRunsCount).toBe(7);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('L: 72h cannot PASS with fewer than 11 valid post-baseline schedule events', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const scheduleRuns = Array.from({ length: 10 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T18:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'), // 72.8h later
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(72);
    expect(metrics.validScheduleRunsCount).toBe(10);
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('M: 72h can PASS only with elapsed >=72h AND >=11 valid post-baseline schedule events', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const scheduleRuns = Array.from({ length: 11 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T18:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'), // 72.8h later
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(72);
    expect(metrics.validScheduleRunsCount).toBe(11);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PASS');
  });

  it('N: a dropped GitHub schedule event produces a count deficit/PENDING state, not a fabricated execution', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    // 4 nominal slots have passed, but only 3 runs actually executed
    const scheduleRuns = Array.from({ length: 3 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T18:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T13:00:00Z'), // 4 nominal slots passed
    });

    expect(metrics.expectedScheduleSlots).toBe(4);
    expect(metrics.validScheduleRunsCount).toBe(3);
    expect(metrics.scheduleRunCountDeficit).toBe(1);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('O: schedule-delay metrics remain truthful and observable', () => {
    const baseline = createMockSoakSample({
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const run1 = createMockSoakSample({
      workflowRun: {
        id: '33323325684',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const run2 = createMockSoakSample({
      workflowRun: {
        id: '33335730116',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T21:11:31Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, run1, run2],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T05:00:00Z'),
    });

    expect(metrics.maxScheduleStartDelayMinutes).toBeGreaterThan(0);
    expect(metrics.maxGapBetweenValidScheduleRunsHours).toBeGreaterThan(0);
    expect(metrics.latestValidScheduleRun).toContain('33335730116');
  });

  it('P: no scheduled evidence available => fail closed', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'),
      githubEvidenceStatus: 'UNAVAILABLE',
    });

    expect(metrics.githubEvidenceStatus).toBe('UNAVAILABLE');
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('Q: tests helper functions loadBaselineConfig, calculateElapsedSoakHours, and generateScheduledSlots', () => {
    const cfg = loadBaselineConfig();
    expect(cfg.runtimeFreezeHead).toBeDefined();
    expect(cfg.finalSoakBaselineGhaRun).toBeDefined();

    expect(calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z')).toBe(6);

    const { passedSlots, nextSlot } = generateScheduledSlots(
      mockBaselineConfig,
      new Date('2026-08-31T00:30:00Z'),
    );
    expect(passedSlots.length).toBe(2);
    expect(passedSlots[0]?.toISOString()).toBe('2026-08-30T18:17:00.000Z');
    expect(passedSlots[1]?.toISOString()).toBe('2026-08-31T00:17:00.000Z');
    expect(nextSlot?.toISOString()).toBe('2026-08-31T06:17:00.000Z');
  });
});
