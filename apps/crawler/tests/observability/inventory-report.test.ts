import { describe, it, expect } from 'vitest';
import {
  generateInventoryReport,
  type InventoryFixtureRecord,
} from '../../src/observability/inventory-report.js';
import type { IDatabaseWriter } from '../../src/pipeline/db-writer.js';

describe('Inventory Validation Reporting Tests', () => {
  it('1. Handles empty dataset cleanly', async () => {
    const report = await generateInventoryReport({
      days: 30,
      fixtureData: [],
    });
    expect(report.officialDocumentsDiscovered).toBe(0);
    expect(report.relevantCandidates).toBe(0);
    expect(report.potentialClaimables).toBe(0);
    expect(report.evidenceRejectionRate).toBe(0);
  });

  it('2. Correctly filters records for a 7-day range', async () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400 * 1000).toISOString();
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400 * 1000).toISOString();

    const fixture: InventoryFixtureRecord[] = [
      {
        id: '1',
        source_id: 'sebi-rss',
        canonical_url: 'https://example.gov.in/doc1',
        discovered_at: threeDaysAgo,
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
      {
        id: '2',
        source_id: 'rbi-rss',
        canonical_url: 'https://example.gov.in/doc2',
        discovered_at: tenDaysAgo,
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
    ];

    const report = await generateInventoryReport({
      days: 7,
      fixtureData: fixture,
    });
    expect(report.officialDocumentsDiscovered).toBe(1);
    expect(report.relevantCandidates).toBe(1);
  });

  it('3. Correctly calculates metrics for a 30-day range', async () => {
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 86400 * 1000).toISOString();

    const fixture: InventoryFixtureRecord[] = [
      {
        id: '1',
        source_id: 'pib-rss',
        canonical_url: 'https://pib.gov.in/notice-1',
        discovered_at: fifteenDaysAgo,
        is_candidate: true,
        is_claimable: true,
        is_published: true,
        action_route: 'form-a',
        sector_id: 'banking',
      },
    ];

    const report = await generateInventoryReport({
      days: 30,
      fixtureData: fixture,
    });
    expect(report.officialDocumentsDiscovered).toBe(1);
    expect(report.activeActionRoutes).toBe(1);
    expect(report.representedSectors).toBe(1);
  });

  it('4. Supports custom date ranges (from and to)', async () => {
    const fixture: InventoryFixtureRecord[] = [
      {
        id: '1',
        source_id: 'sebi-rss',
        canonical_url: 'https://sebi.gov.in/circular-10',
        discovered_at: '2026-07-15T10:00:00.000Z',
        is_candidate: true,
        is_claimable: false,
        is_published: false,
      },
    ];

    const report = await generateInventoryReport({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-31T23:59:59.000Z',
      fixtureData: fixture,
    });

    expect(report.rangeLabel).toBe('2026-07-01 to 2026-07-31');
    expect(report.officialDocumentsDiscovered).toBe(1);
  });

  it('5. Rejects invalid date ranges where from > to', async () => {
    await expect(
      generateInventoryReport({
        from: '2026-08-10T00:00:00.000Z',
        to: '2026-08-01T00:00:00.000Z',
      }),
    ).rejects.toThrow("Invalid date range: 'from' date must be before 'to' date");
  });

  it('6. Correctly includes records exactly on date boundaries', async () => {
    const fromStr = '2026-07-01T00:00:00.000Z';
    const toStr = '2026-07-31T23:59:59.000Z';

    const fixture: InventoryFixtureRecord[] = [
      {
        id: 'b1',
        source_id: 'rbi-rss',
        canonical_url: 'https://rbi.org.in/press/1',
        discovered_at: fromStr,
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
      {
        id: 'b2',
        source_id: 'rbi-rss',
        canonical_url: 'https://rbi.org.in/press/2',
        discovered_at: toStr,
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
    ];

    const report = await generateInventoryReport({
      from: fromStr,
      to: toStr,
      fixtureData: fixture,
    });
    expect(report.officialDocumentsDiscovered).toBe(2);
  });

  it('7. Prevents double-counting of duplicate canonical URLs', async () => {
    const fixture: InventoryFixtureRecord[] = [
      {
        id: 'dup1',
        source_id: 'sebi-rss',
        canonical_url: 'https://sebi.gov.in/same-circular',
        discovered_at: '2026-07-10T10:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
      {
        id: 'dup2',
        source_id: 'sebi-rss',
        canonical_url: 'https://sebi.gov.in/same-circular',
        discovered_at: '2026-07-10T12:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
    ];

    const report = await generateInventoryReport({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-31T23:59:59.000Z',
      fixtureData: fixture,
    });
    expect(report.officialDocumentsDiscovered).toBe(1);
  });

  it('8. Handles multiple sources for a single claimable', async () => {
    const fixture: InventoryFixtureRecord[] = [
      {
        id: 'src1',
        source_id: 'pib-rss',
        canonical_url: 'https://pib.gov.in/press/100',
        discovered_at: '2026-07-15T10:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
      {
        id: 'src2',
        source_id: 'sebi-rss',
        canonical_url: 'https://sebi.gov.in/press/100-ref',
        discovered_at: '2026-07-15T11:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
    ];

    const report = await generateInventoryReport({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-31T23:59:59.000Z',
      fixtureData: fixture,
    });
    expect(report.officialDocumentsDiscovered).toBe(2);
    expect(report.potentialClaimables).toBe(2);
  });

  it('9. Separates unpublished candidates from public official updates', async () => {
    const fixture: InventoryFixtureRecord[] = [
      {
        id: 'cand1',
        source_id: 'rbi-rss',
        canonical_url: 'https://rbi.org.in/press/draft',
        discovered_at: '2026-07-20T10:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: false,
      },
      {
        id: 'cand2',
        source_id: 'rbi-rss',
        canonical_url: 'https://rbi.org.in/press/public',
        discovered_at: '2026-07-20T11:00:00.000Z',
        is_candidate: true,
        is_claimable: true,
        is_published: true,
      },
    ];

    const report = await generateInventoryReport({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-31T23:59:59.000Z',
      fixtureData: fixture,
    });
    expect(report.relevantCandidates).toBe(2);
    expect(report.publicOfficialUpdates).toBe(1);
  });

  it('10. Safely records database connection errors without swallowing', async () => {
    const mockFailingStorage = {
      getEnabledSources: async () => {
        throw new Error('Connection refused to database');
      },
    } as unknown as IDatabaseWriter;

    const report = await generateInventoryReport({
      days: 30,
      storage: mockFailingStorage,
    });

    expect(report.isDbConnected).toBe(false);
    expect(report.status).toContain('Connection refused to database');
  });
});
