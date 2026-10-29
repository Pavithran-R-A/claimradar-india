import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const actions = readFileSync(new URL('../../app/admin/actions.ts', import.meta.url), 'utf8');

describe('candidate publication cannot rely on stale extraction dates', () => {
  it('rechecks the source deadline before editorial candidate approval', () => {
    const start = actions.indexOf('export async function approveCandidate');
    const end = actions.indexOf('export async function rejectCandidate');
    const approval = actions.slice(start, end);
    const deadlineCheck = approval.indexOf(
      'isPublicationDeadlineExpired(extracted?.deadline ?? null)',
    );
    const approvalWrite = approval.indexOf("publication_decision: 'approved'");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(deadlineCheck).toBeGreaterThanOrEqual(0);
    expect(approvalWrite).toBeGreaterThan(deadlineCheck);
  });

  it('rechecks expiration and misleading URLs before draft promotion', () => {
    const promotion = actions.split('export async function promoteCandidate')[1] ?? '';
    const insert = promotion.indexOf(".from('claimables')");
    expect(promotion).toContain('isPublicationDeadlineExpired(candidateDeadline)');
    expect(promotion).toContain(
      'isKnownNonFilingInformationUrl(reviewedExtraction.official_claim_url)',
    );
    expect(promotion.indexOf('isPublicationDeadlineExpired')).toBeLessThan(insert);
    expect(promotion.indexOf('isKnownNonFilingInformationUrl')).toBeLessThan(insert);
  });
});
