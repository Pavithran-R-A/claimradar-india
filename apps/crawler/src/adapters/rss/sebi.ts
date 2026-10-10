import type { SourceDefinition } from '@claimradar/source-registry';
import type { CrawlContext, DiscoveredDocument, SourceHealthResult } from '../types.js';
import { BaseRssAdapter } from './base.js';

/**
 * Some official SEBI RSS entries embed a complete, same-host absolute URL
 * after the base origin, e.g. https://www.sebi.gov.in/https://www.sebi.gov.in/
 * sebi_data/... . Fetching that broken URL produces a 404 and fails the crawl.
 *
 * Unwrap only an exact duplicated SEBI origin inside an HTTPS SEBI URL. Never
 * rewrite another host, change a query string, or silently accept off-site links.
 */
export function normalizeSebiRssLink(rawLink: string): string {
  let url: URL;
  try {
    url = new URL(rawLink);
  } catch {
    return rawLink;
  }

  if (url.protocol !== 'https:' || !/^(?:www[.])?sebi[.]gov[.]in$/i.test(url.hostname)) {
    return rawLink;
  }

  const duplicateOrigin = /^[/]https?:[/][/](?:www[.])?sebi[.]gov[.]in(?=[/]|$)/i;
  if (!duplicateOrigin.test(url.pathname)) return rawLink;

  let pathname = url.pathname;
  // Repeated nested origins may appear in malformed feeds; bound the repair.
  for (let i = 0; i < 4 && duplicateOrigin.test(pathname); i++) {
    pathname = pathname.replace(duplicateOrigin, '') || '/';
  }
  url.pathname = pathname;
  return url.href;
}

/**
 * SEBI (Securities and Exchange Board of India) RSS adapter.
 * SEBI feeds use standard RSS 2.0 with press release XML.
 */
export class SebiRssAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }

  override async discover(context: CrawlContext): Promise<DiscoveredDocument[]> {
    const documents = await super.discover(context);
    return documents.map((document) => {
      const corrected = normalizeSebiRssLink(document.url);
      if (corrected === document.url) return document;
      return {
        ...document,
        url: corrected,
        metadata: {
          ...(document.metadata ?? {}),
          originalRssLink: document.url,
        },
      };
    });
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
