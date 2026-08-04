import { describe, it, expect } from 'vitest';
import { computeClaimabilityScore } from '../../src/validation/scorer.js';
import type { ValidationRunResult } from '../../src/validation/runner.js';
import type { ValidatorResult } from '../../src/validation/validators.js';

function createValidationResult(overrides: Partial<ValidationRunResult> = {}): ValidationRunResult {
  const defaultResults: ValidatorResult[] = [
    { name: 'evidence_backing', passed: true, severity: 'block', reason: 'OK', details: {} },
    {
      name: 'individual_judgment_guard',
      passed: true,
      severity: 'block',
      reason: 'OK',
      details: {},
    },
    { name: 'domain_allowlist', passed: true, severity: 'warn', reason: 'OK', details: {} },
    { name: 'source_trust_level', passed: true, severity: 'warn', reason: 'OK', details: {} },
    { name: 'group_vs_individual', passed: true, severity: 'block', reason: 'OK', details: {} },
    { name: 'final_vs_proposed', passed: true, severity: 'warn', reason: 'OK', details: {} },
    { name: 'appeal_or_stay', passed: true, severity: 'warn', reason: 'OK', details: {} },
    { name: 'deadline', passed: true, severity: 'block', reason: 'OK', details: {} },
    { name: 'amount_support', passed: true, severity: 'block', reason: 'OK', details: {} },
    { name: 'claim_url_support', passed: true, severity: 'warn', reason: 'OK', details: {} },
    { name: 'source_freshness', passed: true, severity: 'info', reason: 'OK', details: {} },
  ];

  return {
    results: defaultResults,
    allPassed: true,
    blockingFailures: [],
    warnings: [],
    overallDecision: 'pass',
    ...overrides,
  };
}

describe('Validation Scorer', () => {
  it('should give high score for official source with all validators passing', () => {
    const score = computeClaimabilityScore({
      validationResults: createValidationResult(),
      aiConfidence: 0.9,
      sourceTrustLevel: 'official',
      evidenceCount: 5,
      evidenceVerified: true,
    });

    // Confidence: 0.9 * 40 = 36, validation: 30, trust: 20, evidence: 10 = 96
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give low score for community source with some failures', () => {
    const failedResults: ValidatorResult[] = [
      {
        name: 'evidence_backing',
        passed: false,
        severity: 'block',
        reason: 'Missing evidence',
        details: {},
      },
      {
        name: 'individual_judgment_guard',
        passed: true,
        severity: 'block',
        reason: 'OK',
        details: {},
      },
      {
        name: 'domain_allowlist',
        passed: false,
        severity: 'warn',
        reason: 'Not official',
        details: {},
      },
      {
        name: 'source_trust_level',
        passed: false,
        severity: 'warn',
        reason: 'Low trust',
        details: {},
      },
      { name: 'group_vs_individual', passed: true, severity: 'block', reason: 'OK', details: {} },
      { name: 'final_vs_proposed', passed: true, severity: 'warn', reason: 'OK', details: {} },
      { name: 'appeal_or_stay', passed: true, severity: 'warn', reason: 'OK', details: {} },
      { name: 'deadline', passed: true, severity: 'block', reason: 'OK', details: {} },
      {
        name: 'amount_support',
        passed: false,
        severity: 'block',
        reason: 'No amount evidence',
        details: {},
      },
      { name: 'claim_url_support', passed: true, severity: 'warn', reason: 'OK', details: {} },
      { name: 'source_freshness', passed: true, severity: 'info', reason: 'OK', details: {} },
    ];

    const score = computeClaimabilityScore({
      validationResults: createValidationResult({
        results: failedResults,
        allPassed: false,
        blockingFailures: failedResults.filter((r) => !r.passed && r.severity === 'block'),
        warnings: failedResults.filter((r) => !r.passed && r.severity === 'warn'),
      }),
      aiConfidence: 0.4,
      sourceTrustLevel: 'community',
      evidenceCount: 2,
      evidenceVerified: true,
    });

    // Confidence: 0.4 * 40 = 16, validation: (7/11) * 30 ≈ 19, trust: 5, evidence: 4 = ~44
    expect(score).toBeLessThan(60);
  });

  it('should never exceed 100', () => {
    const score = computeClaimabilityScore({
      validationResults: createValidationResult(),
      aiConfidence: 1.5, // Over max confidence
      sourceTrustLevel: 'official',
      evidenceCount: 100, // Lots of evidence
      evidenceVerified: true,
    });

    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give zero evidence points when evidence not verified', () => {
    const scoreVerified = computeClaimabilityScore({
      validationResults: createValidationResult(),
      aiConfidence: 0.8,
      sourceTrustLevel: 'official',
      evidenceCount: 5,
      evidenceVerified: true,
    });

    const scoreUnverified = computeClaimabilityScore({
      validationResults: createValidationResult(),
      aiConfidence: 0.8,
      sourceTrustLevel: 'official',
      evidenceCount: 5,
      evidenceVerified: false,
    });

    expect(scoreVerified).toBeGreaterThan(scoreUnverified);
  });
});
