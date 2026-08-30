import { describe, it, expect } from 'vitest';
import {
  validateSoakExecution,
  calculateElapsedSoakHours,
  calculateExpectedSoakRuns,
  evaluateSoakProvenance,
} from '../../../scripts/summarize-soak-readiness.mjs';

const mockBaselineConfig = {
  runtimeFreezeHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineGhaRun: '33310672900',
  finalSoakBaselineHead: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
  finalSoakBaselineCrawlRunId: '192c24d3-bcbb-4c21-bb38-b737be5261c0',
  finalSoakStartUtc: '2026-08-30T12:08:03Z',
  scheduleIntervalHours: 6,
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
      conclusion: 'success',
      headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
      startedAt: '2026-08-30T12:08:03Z',
    },
    summary: {
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
      started_at: '2026-08-30T12:09:55Z',
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
    ...overrides,
  };
}

describe('Soak Provenance & Fail-Closed Accounting', () => {
  it('A: validates an authentic GHA staging-soak execution with matching summary and DB evidence', () => {
    const sample = createMockSoakSample();
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(true);
    expect(res.evidenceStatus).toBe('PROVEN_VALID');
    expect(res.failureReason).toBeNull();
  });

  it('B: fails closed when executionType is not FINAL_SOAK (e.g. MANUAL or DAILY_CRAWL)', () => {
    const sample = createMockSoakSample({ executionType: 'MANUAL' });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.evidenceStatus).toBe('NON_SOAK_PROVENANCE');
  });

  it('C: fails closed when workflow is not staging-soak.yml', () => {
    const sample = createMockSoakSample({
      workflowRun: {
        id: 'gha-123',
        workflow: 'daily-crawl.yml',
        conclusion: 'success',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('INVALID_WORKFLOW_NAME');
  });

  it('D: fails closed when GHA conclusion is failed', () => {
    const sample = createMockSoakSample({
      workflowRun: {
        id: 'gha-123',
        workflow: 'staging-soak.yml',
        conclusion: 'failure',
        startedAt: '2026-08-30T12:08:03Z',
      },
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.evidenceStatus).toBe('FAILED');
    expect(res.failureReason).toContain('WORKFLOW_CONCLUSION_NOT_SUCCESS');
  });

  it('E: fails closed when summary artifact is missing or undefined (never defaults to zero)', () => {
    const sample = createMockSoakSample({ summary: undefined });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.failureReason).toBe('SUMMARY_ARTIFACT_MISSING');
  });

  it('F: fails closed when any policy guard property is missing or differs', () => {
    const missingLiveAdapter = createMockSoakSample({
      summary: {
        ...createMockSoakSample().summary,
        effectivePolicyGuards: {
          APP_ENV: 'staging',
          AUTO_VERIFY_CLAIMABLES: false,
          ENABLE_BILLING: false,
          NOTIFY_CUSTOMERS_ENABLED: false,
          // LIVE_ADAPTERS_ENABLED missing
        },
      },
    });
    expect(validateSoakExecution(missingLiveAdapter).isValid).toBe(false);

    const billingEnabled = createMockSoakSample({
      summary: {
        ...createMockSoakSample().summary,
        effectivePolicyGuards: {
          APP_ENV: 'staging',
          AUTO_VERIFY_CLAIMABLES: false,
          ENABLE_BILLING: true,
          NOTIFY_CUSTOMERS_ENABLED: false,
          LIVE_ADAPTERS_ENABLED: true,
        },
      },
    });
    expect(validateSoakExecution(billingEnabled).isValid).toBe(false);
  });

  it('G: fails closed when DB crawl_errors contains error records', () => {
    const sample = createMockSoakSample({
      dbErrors: [{ id: 'err-1', error_type: 'NETWORK_TIMEOUT', error_message: 'socket hang up' }],
    });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.evidenceStatus).toBe('DB_CORROBORATION_FAILED');
    expect(res.failureReason).toBe('DB_ERRORS_NON_ZERO');
  });

  it('H: fails closed when DB crawl_run_sources contains a failed source row', () => {
    const sources = Array.from({ length: 7 }, (_, i) => ({
      id: 'source-' + i,
      crawl_run_id: 'crawl-test',
      source_id: 'src-' + i,
      status: i === 3 ? 'failed' : 'completed',
      documents_found: 10,
      error_message: i === 3 ? 'HTTP 503 Service Unavailable' : null,
    }));
    const sample = createMockSoakSample({ dbSources: sources });
    const res = validateSoakExecution(sample);
    expect(res.isValid).toBe(false);
    expect(res.evidenceStatus).toBe('DB_CORROBORATION_FAILED');
    expect(res.failureReason).toBe('DB_SOURCES_CONTAIN_FAILURES');
  });

  it('I: excludes 20 manual post-baseline DB runs and gives VALID_FINAL_SOAK_RUNS = 0', () => {
    const manualDbRuns = Array.from({ length: 20 }, (_, i) => ({
      id: 'manual-run-' + i,
      status: 'completed',
      started_at: new Date('2026-08-30T13:00:00Z').toISOString(),
      sources_attempted: 7,
      sources_succeeded: 7,
      documents_discovered: 100,
      metadata: {},
    }));

    const metrics = evaluateSoakProvenance({
      soakSamples: [], // No GHA staging-soak executions
      dbCrawlRuns: manualDbRuns,
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T14:00:00Z'),
    });

    expect(metrics.validGhaSoakRunsCount).toBe(0);
    expect(metrics.manualPostBaselineRunsCount).toBe(20);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('J: manual runs cannot accelerate elapsed soak time or satisfy schedule slots', () => {
    const currentTime = new Date('2026-08-30T13:08:03Z'); // 1 hour after baseline
    const manualDbRuns = Array.from({ length: 20 }, (_, i) => ({
      id: 'manual-run-' + i,
      status: 'completed',
      started_at: new Date('2026-08-30T12:30:00Z').toISOString(),
      sources_attempted: 7,
      sources_succeeded: 7,
      documents_discovered: 100,
      metadata: {},
    }));

    const sample1 = createMockSoakSample(); // 1 real GHA soak sample

    const metrics = evaluateSoakProvenance({
      soakSamples: [sample1],
      dbCrawlRuns: manualDbRuns,
      config: mockBaselineConfig,
      currentTime,
    });

    expect(metrics.elapsedSoakHours).toBe(1);
    expect(metrics.validGhaSoakRunsCount).toBe(1);
    expect(metrics.manualPostBaselineRunsCount).toBe(20);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('K: 48h elapsed with missing schedule slots remains PENDING_TIME_SOAK', () => {
    const currentTime = new Date('2026-09-01T13:08:03Z'); // 49 hours
    const sample1 = createMockSoakSample({ startedAt: '2026-08-30T12:08:03Z' });
    const sample2 = createMockSoakSample({ startedAt: '2026-08-30T18:08:03Z' });
    // Only 2 observed runs out of 9 expected slots

    const metrics = evaluateSoakProvenance({
      soakSamples: [sample1, sample2],
      dbCrawlRuns: [],
      config: mockBaselineConfig,
      currentTime,
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.expectedScheduleSlots).toBe(9);
    expect(metrics.observedGhaSoakRunsCount).toBe(2);
    expect(metrics.missingScheduleSlots).toBe(7);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('L: 48h elapsed with all valid expected schedule slots qualifies as PASS', () => {
    const currentTime = new Date('2026-09-01T13:08:03Z'); // 49 hours
    const samples = Array.from({ length: 9 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'gha-' + i,
          workflow: 'staging-soak.yml',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 6 * 3600000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: samples,
      dbCrawlRuns: [],
      config: mockBaselineConfig,
      currentTime,
      runtimeBehaviorChanged: false,
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(48);
    expect(metrics.validGhaSoakRunsCount).toBe(9);
    expect(metrics.missingScheduleSlots).toBe(0);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('M: 72h elapsed with all valid expected schedule slots qualifies as PASS', () => {
    const currentTime = new Date('2026-09-02T13:08:03Z'); // 73 hours
    const samples = Array.from({ length: 13 }, (_, i) =>
      createMockSoakSample({
        workflowRun: {
          id: 'gha-' + i,
          workflow: 'staging-soak.yml',
          conclusion: 'success',
          headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
          startedAt: new Date(
            new Date(mockBaselineConfig.finalSoakStartUtc).getTime() + i * 6 * 3600000,
          ).toISOString(),
        },
      }),
    );

    const metrics = evaluateSoakProvenance({
      soakSamples: samples,
      dbCrawlRuns: [],
      config: mockBaselineConfig,
      currentTime,
      runtimeBehaviorChanged: false,
    });

    expect(metrics.elapsedSoakHours).toBeGreaterThanOrEqual(72);
    expect(metrics.validGhaSoakRunsCount).toBe(13);
    expect(metrics.missingScheduleSlots).toBe(0);
    expect(metrics.soak48hStatus).toBe('PASS');
    expect(metrics.soak72hStatus).toBe('PASS');
  });

  it('N: runtime sensitive change invalidates soak qualification and fails closed', () => {
    const currentTime = new Date('2026-09-02T13:08:03Z');
    const samples = Array.from({ length: 13 }, () => createMockSoakSample());

    const metrics = evaluateSoakProvenance({
      soakSamples: samples,
      dbCrawlRuns: [],
      config: mockBaselineConfig,
      currentTime,
      runtimeBehaviorChanged: true, // Runtime behavior modified
    });

    expect(metrics.runtimeBehaviorChanged).toBe(true);
    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
  });

  it('O: tests calculateElapsedSoakHours and calculateExpectedSoakRuns helpers', () => {
    expect(calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z')).toBe(6);
    expect(calculateExpectedSoakRuns(0)).toBe(1);
    expect(calculateExpectedSoakRuns(6)).toBe(2);
    expect(calculateExpectedSoakRuns(48)).toBe(9);
  });
});
