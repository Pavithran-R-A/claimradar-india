import { describe, it, expect } from 'vitest';
import {
  loadBaselineConfig,
  validateSoakExecution,
  calculateElapsedSoakHours,
  deriveFirstNominalPostBaselineSlot,
  generateScheduledSlots,
  evaluateSoakProvenance,
} from '../../../scripts/summarize-soak-readiness.mjs';

const mockBaselineConfig = {
  runtimeFreezeHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineGhaRun: '33310672900',
  finalSoakBaselineHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineCrawlRunId: '192c24d3-bcbb-4c21-bb38-b737be5261c0',
  finalSoakStartUtc: '2026-08-30T12:08:03Z',
  firstPostBaselineScheduledSlot: '2026-08-30T12:17:00Z',
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
      startedAt: '2026-08-30T16:45:02Z',
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
      started_at: '2026-08-30T16:46:00Z',
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

describe('Dynamic Soak Evidence Collection & Deterministic Nominal Cron Derivation', () => {
  it('A: cron derivation resolves baseline 2026-08-30T12:08:03Z + 17 */6 * * * to 2026-08-30T12:17:00Z', () => {
    const firstSlot = deriveFirstNominalPostBaselineSlot('2026-08-30T12:08:03Z', '17 */6 * * *');
    expect(firstSlot.toISOString()).toBe('2026-08-30T12:17:00.000Z');
  });

  it('B: at 2026-08-31T04:48Z, expected nominal slots are exactly 12:17, 18:17, and 00:17', () => {
    const { passedSlots, nextSlot } = generateScheduledSlots(
      mockBaselineConfig,
      new Date('2026-08-31T04:48:00Z'),
    );
    expect(passedSlots.length).toBe(3);
    expect(passedSlots[0].toISOString()).toBe('2026-08-30T12:17:00.000Z');
    expect(passedSlots[1].toISOString()).toBe('2026-08-30T18:17:00.000Z');
    expect(passedSlots[2].toISOString()).toBe('2026-08-31T00:17:00.000Z');
    expect(nextSlot.toISOString()).toBe('2026-08-31T06:17:00.000Z');
  });

  it('C & D: run at 16:45:02Z must never receive fabricated 0.0-min delay; nearest preceding slot is 12:17 with ~268.0 min delay', () => {
    const run = createMockSoakSample({
      workflowRun: {
        id: '33323325684',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [run],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T17:00:00Z'),
    });

    expect(metrics.scheduleRunDiagnostics.length).toBe(1);
    const diag = metrics.scheduleRunDiagnostics[0];
    expect(diag.nearestPrecedingSlotUtc).toBe('2026-08-30T12:17:00.000Z');
    expect(diag.inferredSlotDelayMinutes).toBeCloseTo(268.0, 0);
    expect(metrics.maxScheduleStartDelayMinutes).toBeCloseTo(268.0, 0);
  });

  it('E: run at 21:11:31Z has nearest preceding slot 18:17 with ~174.5 min delay', () => {
    const run = createMockSoakSample({
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
      soakSamples: [run],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T22:00:00Z'),
    });

    expect(metrics.scheduleRunDiagnostics.length).toBe(1);
    const diag = metrics.scheduleRunDiagnostics[0];
    expect(diag.nearestPrecedingSlotUtc).toBe('2026-08-30T18:17:00.000Z');
    expect(diag.inferredSlotDelayMinutes).toBeCloseTo(174.5, 0);
  });

  it('F: maximum nearest-preceding delay across both runs is ~268.0 minutes', () => {
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
      soakSamples: [run1, run2],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T05:00:00Z'),
    });

    expect(metrics.maxScheduleStartDelayMinutes).toBeCloseTo(268.0, 0);
  });

  it('G: at evaluation time 2026-08-31T04:48Z, expected slots = 3, valid runs = 2, count deficit = 1, status remains PENDING_TIME_SOAK', () => {
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
      currentTime: new Date('2026-08-31T04:48:00Z'),
    });

    expect(metrics.expectedScheduleSlots).toBe(3);
    expect(metrics.observedScheduleRunsCount).toBe(2);
    expect(metrics.validScheduleRunsCount).toBe(2);
    expect(metrics.scheduleRunCountDeficit).toBe(1);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('H: a schedule deficit does not classify as crawler/runtime failure', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T19:00:00Z'), // 2 expected slots, 0 observed
    });

    expect(metrics.scheduleRunCountDeficit).toBe(2);
    expect(metrics.failedScheduleRunsCount).toBe(0);
    expect(metrics.failedGhaSoakRunsCount).toBe(0);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('I: primary 48h/72h count+elapsed qualification behavior remains strictly intact', () => {
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

    const scheduleRuns7 = Array.from({ length: 7 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T12:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics48 = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns7],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-01T13:00:00Z'), // 48.8h later
    });

    expect(metrics48.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics48.validScheduleRunsCount).toBe(7);
    expect(metrics48.soak48hStatus).toBe('PASS');
    expect(metrics48.soak72hStatus).toBe('PENDING_TIME_SOAK');

    const scheduleRuns11 = Array.from({ length: 11 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'sched-' + i,
          workflow: 'staging-soak.yml',
          event: 'schedule',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date('2026-08-30T12:17:00Z').getTime() + i * 6 * 3600 * 1000,
          ).toISOString(),
        },
      }),
    );

    const metrics72 = evaluateSoakProvenance({
      soakSamples: [baseline, ...scheduleRuns11],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'), // 72.8h later
    });

    expect(metrics72.elapsedSoakHours).toBeGreaterThanOrEqual(72);
    expect(metrics72.validScheduleRunsCount).toBe(11);
    expect(metrics72.soak48hStatus).toBe('PASS');
    expect(metrics72.soak72hStatus).toBe('PASS');
  });

  it('J: existing delayed-run acceptance, artifact validation, DB corroboration, manual-run exclusion, and fail-closed tests remain green', () => {
    // Missing artifact fails
    expect(validateSoakExecution(createMockSoakSample({ summary: null })).isValid).toBe(false);

    // Missing DB crawl run fails
    expect(validateSoakExecution(createMockSoakSample({ dbCrawlRun: null })).isValid).toBe(false);

    // Runtime sensitive change fails
    expect(
      validateSoakExecution(createMockSoakSample({ runtimeBehaviorChangedForRun: true })).isValid,
    ).toBe(false);

    // Manual dispatch excluded from valid schedule count
    const manualRun = createMockSoakSample({
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
    const evalManual = evaluateSoakProvenance({
      soakSamples: [manualRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T20:00:00Z'),
    });
    expect(evalManual.validScheduleRunsCount).toBe(0);
    expect(evalManual.manualGhaRunsCount).toBe(1);

    // Fail closed on UNAVAILABLE GHA evidence
    const evalUnavailable = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'),
      githubEvidenceStatus: 'UNAVAILABLE',
    });
    expect(evalUnavailable.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('K: regression test proving that a schedule run earlier than a stale/manually supplied first-slot timestamp cannot silently become zero delay', () => {
    const staleConfig = {
      ...mockBaselineConfig,
      firstPostBaselineScheduledSlot: '2026-08-30T18:17:00Z', // stale manual anchor
    };

    const run = createMockSoakSample({
      workflowRun: {
        id: '33323325684',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '81605eaf39f10cfc0d2ca5cfc08010aac987c53b',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [run],
      config: staleConfig,
      currentTime: new Date('2026-08-30T17:00:00Z'),
    });

    const diag = metrics.scheduleRunDiagnostics[0];
    expect(diag.nearestPrecedingSlotUtc).toBe('2026-08-30T12:17:00.000Z');
    expect(diag.inferredSlotDelayMinutes).not.toBe(0);
    expect(diag.inferredSlotDelayMinutes).toBeCloseTo(268.0, 0);
  });

  it('L: tests helper functions loadBaselineConfig and calculateElapsedSoakHours', () => {
    const config = loadBaselineConfig();
    expect(config.runtimeFreezeHead).toBeDefined();
    expect(config.finalSoakBaselineGhaRun).toBeDefined();

    expect(calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z')).toBe(6);
  });
});
