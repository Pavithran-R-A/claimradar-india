import { describe, expect, it } from 'vitest';
import { rankNotices } from '../../lib/official-notice-ranking';

const sebiBase = 'https://www.sebi.gov.in/media-and-notifications/public-notices/';
const title = 'PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT LTD FOR REFUND';

describe('official-source review list', () => {
  it('groups the same refund matter and selects the newest official publication, not newest crawl', () => {
    const rows = [
      { title, canonical_url: sebiBase + 'feb-2026/old.html', published_at: '2026-02-18' },
      { title, canonical_url: sebiBase + 'mar-2026/older.html', published_at: '2026-03-12' },
      { title, canonical_url: sebiBase + 'jul-2026/phase-ii.html', published_at: '2026-07-29' },
      { title, canonical_url: sebiBase + 'sep-2026/latest.html', published_at: '2026-09-10' },
      { title, canonical_url: sebiBase + 'sep-2026/latest.html', published_at: null },
      {
        title: 'CRCS-Sahara refund portal — official notice',
        canonical_url: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2308015',
        published_at: null,
      },
    ];
    const output = rankNotices(rows);
    expect(output).toHaveLength(2);
    expect(output[0]?.url).toContain('sep-2026/latest.html');
    expect(output[0]?.publishedAt).toBe('2026-09-10');
    expect(output[1]?.authority).toBe('PIB');
    expect(output[0]?.title).toContain('Citrus Check Inns');
  });

  it('searches reviewed source references without pretending that they are published claims', () => {
    const rows = [
      { title, canonical_url: sebiBase + 'sep-2026/latest.html', published_at: '2026-09-10' },
      { title: 'CRCS-Sahara refund portal', canonical_url: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2308015', published_at: null },
    ];
    expect(rankNotices(rows, 'sahara')).toHaveLength(1);
    expect(rankNotices(rows, 'sahara')[0]?.authority).toBe('PIB');
    expect(rankNotices(rows, 'no-match')).toEqual([]);
  });

  it('never displays offsite or non-HTTPS links as government notices', () => {
    const output = rankNotices([
      { title, canonical_url: 'https://attacker.example/notices/refund', published_at: '2026-10-10' },
      { title, canonical_url: 'http://www.sebi.gov.in/fake.html', published_at: '2026-10-10' },
      { title, canonical_url: sebiBase + 'sep-2026/latest.html', published_at: '2026-09-10' },
    ]);
    expect(output).toHaveLength(1);
    expect(output[0]?.url).toContain('sebi.gov.in');
  });
});
