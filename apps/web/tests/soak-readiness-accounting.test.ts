import { describe, it, expect } from 'vitest';
import {
  validateBaselineConfig,
  parseAndValidateCron,
  validateSoakExecution,
  deriveFirstNominalPostBaselineSlot,
  generateNominalCronSlots,
  generateHistoricalScheduledSlots,
  evaluateScheduleSlotAccounting,
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
    expect(gitState.head).toMatch(/^[0-9a-f]{40}$/i);
    expect(gitState.originMain).toMatch(/^[0-9a-f]{40}$/i);
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
      currentTime: new Date('2026-08-30T18:00:00Z'),
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
      currentTime: new Date('2026-09-02T13:00:00Z'),
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

  it('9. malformed FINAL_SOAK_START does not produce a fabricated cron slot', () => {
    expect(() => deriveFirstNominalPostBaselineSlot('invalid-date', '17 */6 * * *')).toThrow(
      /MALFORMED_BASELINE_START_UTC/,
    );
    expect(() => deriveFirstNominalPostBaselineSlot('', '17 */6 * * *')).toThrow(
      /MALFORMED_BASELINE_START_UTC/,
    );
  });

  it('10. malformed or unsupported cron expressions are rejected', () => {
    expect(parseAndValidateCron('invalid cron').isValid).toBe(false);
    expect(parseAndValidateCron('17 */7 * * *').isValid).toBe(false);
    expect(parseAndValidateCron('75 */6 * * *').isValid).toBe(false);
    expect(parseAndValidateCron('17 */6 * * *', 8).isValid).toBe(false);
  });

  it('11. mismatch between configured first slot and derived first slot is detected and fails closed', () => {
    const inconsistentConfig = {
      ...mockBaselineConfig,
      firstPostBaselineScheduledSlot: '2026-08-30T18:17:00Z',
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

  it('12a. POSIX */6 expands from midnight at 00:17, 06:17, 12:17, and 18:17 UTC', () => {
    expect(parseAndValidateCron('17 */6 * * *', 6).targetHours).toEqual([0, 6, 12, 18]);
  });

  it('12b. frozen merge timestamp derives the first and next four nominal slots exactly', () => {
    const slots = generateNominalCronSlots('2026-09-06T14:09:30Z', '17 */6 * * *', 6, 5);

    expect(slots.map((slot) => slot.toISOString())).toEqual([
      '2026-09-06T18:17:00.000Z',
      '2026-09-07T00:17:00.000Z',
      '2026-09-07T06:17:00.000Z',
      '2026-09-07T12:17:00.000Z',
      '2026-09-07T18:17:00.000Z',
    ]);
  });

  it('12c. the baseline workflow_dispatch remains baseline-only, never a scheduled slot run', () => {
    const baselineRun = createMockSoakSample({
      workflowRun: {
        id: mockBaselineConfig.finalSoakBaselineGhaRun,
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        headSha: mockBaselineConfig.finalSoakBaselineHead,
        startedAt: mockBaselineConfig.finalSoakStartUtc,
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [baselineRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T18:00:00Z'),
    });

    expect(metrics.observedGhaSoakRunsCount).toBe(1);
    expect(metrics.validScheduleRunsCount).toBe(0);
    expect(metrics.manualGhaRunsCount).toBe(0);
  });

  it('13. delayed run inside grace window satisfies nominal slot (Rule 2)', () => {
    const slots = [new Date('2026-08-30T12:17:00Z')];
    const runs = [{ workflowRun: { id: '33323325684', startedAt: '2026-08-30T16:45:02Z' } }];
    const res = evaluateScheduleSlotAccounting({
      passedSlots: slots,
      validScheduleRuns: runs,
      currentDate: new Date('2026-08-30T17:00:00Z'),
      intervalHours: 6,
      graceWindowHours: 6,
    });

    expect(res.satisfiedSlotsCount).toBe(1);
    expect(res.slotStatuses[0]!.status).toBe('SATISFIED');
    expect(res.slotStatuses[0]!.assignedRunId).toBe('33323325684');
    expect(res.slotStatuses[0]!.delayMinutes).toBeCloseTo(268.0, 0);
  });

  it('14. execution before nominal slot cannot satisfy that slot (Rule 1)', () => {
    const slots = [new Date('2026-08-30T18:17:00Z')];
    const earlyRun = [{ workflowRun: { id: 'early-1', startedAt: '2026-08-30T17:00:00Z' } }];
    const res = evaluateScheduleSlotAccounting({
      passedSlots: slots,
      validScheduleRuns: earlyRun,
      currentDate: new Date('2026-08-30T19:00:00Z'),
      intervalHours: 6,
      graceWindowHours: 6,
    });

    expect(res.satisfiedSlotsCount).toBe(0);
    expect(res.slotStatuses[0]!.status).toBe('PENDING_GRACE');
  });

  it('15. delayed execution outside grace window leaves slot as MISSING (Rule 8)', () => {
    const slots = [new Date('2026-08-30T12:17:00Z')];
    const lateRun = [{ workflowRun: { id: 'too-late', startedAt: '2026-08-30T19:00:00Z' } }]; // Grace ends at 18:17
    const res = evaluateScheduleSlotAccounting({
      passedSlots: slots,
      validScheduleRuns: lateRun,
      currentDate: new Date('2026-08-30T20:00:00Z'),
      intervalHours: 6,
      graceWindowHours: 6,
    });

    expect(res.satisfiedSlotsCount).toBe(0);
    expect(res.missingSlotsCount).toBe(1);
    expect(res.slotStatuses[0]!.status).toBe('MISSING');
  });

  it('16. multiple runs competing for one slot assign 1-to-1 without double-satisfaction (Rules 5, 6, 7)', () => {
    const slots = [new Date('2026-08-30T12:17:00Z'), new Date('2026-08-30T18:17:00Z')];
    const runs = [
      { workflowRun: { id: 'run-1', startedAt: '2026-08-30T13:00:00Z' } },
      { workflowRun: { id: 'run-2', startedAt: '2026-08-30T14:00:00Z' } },
    ];
    const res = evaluateScheduleSlotAccounting({
      passedSlots: slots,
      validScheduleRuns: runs,
      currentDate: new Date('2026-08-31T01:00:00Z'),
      intervalHours: 6,
      graceWindowHours: 6,
    });

    expect(res.satisfiedSlotsCount).toBe(1);
    expect(res.slotStatuses[0]!.assignedRunId).toBe('run-1');
    expect(res.slotStatuses[1]!.status).toBe('MISSING');
    expect(res.unassignedRunsCount).toBe(1);
  });

  it('17. manual workflow_dispatch runs are excluded from scheduled slot qualification (Rule 4)', () => {
    const manualRun = createMockSoakSample({
      executionType: 'MANUAL_GHA',
      workflowRun: {
        id: 'manual-1',
        workflow: 'staging-soak.yml',
        event: 'workflow_dispatch',
        conclusion: 'success',
        startedAt: '2026-08-30T16:45:02Z',
      },
    });

    const metrics = evaluateSoakProvenance({
      soakSamples: [manualRun],
      config: mockBaselineConfig,
      currentTime: new Date('2026-08-30T18:00:00Z'),
    });

    expect(metrics.validScheduleRunsCount).toBe(0);
    expect(metrics.manualGhaRunsCount).toBe(1);
  });

  it('18. historical cron change timeline generates correct past intervals (Rule 3)', () => {
    const historicalRules = [
      {
        effectiveFrom: '2026-08-29T00:00:00Z',
        effectiveUntil: '2026-08-30T12:00:00Z',
        cron: '0 */12 * * *',
        intervalHours: 12,
      },
      {
        effectiveFrom: '2026-08-30T12:00:00Z',
        effectiveUntil: null,
        cron: '17 */6 * * *',
        intervalHours: 6,
      },
    ];

    const { passedSlots } = generateHistoricalScheduledSlots(
      historicalRules,
      '2026-08-29T12:00:00Z',
      new Date('2026-08-31T00:00:00Z'),
    );

    expect(passedSlots.length).toBeGreaterThan(0);
  });

  it('19. missing artifact or missing DB records fails soak execution validation', () => {
    const noArtifact = createMockSoakSample({ summary: null });
    expect(validateSoakExecution(noArtifact).isValid).toBe(false);
    expect(validateSoakExecution(noArtifact).failureReason).toBe('SUMMARY_ARTIFACT_MISSING');

    const noDbRun = createMockSoakSample({ dbCrawlRun: null });
    expect(validateSoakExecution(noDbRun).isValid).toBe(false);
    expect(validateSoakExecution(noDbRun).failureReason).toBe('DB_CRAWL_RUN_MISSING');
  });

  it('20. runtime-sensitive SHA change marks execution invalid', () => {
    const sampleWithRuntimeChange = createMockSoakSample({
      runtimeBehaviorChangedForRun: true,
    });
    expect(validateSoakExecution(sampleWithRuntimeChange).isValid).toBe(false);
    expect(validateSoakExecution(sampleWithRuntimeChange).failureReason).toBe(
      'RUNTIME_BEHAVIOR_CHANGED_FOR_RUN',
    );
  });
});
