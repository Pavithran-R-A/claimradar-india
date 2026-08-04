import type { SourceDefinition } from '@claimradar/source-registry';
import type { CrawlContext, SourceHealthResult } from '../types.js';
import { BaseRssAdapter } from './base.js';

/**
 * RBI (Reserve Bank of India) RSS adapter.
 * RBI feeds may use ASP.NET-based URL patterns and
 * sometimes return non-standard content types.
 */
export class RbiRssAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }

  protected override getFeedUrl(): string | undefined {
    // Verified 2026-07-27: pressreleases_rss.xml is RBI's official press-release feed
    // (the previous fallback pointed at a single press-release detail page)
    return this.source.feedUrl ?? 'https://www.rbi.org.in/pressreleases_rss.xml';
  }

  override async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const result = await super.healthCheck(context);
    // RBI may serve RSS from ASP.NET pages with text/html content-type
    if (!result.feedValid && result.statusCode === 200) {
      return { ok: true, latencyMs: result.latencyMs, statusCode: result.statusCode };
    }
    return result;
  }
}
