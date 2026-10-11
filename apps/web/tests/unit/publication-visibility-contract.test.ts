import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isPubliclyPublishable } from '../../lib/claimables-repository';

describe('editorial approval and public directory parity', () => {
  it('never allows a merely detected draft to be considered visible', () => {
    expect(isPubliclyPublishable('detected', 'published')).toBe(false);
    expect(isPubliclyPublishable('rejected', 'published')).toBe(false);
    expect(isPubliclyPublishable('official_update', 'draft')).toBe(false);
    expect(isPubliclyPublishable('official_update', 'published')).toBe(true);
    expect(isPubliclyPublishable('potential_claimable', 'published')).toBe(true);
    expect(isPubliclyPublishable('verified_claimable', 'published')).toBe(true);
  });

  it('requires editorial approval to enforce the exact public visibility gate', () => {
    const source = readFileSync(
      new URL('../../app/admin/editorial-actions.ts', import.meta.url),
      'utf8',
    );
    expect(source).toContain("if (!isPubliclyPublishable(claimable.status, 'published'))");
  });

  it('does not invent INR or turn AI confidence into a legal claimability score', () => {
    const source = readFileSync(new URL('../../app/admin/actions.ts', import.meta.url), 'utf8');
    expect(source).toContain('amount_currency: str(ext.amount_currency)');
    expect(source).toContain('claimability_score: null');
    expect(source).toContain('confidence: confidencePercent');
  });
});
