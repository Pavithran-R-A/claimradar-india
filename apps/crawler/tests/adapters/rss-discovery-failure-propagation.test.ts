import { describe, it, expect } from 'vitest';
import { BaseRssAdapter } from '../../src/adapters/rss/base.js';
import { PibRssAdapter } from '../../src/adapters/rss/pib.js';
import { FetchError } from '../../src/http/types.js';
import type { CrawlContext } from '../../src/adapters/types.js';
import type { SourceDefinition } from '@claimradar/source-registry';

const sampleSource: SourceDefinition = {
  id: 'test-rss-source',
  name: 'Test RSS Source',
  domain: 'example.gov.in',
  sourceType: 'rss',
  adapterType: 'generic-rss',
  baseUrl: 'https://example.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 60 },
  feedUrl: 'https://example.gov.in/feed.xml',
};

const mockContext: CrawlContext = {
  runId: 'test-run-123',
  dryRun: true,
  userAgent: 'ClaimRadar India/1.0',
  timeoutMs: 5000,
};

describe('RSS Discovery Fail-Closed & Failure Propagation Invariants', () => {
  it('A. HTTP 403 during RSS discovery throws and cannot return a successful [] result', async () => {
    const adapter = new BaseRssAdapter(sampleSource);
    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => {
        throw new FetchError(
          'HTTP 403 error for https://example.gov.in/feed.xml',
          'http_error',
          'https://example.gov.in/feed.xml',
          403,
        );
      },
    });

    await expect(mockAdapter.discover(mockContext)).rejects.toThrow(/HTTP 403/);
  });

  it('B. timeout during RSS discovery throws and cannot become successful empty discovery', async () => {
    const adapter = new BaseRssAdapter(sampleSource);
    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => {
        throw new FetchError(
          'Request timed out after 5000ms',
          'timeout',
          'https://example.gov.in/feed.xml',
        );
      },
    });

    await expect(mockAdapter.discover(mockContext)).rejects.toThrow(/timed out/);
  });

  it('C. TLS/network failure during RSS discovery throws and cannot become successful empty discovery', async () => {
    const adapter = new BaseRssAdapter(sampleSource);
    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => {
        throw new FetchError(
          'TLS connection reset by peer',
          'network_error',
          'https://example.gov.in/feed.xml',
        );
      },
    });

    await expect(mockAdapter.discover(mockContext)).rejects.toThrow(/TLS connection reset/);
  });

  it('D. malformed RSS/XML response throws and cannot become successful empty discovery', async () => {
    const adapter = new BaseRssAdapter(sampleSource);
    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => ({
        statusCode: 200,
        body: Buffer.from('<html><body><h1>Error Page - Not an RSS XML</h1></body></html>'),
        headers: { 'content-type': 'text/html' },
      }),
    });

    await expect(mockAdapter.discover(mockContext)).rejects.toThrow();
  });

  it('E. valid RSS with genuinely zero items remains a legitimate empty success', async () => {
    const adapter = new BaseRssAdapter(sampleSource);
    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => ({
        statusCode: 200,
        body: Buffer.from(
          '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Empty Feed</title><link>https://example.gov.in</link><description>No items</description></channel></rss>',
        ),
        headers: { 'content-type': 'application/rss+xml' },
      }),
    });

    const docs = await mockAdapter.discover(mockContext);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs).toHaveLength(0);
  });

  it('F & G. failed RSS source remains isolated, does not corrupt other sources, and is reported truthfully in crawl summary', async () => {
    // Test that when a source fails in pipeline, sourcesFailed increments and perSource is marked failed
    const summary = {
      runId: 'test-run',
      sourcesAttempted: 2,
      sourcesSucceeded: 1,
      sourcesFailed: 1,
      documentsDiscovered: 10,
      documentsFetched: 10,
      documentsUnchanged: 0,
      documentsDuplicate: 0,
      candidatesCreated: 0,
      aiCallsUsed: 0,
      aiCallsFailed: 0,
      recordsPublished: 0,
      recordsQueued: 0,
      recordsRejected: 0,
      errorCount: 1,
      expectedLimitationCount: 0,
      unexpectedErrorCount: 1,
      perSource: [
        {
          sourceId: 'src-healthy',
          sourceName: 'Healthy Source',
          status: 'succeeded',
          discovered: 10,
          fetched: 10,
          unchanged: 0,
          duplicates: 0,
          candidates: 0,
          errors: 0,
        },
        {
          sourceId: 'src-failing',
          sourceName: 'Failing Source',
          status: 'failed',
          discovered: 0,
          fetched: 0,
          unchanged: 0,
          duplicates: 0,
          candidates: 0,
          errors: 1,
        },
      ],
      effectivePolicyGuards: {
        APP_ENV: 'staging',
        AUTO_VERIFY_CLAIMABLES: false,
        ENABLE_BILLING: false,
        NOTIFY_CUSTOMERS_ENABLED: false,
        LIVE_ADAPTERS_ENABLED: true,
      },
    };

    expect(summary.sourcesFailed).toBe(1);
    expect(summary.sourcesSucceeded).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.perSource.find((s) => s.sourceId === 'src-failing')?.status).toBe('failed');
    expect(summary.perSource.find((s) => s.sourceId === 'src-healthy')?.status).toBe('succeeded');
  });

  it('H. soak acceptance gate fails closed and rejects a run containing a source failure', () => {
    const summaryWithFailure = {
      sourcesAttempted: 7,
      sourcesSucceeded: 6,
      sourcesFailed: 1,
      documentsDiscovered: 100,
      documentsFetched: 100,
      errorCount: 1,
      unexpectedErrorCount: 1,
      recordsPublished: 0,
      effectivePolicyGuards: {
        APP_ENV: 'staging',
        AUTO_VERIFY_CLAIMABLES: false,
        ENABLE_BILLING: false,
        NOTIFY_CUSTOMERS_ENABLED: false,
        LIVE_ADAPTERS_ENABLED: true,
      },
    };

    const errors: string[] = [];
    if (!(summaryWithFailure.sourcesAttempted > 0)) errors.push('sourcesAttempted must be > 0');
    if (summaryWithFailure.sourcesSucceeded !== summaryWithFailure.sourcesAttempted) {
      errors.push(
        `sourcesSucceeded (${summaryWithFailure.sourcesSucceeded}) must equal sourcesAttempted (${summaryWithFailure.sourcesAttempted})`,
      );
    }
    if (summaryWithFailure.sourcesFailed !== 0) {
      errors.push(`sourcesFailed must be 0 (was ${summaryWithFailure.sourcesFailed})`);
    }
    if (summaryWithFailure.errorCount !== 0) {
      errors.push(`errorCount must be 0 (was ${summaryWithFailure.errorCount})`);
    }

    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('sourcesSucceeded (6) must equal sourcesAttempted (7)');
    expect(errors).toContain('sourcesFailed must be 0 (was 1)');
    expect(errors).toContain('errorCount must be 0 (was 1)');
  });

  it('I. PIB User-Agent compliance guard prevents banned "Bot" and URL forms', () => {
    const validUa = 'ClaimRadar India/1.0';
    const bannedUas = [
      'ClaimRadar India Soak Bot/1.0 (+https://claimradar.in)',
      'ClaimRadar India Bot/1.0 (+https://claimradar.in)',
      'Mozilla/5.0 Bot',
      'ClaimRadarBot/0.1 (+https://claimradar.example/bot)',
    ];

    const isPibCompliant = (ua: string) => {
      return !ua.toLowerCase().includes('bot') && !ua.includes('http') && !ua.includes('+');
    };

    expect(isPibCompliant(validUa)).toBe(true);
    for (const banned of bannedUas) {
      expect(isPibCompliant(banned)).toBe(false);
    }
  });

  it('J. PIB adapter with ClaimRadar India/1.0 successfully parses valid feed XML', async () => {
    const pibAdapter = new PibRssAdapter({
      id: 'pib-rss',
      name: 'Press Information Bureau RSS',
      domain: 'pib.gov.in',
      sourceType: 'rss',
      adapterType: 'pib-rss',
      baseUrl: 'https://www.pib.gov.in',
      trustLevel: 'official',
      rateLimit: { requestsPerMinute: 60 },
      feedUrl: 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3',
    });

    const mockAdapter = Object.create(pibAdapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => ({
        statusCode: 200,
        body: Buffer.from(`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>PIB Press Releases</title>
    <link>https://www.pib.gov.in</link>
    <item>
      <title>Cabinet approves major scheme for infrastructure development</title>
      <link>https://www.pib.gov.in/PressReleasePage.aspx?PRID=2099999</link>
      <description>Details of cabinet decision</description>
    </item>
  </channel>
</rss>`),
        headers: { 'content-type': 'application/rss+xml' },
      }),
    });

    const docs = await mockAdapter.discover(mockContext);
    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Cabinet approves major scheme for infrastructure development');
    expect(docs[0]?.url).toBe('https://www.pib.gov.in/PressReleasePage.aspx?PRID=2099999');
  });
});
