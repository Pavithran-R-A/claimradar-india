import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runPipeline, StagingPolicyViolationError } from '../../src/pipeline/index.js';
import { InMemoryDryRunWriter } from '../../src/pipeline/db-writer.js';

describe('Phase 4: Policy Guard Violations Fail Closed', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.APP_ENV = 'staging';
    process.env.SUPABASE_URL = 'https://dryrun.local';
    process.env.SUPABASE_SECRET_KEY = 'dummy-dryrun-secret-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('runs successfully when all policy guards are false', async () => {
    process.env.AUTO_VERIFY_CLAIMABLES = 'false';
    process.env.ENABLE_BILLING = 'false';
    process.env.NOTIFY_CUSTOMERS_ENABLED = 'false';
    process.env.LIVE_ADAPTERS_ENABLED = 'false';

    const storage = new InMemoryDryRunWriter();
    const summary = await runPipeline({
      dryRun: true,
      skipAI: true,
      storage,
      sourceFilter: 'non-existent-source-filter',
    });

    expect(summary).toBeDefined();
    expect(summary.effectivePolicyGuards).toBeDefined();
    expect(summary.effectivePolicyGuards?.AUTO_VERIFY_CLAIMABLES).toBe(false);
    expect(summary.effectivePolicyGuards?.ENABLE_BILLING).toBe(false);
    expect(summary.effectivePolicyGuards?.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
    expect(summary.effectivePolicyGuards?.APP_ENV).toBe('staging');
  });

  it('refuses ingestion and throws StagingPolicyViolationError when AUTO_VERIFY_CLAIMABLES=true', async () => {
    process.env.AUTO_VERIFY_CLAIMABLES = 'true';
    process.env.ENABLE_BILLING = 'false';
    process.env.NOTIFY_CUSTOMERS_ENABLED = 'false';

    const storage = new InMemoryDryRunWriter();
    await expect(
      runPipeline({
        dryRun: true,
        skipAI: true,
        storage,
      }),
    ).rejects.toThrowError(StagingPolicyViolationError);
  });

  it('refuses ingestion and throws StagingPolicyViolationError when ENABLE_BILLING=true', async () => {
    process.env.AUTO_VERIFY_CLAIMABLES = 'false';
    process.env.ENABLE_BILLING = 'true';
    process.env.NOTIFY_CUSTOMERS_ENABLED = 'false';

    const storage = new InMemoryDryRunWriter();
    await expect(
      runPipeline({
        dryRun: true,
        skipAI: true,
        storage,
      }),
    ).rejects.toThrowError(StagingPolicyViolationError);
  });

  it('refuses ingestion and throws StagingPolicyViolationError when NOTIFY_CUSTOMERS_ENABLED=true', async () => {
    process.env.AUTO_VERIFY_CLAIMABLES = 'false';
    process.env.ENABLE_BILLING = 'false';
    process.env.NOTIFY_CUSTOMERS_ENABLED = 'true';

    const storage = new InMemoryDryRunWriter();
    await expect(
      runPipeline({
        dryRun: true,
        skipAI: true,
        storage,
      }),
    ).rejects.toThrowError(StagingPolicyViolationError);
  });
});
