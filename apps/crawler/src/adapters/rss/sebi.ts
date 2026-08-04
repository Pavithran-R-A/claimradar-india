import type { SourceDefinition } from '@claimradar/source-registry';
import type { CrawlContext, SourceHealthResult } from '../types.js';
import { BaseRssAdapter } from './base.js';

/**
 * SEBI (Securities and Exchange Board of India) RSS adapter.
 * SEBI feeds use standard RSS 2.0 with press release XML.
 */
export class SebiRssAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }

  protected override getFeedUrl(): string | undefined {
    // Verified 2026-07-27: /sebirss.xml is the live official feed (the old
    // sebi_data/attachdocs/rss-feeds/press-release.xml path returns 404)
    return this.source.feedUrl ?? 'https://www.sebi.gov.in/sebirss.xml';
  }

  override async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const result = await super.healthCheck(context);
    // SEBI feeds are standard RSS XML
    return result;
  }
}
