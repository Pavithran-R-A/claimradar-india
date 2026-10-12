import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestExtraction } from '../fixtures/factory.js';
import { verifyEvidence } from '../../src/validation/evidence.js';
import { redactUnsupportedOptionalEvidence } from '../../src/validation/redact-unsupported.js';
import { runAllValidators } from '../../src/validation/runner.js';
import { deadlineValidator } from '../../src/validation/validators.js';

afterEach(() => vi.useRealTimers());

describe('calendar-only deadline safety', () => {
  it('keeps the last official submission day open through 23:59 IST', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T16:00:00Z')); // 21:30 IST, same day
    expect(deadlineValidator(createTestExtraction({ deadline: '2026-10-14' })).passed).toBe(true);
    vi.setSystemTime(new Date('2026-10-14T18:31:00Z')); // Oct 15 IST
    expect(deadlineValidator(createTestExtraction({ deadline: '2026-10-14' })).passed).toBe(false);
  });

  it('blocks invalid dates and deadlines more than five years ahead', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-12T06:00:00Z'));
    expect(deadlineValidator(createTestExtraction({ deadline: '2026-02-30' })).passed).toBe(false);
    expect(deadlineValidator(createTestExtraction({ deadline: '2032-01-01' })).passed).toBe(false);
  });
});

describe('unsupported AI evidence reconciliation', () => {
  const sourceText =
    'Eligible investors must submit claims for refund by 14 October 2026 at https://sebi.gov.in/claim.';

  it('removes unsupported optional claims without inventing evidence, amount or currency', () => {
    const original = createTestExtraction({
      procedural_status: 'pending',
      geographic_scope: 'India',
      relief_description: 'A guaranteed refund of Rs 100000',
      official_amount: null,
      amount_currency: 'INR',
      affected_group: 'Eligible investors',
      deadline: '2026-10-14',
      evidence: [
        { field: 'affected_group', excerpt: 'Eligible investors', page: null },
        { field: 'deadline', excerpt: '14 October 2026', page: null },
      ],
    });
    const checked = verifyEvidence(original, sourceText);
    const scrubbed = redactUnsupportedOptionalEvidence(original, checked.results);
    expect(scrubbed.extraction.procedural_status).toBeNull();
    expect(scrubbed.extraction.geographic_scope).toBeNull();
    expect(scrubbed.extraction.relief_description).toBeNull();
    expect(scrubbed.extraction.amount_currency).toBeNull();
    expect(scrubbed.extraction.affected_group).toBe('Eligible investors');
    expect(scrubbed.extraction.deadline).toBe('2026-10-14');
    expect(scrubbed.redactedFields).toContain('procedural_status');

    const validated = runAllValidators({
      extraction: scrubbed.extraction,
      sourceText,
      sourceDomain: 'sebi.gov.in',
      trustLevel: 'official',
      documentDate: '2026-10-10',
      evidenceVerification: verifyEvidence(scrubbed.extraction, sourceText),
      redactedFields: scrubbed.redactedFields,
    });
    expect(validated.results.find((v) => v.name === 'unsupported_optional_ai_fields')?.passed).toBe(
      false,
    );
    expect(validated.warnings.some((v) => v.name === 'unsupported_optional_ai_fields')).toBe(true);
  });

  it('never strips unsupported material amount or deadline to evade a blocking validator', () => {
    const original = createTestExtraction({
      official_amount: 90000000,
      deadline: '2026-10-20',
      procedural_status: 'pending',
      evidence: [],
    });
    const scrubbed = redactUnsupportedOptionalEvidence(original, []);
    expect(scrubbed.extraction.official_amount).toBe(90000000);
    expect(scrubbed.extraction.deadline).toBe('2026-10-20');
    expect(scrubbed.extraction.procedural_status).toBeNull();
    const evidence = verifyEvidence(scrubbed.extraction, 'unrelated official document');
    expect(evidence.allVerified).toBe(false);
  });
});
