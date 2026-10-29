import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const actions = readFileSync(new URL('../../app/admin/actions.ts', import.meta.url), 'utf8');

describe('candidate publication cannot rely on stale extraction dates', () => {
  it('rechecks the source deadline before editorial candidate approval', () => {
    const approval = actions.split('export async function approveCandidate')[1]?.split(
      'export async function rejectCandidate',
    )[0];
    expect(approval).toContain('isPublicationDeadlineExpired(extracted?.deadline ?? null)');
    expect(approval?.indexOf('isPublicationDeadlineExpired')).toBeLessThan(
      approval?.indexOf("publication_decision: 'approved'"),
    );
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
