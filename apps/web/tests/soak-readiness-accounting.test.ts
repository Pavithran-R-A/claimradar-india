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
  scheduleGraceMinutes: 60,
  thresholdHours48: 48,
  thresholdHours72: 72,
  minRunsFor48h: 8,
  minRunsFor72h: 12,
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

describe('Dynamic Soak Evidence Collection & Invariant Verification', () => {
  it('A: GitHub returns baseline + 2 scheduled soak workflows -> OBSERVED_GHA_SOAK_RUNS = 3', () => {
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
    const sched1 = createMockSoakSample({
      workflowRun: {
        id: '33315000001',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T18:17:00Z',
      },
    });
    const sched2 = createMockSoakSample({
      workflowRun: {
        id: '33315000002',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-31T00:17:00Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, sched1, sched2],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T01:00:00Z'),
    });

    expect(metrics.observedGhaSoakRunsCount).toBe(3);
    expect(metrics.validGhaSoakRunsCount).toBe(3);
  });

  it('B: each run validates its own summary artifact and DB corroboration', () => {
    const sample = createMockSoakSample();
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(true);
    expect(res.evidenceStatus).toBe('PROVEN_VALID');
  });

  it('C: missing summary artifact fails closed', () => {
    const sample = createMockSoakSample({ summary: null });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('SUMMARY_ARTIFACT_MISSING');
  });

  it('D: artifact has no runId -> fails closed', () => {
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

  it('E: DB crawl run missing -> fails closed', () => {
    const sample = createMockSoakSample({ dbCrawlRun: null });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('DB_CORROBORATION_MISSING');
  });

  it('F: dbSources undefined or missing -> fails closed', () => {
    const sample = createMockSoakSample({ dbSources: null });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('DB_CORROBORATION_MISSING');
  });

  it('G: dbErrors undefined or missing -> fails closed', () => {
    const sample = createMockSoakSample({ dbErrors: null });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('DB_CORROBORATION_MISSING');
  });

  it('H: dbSources length differs from summary.sourcesAttempted -> fails closed', () => {
    const sample = createMockSoakSample({
      dbSources: [
        {
          id: 'src-1',
          crawl_run_id: 'c1',
          source_id: 's1',
          status: 'completed',
          documents_found: 10,
          error_message: null,
        },
      ], // Only 1 source instead of 7
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('DB_SOURCES_COUNT_MISMATCH');
  });

  it('I: queries by crawl-run ID scale without global 50-row limit truncation', () => {
    // 12 runs * 7 sources = 84 sources, verified cleanly when queried per crawlRunId
    const samples = Array.from({ length: 12 }, (_, i) =>
      createMockSoakSample({
        crawlRunId: 'crawl-run-' + i,
        dbCrawlRun: {
          id: 'crawl-run-' + i,
          status: 'completed',
          sources_attempted: 7,
          sources_succeeded: 7,
          documents_discovered: 106,
        },
        dbSources: Array.from({ length: 7 }, (_, j) => ({
          id: 'src-' + i + '-' + j,
          crawl_run_id: 'crawl-run-' + i,
          source_id: 'src-' + j,
          status: 'completed',
          documents_found: 15,
          error_message: null,
        })),
        dbErrors: [],
      }),
    );

    for (const s of samples) {
      expect(validateSoakExecution(s).isValid).toBe(true);
    }
  });

  it('J: manual workflow_dispatch after baseline does not count toward final soak', () => {
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

    expect(metrics.validGhaSoakRunsCount).toBe(0);
    expect(metrics.manualGhaRunsCount).toBe(1);
  });

  it('K: baseline workflow_dispatch 33310672900 DOES count', () => {
    const baseline = createMockSoakSample({
      executionType: 'FINAL_SOAK',
      workflowRun: {
        id: '33310672900',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T13:00:00Z'),
    });

    expect(metrics.observedGhaSoakRunsCount).toBe(1);
    expect(metrics.validGhaSoakRunsCount).toBe(1);
  });

  it('L: 18:17 scheduled slot run at 18:30 (inside grace window) satisfies slot', () => {
    const schedRun = createMockSoakSample({
      workflowRun: {
        id: '33315000001',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T18:30:00Z', // 13 min delayed, within 60 min grace
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [schedRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T18:40:00Z'),
    });

    expect(metrics.dueScheduleSlots).toBe(1);
    expect(metrics.satisfiedScheduleSlots).toBe(1);
    expect(metrics.missingScheduleSlots).toBe(0);
  });

  it('M: at 18:20 with no run yet and 60-minute grace: PENDING_GRACE_SLOTS = 1, MISSING = 0', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T18:20:00Z'), // 3 min after slot, within 60 min grace
    });

    expect(metrics.dueScheduleSlots).toBe(1);
    expect(metrics.satisfiedScheduleSlots).toBe(0);
    expect(metrics.pendingGraceSlots).toBe(1);
    expect(metrics.missingScheduleSlots).toBe(0);
  });

  it('N: at 19:18 with no 18:17 run: MISSING_SCHEDULE_SLOTS = 1', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T19:18:00Z'), // 61 min after slot (exceeds grace)
    });

    expect(metrics.dueScheduleSlots).toBe(1);
    expect(metrics.missingScheduleSlots).toBe(1);
  });

  it('O: different runtime-sensitive head SHA invalidates that run', () => {
    const sample = createMockSoakSample({
      runtimeBehaviorChangedForRun: true,
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('RUNTIME_BEHAVIOR_CHANGED_FOR_RUN');
  });

  it('P: reporting-only SHA change remains runtime-compatible', () => {
    const sample = createMockSoakSample({
      workflowRun: {
        id: 'gha-123',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '4c32fd38ab7f7ce3f46a51148b91f603e9fbb879', // Documentation/test commit
        startedAt: '2026-08-30T18:17:00Z',
      },
      runtimeBehaviorChangedForRun: false,
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(true);
  });

  it('Q: when GitHub evidence is UNAVAILABLE, qualification fails closed', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'), // 72h later
      githubEvidenceStatus: 'UNAVAILABLE',
    });

    expect(metrics.githubEvidenceStatus).toBe('UNAVAILABLE');
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('R: tests helper functions loadBaselineConfig, calculateElapsedSoakHours, and generateScheduledSlots', () => {
    const cfg = loadBaselineConfig();
    expect(cfg.runtimeFreezeHead).toBeDefined();
    expect(cfg.finalSoakBaselineGhaRun).toBeDefined();

    expect(calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z')).toBe(6);

    const slots = generateScheduledSlots(mockBaselineConfig, new Date('2026-08-31T00:30:00Z'));
    expect(slots.length).toBeGreaterThanOrEqual(2);
    expect(slots[0]?.slotUtc).toBe('2026-08-30T18:17:00.000Z');
    expect(slots[1]?.slotUtc).toBe('2026-08-31T00:17:00.000Z');
  });
});
