import { describe, it, expect } from 'vitest';
import { decidePublication } from '../../src/publication/policy.js';
import type { ValidationRunResult } from '../../src/validation/runner.js';
import type { ValidatorResult } from '../../src/validation/validators.js';
import { ClaimableStatus, PublicationStatus } from '@claimradar/shared-types';
import { createTestExtraction } from '../fixtures/factory.js';

function createAllPassValidation(): ValidationRunResult {
  const results: ValidatorResult[] = [
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
  return { results, allPassed: true, blockingFailures: [], warnings: [], overallDecision: 'pass' };
}

function createIndividualJudgmentValidation(): ValidationRunResult {
  const results: ValidatorResult[] = [
    {
      name: 'individual_judgment_guard',
      passed: false,
      severity: 'block',
      reason: 'Individual judgment',
      details: {},
    },
  ];
  return {
    results,
    allPassed: false,
    blockingFailures: results.filter((r) => !r.passed && r.severity === 'block'),
    warnings: [],
    overallDecision: 'reject',
  };
}

function createBlockingFailureValidation(): ValidationRunResult {
  const results: ValidatorResult[] = [
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
  ];
  return {
    results,
    allPassed: false,
    blockingFailures: results.filter((r) => !r.passed && r.severity === 'block'),
    warnings: [],
    overallDecision: 'reject',
  };
}

describe('Publication Policy', () => {
  it('should reject individual judgment', () => {
    const decision = decidePublication({
      extraction: createTestExtraction(),
      validationResults: createIndividualJudgmentValidation(),
      claimabilityScore: 90,
      sourceDomain: 'pib.gov.in',
      trustLevel: 'official',
      featureFlags: { AUTO_VERIFY_CLAIMABLES: true },
    });

    expect(decision.action).toBe('reject');
    expect(decision.status).toBe(ClaimableStatus.IndividualJudgment);
    expect(decision.publicationStatus).toBe(PublicationStatus.Draft);
  });

  it('should reject on blocking validator failure', () => {
    const decision = decidePublication({
      extraction: createTestExtraction(),
      validationResults: createBlockingFailureValidation(),
      claimabilityScore: 90,
      sourceDomain: 'pib.gov.in',
      trustLevel: 'official',
      featureFlags: { AUTO_VERIFY_CLAIMABLES: true },
    });

    expect(decision.action).toBe('reject');
    expect(decision.status).toBe(ClaimableStatus.Rejected);
  });

  it('should require human_review when AUTO_VERIFY is false even with high score', () => {
    const decision = decidePublication({
      extraction: createTestExtraction(),
      validationResults: createAllPassValidation(),
      claimabilityScore: 95,
      sourceDomain: 'pib.gov.in',
      trustLevel: 'official',
      featureFlags: { AUTO_VERIFY_CLAIMABLES: false },
    });

    expect(decision.action).toBe('human_review');
    expect(decision.status).toBe(ClaimableStatus.Detected);
  });

  it('should auto_publish when AUTO_VERIFY is true, high score, official, all validators pass', () => {
    const decision = decidePublication({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extraction: createTestExtraction({ procedural_status: 'final' as any }),
      validationResults: createAllPassValidation(),
      claimabilityScore: 85,
      sourceDomain: 'pib.gov.in',
      trustLevel: 'official',
      featureFlags: { AUTO_VERIFY_CLAIMABLES: true },
    });

    expect(decision.action).toBe('auto_publish');
    expect(decision.publicationStatus).toBe(PublicationStatus.Published);
  });

  it('should require human_review when AUTO_VERIFY is true but low score', () => {
    const decision = decidePublication({
      extraction: createTestExtraction(),
      validationResults: createAllPassValidation(),
      claimabilityScore: 50,
      sourceDomain: 'pib.gov.in',
      trustLevel: 'official',
      featureFlags: { AUTO_VERIFY_CLAIMABLES: true },
    });

    expect(decision.action).toBe('human_review');
    expect(decision.status).toBe(ClaimableStatus.Detected);
  });
});
