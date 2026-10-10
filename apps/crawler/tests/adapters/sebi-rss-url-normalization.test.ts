import { describe, expect, it } from 'vitest';
import { sebiRssSource } from '@claimradar/source-registry';
import { SebiRssAdapter, normalizeSebiRssLink } from '../../src/adapters/rss/sebi.js';
import type { CrawlContext } from '../../src/adapters/types.js';

const broken =
  'https://www.sebi.gov.in/https://www.sebi.gov.in/sebi_data/commondocs/oct-2026/Exemption%20Order%20in%20the%20matter%20of%20NGLFineChem_p.pdf';
const fixed =
  'https://www.sebi.gov.in/sebi_data/commondocs/oct-2026/Exemption%20Order%20in%20the%20matter%20of%20NGLFineChem_p.pdf';

describe('SEBI RSS item URL normalization', () => {
  it('repairs the exact malformed URL that failed the production crawl', () => {
    expect(normalizeSebiRssLink(broken)).toBe(fixed);
  });

  it('does not alter already valid SEBI links or query strings', () => {
    expect(normalizeSebiRssLink(fixed)).toBe(fixed);
    expect(normalizeSebiRssLink(`${fixed}?version=2&lang=en`)).toBe(
      `${fixed}?version=2&lang=en`,
    );
  });

  it('fixes repeated same-host origins but never rewrites a foreign host or insecure transport', () => {
    const triple =
      'https://www.sebi.gov.in/https://sebi.gov.in/https://www.sebi.gov.in/notice.pdf';
    expect(normalizeSebiRssLink(triple)).toBe('https://www.sebi.gov.in/notice.pdf');
    const foreign = 'https://example.org/https://www.sebi.gov.in/notice.pdf';
    expect(normalizeSebiRssLink(foreign)).toBe(foreign);
    const malicious = 'https://www.sebi.gov.in/https://evil.example/notice.pdf';
    expect(normalizeSebiRssLink(malicious)).toBe(malicious);
    const insecure = 'http://www.sebi.gov.in/https://www.sebi.gov.in/notice.pdf';
    expect(normalizeSebiRssLink(insecure)).toBe(insecure);
    expect(normalizeSebiRssLink('not a URL')).toBe('not a URL');
  });

  it('repairs a real-shaped feed item before the crawler fetch stage and preserves provenance', async () => {
    const adapter = Object.create(new SebiRssAdapter(sebiRssSource));
    adapter.createHttpClient = () => ({
      fetch: async () => ({
        statusCode: 200,
        body: Buffer.from(`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"><channel>
  <title>SEBI RSS Feed</title>
  <link>https://www.sebi.gov.in</link>
  <description>Official</description>
  <item><title>Official notification</title><link>${broken}</link>
  <guid>official-id-1</guid><description>SEBI announcement</description></item>
</channel></rss>`),
      }),
    });
    const context: CrawlContext = {
      runId: 'sebi-url-regression',
      dryRun: true,
      userAgent: 'ClaimRadar India/1.0',
      timeoutMs: 5_000,
    };
    const documents = await adapter.discover(context);
    expect(documents).toHaveLength(1);
    expect(documents[0]?.url).toBe(fixed);
    expect(documents[0]?.sourceIdentifier).toBe('official-id-1');
    expect(documents[0]?.metadata?.['originalRssLink']).toBe(broken);
    // No duplicate base origin is allowed into the fetch/dedup pipeline.
    expect(documents[0]?.url).not.toContain('.gov.in/https://');
  });
});
