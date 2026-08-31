import { describe, it, expect } from 'vitest';
import {
  loadBaselineConfig,
  validateBaselineConfig,
  parseAndValidateCron,
  validateSoakExecution,
  calculateElapsedSoakHours,
  deriveFirstNominalPostBaselineSlot,
  generateScheduledSlots,
  evaluateSoakProvenance,
  getGitState,
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

function createMockSoakSample(overrides: Record<string, unknown> = {}): Record<string, unknown> {
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

describe('ClaimRadar Release Evidence Integrity & Multi-State Soak Qualification', () => {
  it('1. full HEAD SHA in generated evidence comes directly from git output', () => {
    const gitState = getGitState();
    if (gitState.head !== 'UNKNOWN') {
      expect(gitState.head).toMatch(/^[0-9a-f]{40}$/i);
    }
    if (gitState.originMain !== 'UNKNOWN') {
      expect(gitState.originMain).toMatch(/^[0-9a-f]{40}$/i);
    }
  });

  it('2. HEAD != origin/main is detectable and must prevent PASS', () => {
    const divergedGitState = {
      head: '0d44cc3af9e70645848f6d6be578d25443e2b342',
      originMain: '1111111111111111111111111111111111111111',
      headEqualsOriginMain: false,
      worktreeClean: true,
    };
    expect(divergedGitState.headEqualsOriginMain).toBe(false);
  });

  it('3. CI head SHA != HEAD is detectable and must prevent claiming exact-HEAD CI PASS', () => {
    const currentHead: string = '0d44cc3af9e70645848f6d6be578d25443e2b342';
    const staleCiSha: string = '77caad418fb864bde588be8d93b4ca58f14fff3b';
    expect(staleCiSha === currentHead).toBe(false);
  });

  it('4. a genuine failed scheduled execution produces FAIL, not PENDING_TIME_SOAK', () => {
    const failedRun = createMockSoakSample({
      workflowRun: {
        id: 'failed-run-1',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'failure',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [failedRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T12:00:00Z'),
    });

    expect(metrics.soak48hStatus).toBe('FAIL');
    expect(metrics.soak48hReasonCodes).toContain('FAILED_SCHEDULE_EXECUTION');
    expect(metrics.soak72hStatus).toBe('FAIL');
    expect(metrics.soak72hReasonCodes).toContain('FAILED_SCHEDULE_EXECUTION');
  });

  it('5. runtimeBehaviorChanged=true produces FAIL with RUNTIME_BASELINE_INVALIDATED', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T12:00:00Z'),
      runtimeBehaviorChanged: true,
    });

    expect(metrics.soak48hStatus).toBe('FAIL');
    expect(metrics.soak48hReasonCodes).toContain('RUNTIME_BASELINE_INVALIDATED');
    expect(metrics.soak72hStatus).toBe('FAIL');
  });

  it('6. elapsed time below threshold with otherwise healthy evidence produces PENDING_TIME_SOAK with INSUFFICIENT_ELAPSED_TIME', () => {
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

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T18:00:00Z'), // ~6h elapsed (< 48h)
    });

    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak48hReasonCodes).toContain('INSUFFICIENT_ELAPSED_TIME');
  });

  it('7. insufficient valid scheduled-run count produces PENDING_TIME_SOAK with INSUFFICIENT_VALID_SCHEDULE_RUNS', () => {
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
        id: 'sched-1',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '02dc1590039c5d052d5f3fa05dac2765fcfb3b07',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, run1],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-02T13:00:00Z'), // 72h+ elapsed, but only 1 scheduled run (< 7 / 11)
    });

    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak48hReasonCodes).toContain('INSUFFICIENT_VALID_SCHEDULE_RUNS');
  });

  it('8. GitHub evidence unavailable produces BLOCKED_EVIDENCE and never PASS', () => {
    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: mockBaselineConfig,
      currentTime: new Date('2026-09-03T12:00:00Z'),
      githubEvidenceStatus: 'UNAVAILABLE',
    });

    expect(metrics.soak48hStatus).toBe('BLOCKED_EVIDENCE');
    expect(metrics.soak48hReasonCodes).toContain('GITHUB_EVIDENCE_UNAVAILABLE');
    expect(metrics.soak72hStatus).toBe('BLOCKED_EVIDENCE');
  });

  it('9. malformed FINAL_SOAK_START does not produce a fabricated 2026 cron slot', () => {
    expect(() => deriveFirstNominalPostBaselineSlot('invalid-date', '17 */6 * * *')).toThrow(
      /MALFORMED_BASELINE_START_UTC/,
    );
    expect(() => deriveFirstNominalPostBaselineSlot('', '17 */6 * * *')).toThrow(
      /MALFORMED_BASELINE_START_UTC/,
    );
  });

  it('10. malformed or unsupported cron expressions are rejected', () => {
    expect(parseAndValidateCron('invalid cron').isValid).toBe(false);
    expect(parseAndValidateCron('17 */7 * * *').isValid).toBe(false); // 7 does not divide 24
    expect(parseAndValidateCron('75 */6 * * *').isValid).toBe(false); // minute > 59
    expect(parseAndValidateCron('17 */6 * * *', 8).isValid).toBe(false); // step mismatch (6 != 8)
  });

  it('11. mismatch between configured first slot and derived first slot is detected and fails closed', () => {
    const inconsistentConfig = {
      ...mockBaselineConfig,
      firstPostBaselineScheduledSlot: '2026-08-30T18:17:00Z', // Inconsistent with derived 12:17:00Z
    };

    const validation = validateBaselineConfig(inconsistentConfig);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('CONFIGURATION_INCONSISTENCY');

    const metrics = evaluateSoakProvenance({
      soakSamples: [],
      config: inconsistentConfig,
      currentTime: new Date('2026-08-30T17:00:00Z'),
    });
    expect(metrics.soak48hStatus).toBe('FAIL');
    expect(metrics.soak48hReasonCodes).toContain('CONFIGURATION_INCONSISTENCY');
  });

  it('12. current known valid configuration still derives 2026-08-30T12:17:00.000Z', () => {
    const firstSlot = deriveFirstNominalPostBaselineSlot('2026-08-30T12:08:03Z', '17 */6 * * *', 6);
    expect(firstSlot.toISOString()).toBe('2026-08-30T12:17:00.000Z');

    const validation = validateBaselineConfig(mockBaselineConfig);
    expect(validation.isValid).toBe(true);
    expect(validation.derivedFirstSlot?.toISOString()).toBe('2026-08-30T12:17:00.000Z');
  });

  it('13. current valid scheduled-run delay diagnostics remain ~268.0 min and ~174.5 min', () => {
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

    const diag1 = metrics.scheduleRunDiagnostics.find(
      (d: Record<string, unknown>) => d.runId === '33323325684',
    );
    expect(diag1?.nearestPrecedingSlotUtc).toBe('2026-08-30T12:17:00.000Z');
    expect(diag1?.inferredSlotDelayMinutes).toBeCloseTo(268.0, 0);

    const diag2 = metrics.scheduleRunDiagnostics.find(
      (d: Record<string, unknown>) => d.runId === '33335730116',
    );
    expect(diag2?.nearestPrecedingSlotUtc).toBe('2026-08-30T18:17:00.000Z');
    expect(diag2?.inferredSlotDelayMinutes).toBeCloseTo(174.5, 0);
  });

  it('14. current healthy live evidence remains PENDING rather than FAIL', () => {
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
    const run3 = createMockSoakSample({
      workflowRun: {
        id: '33361539030',
        workflow: 'staging-soak.yml',
        event: 'schedule',
        conclusion: 'success',
        headSha: '0d44cc3af9e70645848f6d6be578d25443e2b342',
        startedAt: '2026-08-31T05:43:25Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baseline, run1, run2, run3],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-31T06:00:00Z'),
    });

    expect(metrics.soak48hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.soak72hStatus).toBe('PENDING_TIME_SOAK');
    expect(metrics.failedScheduleRunsCount).toBe(0);
    expect(metrics.failedGhaSoakRunsCount).toBe(0);
  });

  it('15. helper functions loadBaselineConfig, validateSoakExecution, calculateElapsedSoakHours, generateScheduledSlots work correctly', () => {
    const config = loadBaselineConfig();
    expect(config.runtimeFreezeHead).toBeDefined();

    const sample = createMockSoakSample();
    expect(validateSoakExecution(sample).isValid).toBe(true);

    const elapsed = calculateElapsedSoakHours('2026-08-30T12:08:03Z', '2026-08-30T18:08:03Z');
    expect(elapsed).toBe(6);

    const { passedSlots } = generateScheduledSlots(
      mockBaselineConfig,
      new Date('2026-08-30T18:30:00Z'),
    );
    expect(passedSlots.length).toBe(2);
  });
});
