import { describe, it, expect } from 'vitest';
import {
  PUBLIC_SAFE_STATUSES,
  isPubliclyPublishable,
  mapClaimableRow,
  getPublishedClaimables,
  getPublishedClaimableBySlug,
  __setDbClientFactoryForTests,
  __resetDbClientFactoryForTests,
} from '../lib/claimables-repository';
import { makeValidRow, fakeDbClient } from './fixtures';

/* -------------------------------------------------------------------------- */
/*  Publication filter                                                         */
/* -------------------------------------------------------------------------- */

describe('Publication policy filter', () => {
  it('accepts only the public-safe statuses when published', () => {
    for (const status of PUBLIC_SAFE_STATUSES) {
      expect(isPubliclyPublishable(status, 'published')).toBe(true);
    }
  });

  it('rejects non-safe statuses even when marked published', () => {
    const unsafe = [
      'detected',
      'refund_ordered',
      'registration_open',
      'monitoring',
      'closed',
      'rejected',
      'uncertain',
      'identified_users_only',
      'individual_judgment',
    ];
    for (const status of unsafe) {
      expect(isPubliclyPublishable(status, 'published')).toBe(false);
    }
  });

  it('rejects safe statuses that are not published', () => {
    for (const status of PUBLIC_SAFE_STATUSES) {
      expect(isPubliclyPublishable(status, 'draft')).toBe(false);
      expect(isPubliclyPublishable(status, 'archived')).toBe(false);
      expect(isPubliclyPublishable(status, null)).toBe(false);
    }
  });

  it('rejects null or unknown statuses', () => {
    expect(isPubliclyPublishable(null, 'published')).toBe(false);
    expect(isPubliclyPublishable(undefined, 'published')).toBe(false);
    expect(isPubliclyPublishable('something-else', 'published')).toBe(false);
  });
});

describe('Row mapping content integrity', () => {
  it('never exposes internal-only fields on the public view model', () => {
    const mapped = mapClaimableRow(makeValidRow());
    expect(mapped).not.toHaveProperty('rawText');
    expect(mapped).not.toHaveProperty('aiPrompt');
    expect(mapped).not.toHaveProperty('staffNotes');
    expect(mapped).not.toHaveProperty('auditLog');
    expect(mapped).not.toHaveProperty('claimability_score');
    expect(mapped).not.toHaveProperty('confidence');
  });

  it('maps core fields from the database row', () => {
    const mapped = mapClaimableRow(makeValidRow());
    expect(mapped.slug).toBe('test-refund-2026');
    expect(mapped.title).toBe('Test Refund Scheme 2026');
    expect(mapped.companyName).toBe('Test Company Ltd');
    expect(mapped.sector).toBe('Test Sector');
    expect(mapped.statusDetail).toBe('Verified claimable');
    expect(mapped.officialSources).toHaveLength(1);
    expect(mapped.officialSources[0]?.url).toBe('https://example.com/test-order.pdf');
  });

  it('returns only published safe-status records from directory queries', async () => {
    // Defence in depth: even if the DB ever returned extra rows, the
    // repository must filter them out of public results.
    __setDbClientFactoryForTests(() =>
      fakeDbClient({
        data: [
          makeValidRow({ id: 'ok-1', slug: 'ok-1', status: 'official_update' }),
          makeValidRow({ id: 'bad-1', slug: 'bad-1', status: 'detected' }),
          makeValidRow({ id: 'bad-2', slug: 'bad-2', status: 'monitoring' }),
        ],
        error: null,
      }),
    );

    const result = await getPublishedClaimables({ limit: 50 });
    __resetDbClientFactoryForTests();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.demo).toBe(false);
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.slug).toBe('ok-1');
    }
  });

  it('returns null for unknown or internal slugs', async () => {
    __setDbClientFactoryForTests(() =>
      fakeDbClient({
        data: [makeValidRow({ id: 'ok-1', slug: 'ok-1', status: 'official_update' })],
        error: null,
      }),
    );

    const missing = await getPublishedClaimableBySlug('internal-draft-candidate-999');
    __resetDbClientFactoryForTests();

    expect(missing.ok).toBe(true);
    if (missing.ok) {
      expect(missing.data).toBeNull();
    }
  });
});
