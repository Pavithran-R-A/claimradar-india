import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const gate = fileURLToPath(new URL('../../../../scripts/validate-soak-summary.mjs', import.meta.url));

const validSummary = () => ({
  runId: 'soak-regression',
  sourcesAttempted: 7,
  sourcesSucceeded: 7,
  sourcesFailed: 0,
  documentsDiscovered: 126,
  documentsFetched: 125,
  errorCount: 1,
  expectedLimitationCount: 1,
  unexpectedErrorCount: 0,
  documentsSkippedOversize: 1,
  recordsPublished: 0,
  effectivePolicyGuards: {
    APP_ENV: 'staging',
    AUTO_VERIFY_CLAIMABLES: false,
    ENABLE_BILLING: false,
    NOTIFY_CUSTOMERS_ENABLED: false,
    LIVE_ADAPTERS_ENABLED: true,
  },
});

function execute(summary: Record<string, unknown>) {
  const temp = mkdtempSync(join(tmpdir(), 'claimkhoj-soak-gate-'));
  try {
    const file = join(temp, 'summary.json');
    writeFileSync(file, JSON.stringify(summary));
    return spawnSync(process.execPath, [gate, file], { encoding: 'utf8' });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

describe('Railway and GitHub soak summary acceptance', () => {
  it('accepts an audited oversized PDF exclusion without concealing the error count', () => {
    const result = execute(validSummary());
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('SOAK_ACCEPTANCE_PASSED');
    expect(result.stdout).toContain('"errorCount":1');
    expect(result.stdout).toContain('"expectedLimitationCount":1');
  });

  it('accepts a clean run with no limitations', () => {
    const result = execute({
      ...validSummary(),
      errorCount: 0,
      expectedLimitationCount: 0,
      documentsSkippedOversize: 0,
    });
    expect(result.status).toBe(0);
  });

  it('rejects unexpected failures even when expected limitations also exist', () => {
    const result = execute({
      ...validSummary(),
      errorCount: 2,
      unexpectedErrorCount: 1,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('unexpectedErrorCount must be 0');
  });

  it('rejects unclassified errors and missing classification fields', () => {
    const unexplained = execute({ ...validSummary(), errorCount: 2 });
    expect(unexplained.status).toBe(1);
    expect(unexplained.stderr).toContain('must equal classified');

    const missing = validSummary() as Record<string, unknown>;
    delete missing.expectedLimitationCount;
    const omitted = execute(missing);
    expect(omitted.status).toBe(1);
    expect(omitted.stderr).toContain('expectedLimitationCount must be a non-negative integer');
  });

  it('rejects failed source crawls and weakened staging policy guards', () => {
    const failure = execute({ ...validSummary(), sourcesSucceeded: 6, sourcesFailed: 1 });
    expect(failure.status).toBe(1);
    expect(failure.stderr).toContain('sourcesFailed must be 0');

    const unsafe = execute({
      ...validSummary(),
      effectivePolicyGuards: {
        ...validSummary().effectivePolicyGuards,
        AUTO_VERIFY_CLAIMABLES: true,
      },
    });
    expect(unsafe.status).toBe(1);
    expect(unsafe.stderr).toContain('AUTO_VERIFY_CLAIMABLES must be false');
  });
});
