import type { SourceDefinition } from '@claimradar/source-registry';
import type { CrawlContext, SourceHealthResult } from '../types.js';
import { BaseRssAdapter } from './base.js';

/**
 * PIB (Press Information Bureau) RSS adapter.
 * PIB feeds often use non-standard date formats and may have
 * additional metadata in dc: fields.
 */
export class PibRssAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }

  protected override getFeedUrl(): string | undefined {
    // Verified 2026-07-27: RssMain.aspx is the official English all-ministries feed
    // (reg=3 pins English; the legacy indexallrss.aspx now redirects to an error page)
    return (
      this.source.feedUrl ?? 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3'
    );
  }

  override async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const result = await super.healthCheck(context);
    // PIB sometimes returns text/html for RSS feeds
    if (!result.feedValid && result.statusCode === 200) {
      return { ok: true, latencyMs: result.latencyMs, statusCode: result.statusCode };
    }
    return result;
  }
}
