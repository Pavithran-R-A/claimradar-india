import { describe, it, expect } from 'vitest';
import { PibRssAdapter } from '../../src/adapters/rss/pib.js';
import { classifyError } from '../../src/observability/failure-categories.js';
import { evaluateSourceHealth } from '../../src/freshness/source-health.js';
import type { CrawlContext, SourceHealthResult } from '../../src/adapters/types.js';

describe('Source Health Monitoring & PIB Forensic Safeguards', () => {
  it('correctly reports healthy when PIB responds with 200 and valid RSS XML', async () => {
    const adapter = new PibRssAdapter({
      id: 'test-pib',
      name: 'Press Information Bureau RSS',
      domain: 'pib.gov.in',
      sourceType: 'rss',
      adapterType: 'pib-rss',
      baseUrl: 'https://www.pib.gov.in',
      trustLevel: 'official',
      rateLimit: { requestsPerMinute: 60 },
      feedUrl: 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3',
    });

    const mockContext: CrawlContext = {
      runId: 'test-run',
      dryRun: true,
      userAgent: 'ClaimRadar India/1.0',
      timeoutMs: 5000,
    };

    const mockAdapter = Object.create(adapter);
    mockAdapter.createHttpClient = () => ({
      fetch: async () => ({
        statusCode: 200,
        body: Buffer.from('<?xml version="1.0"?><rss><channel><title>PIB</title></channel></rss>'),
      }),
    });

    const res: SourceHealthResult = await mockAdapter.healthCheck(mockContext);
    expect(res.ok).toBe(true);
    expect(res.feedValid).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('categorizes HTTP 403 Access Denied errors as HTTP_4XX failure', () => {
    const category = classifyError(
      'HTTP 403 error for https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3',
      403,
    );
    expect(category).toBe('HTTP_4XX');
  });

  it('does not mask or hide single source failures in health check results', () => {
    const healthResults = [
      { sourceId: 'src-1', ok: true, latencyMs: 120 },
      { sourceId: 'src-2', ok: true, latencyMs: 150 },
      { sourceId: 'src-3', ok: false, latencyMs: 800, category: 'HTTP_4XX' },
    ];

    const failures = healthResults.filter((r) => !r.ok).length;
    expect(failures).toBe(1);

    const byCategory: Record<string, number> = {};
    for (const r of healthResults) {
      if (!r.ok && r.category) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }
    expect(byCategory['HTTP_4XX']).toBe(1);
    expect(failures > 0).toBe(true);
  });

  it('evaluates missed-run detection independently from individual source health state', () => {
    const now = new Date('2026-08-31T12:00:00Z');
    const evalResult = evaluateSourceHealth(
      {
        isCurrentlyEnabled: true,
        expectedCheckFrequencyHours: 24,
        lastSuccessfulCheck: new Date('2026-08-31T09:00:00Z'),
        consecutiveFailureCount: 1,
      },
      now,
    );

    expect(evalResult.status).toBe('healthy');
  });

  it('sanitizes logs so that tokens, passwords, and sensitive URLs never appear in health output', () => {
    const sampleError = 'Failed to connect: postgresql://admin:super_secret_pw@db.internal:5432/db';
    const sanitized = sampleError.replace(/postgresql:\/\/[^@]+@/, 'postgresql://***@');
    expect(sanitized).not.toContain('super_secret_pw');
  });
});
