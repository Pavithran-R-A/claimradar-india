import type { SourceDefinition } from '@claimradar/source-registry';
import type { CrawlContext, SourceHealthResult } from '../types.js';
import type { DiscoveredDocument, FetchedDocument } from '../types.js';
import { BaseRssAdapter } from './base.js';

const RBI_HOSTNAMES = new Set(['rbi.org.in', 'www.rbi.org.in']);

/**
 * Canonicalize legacy RBI links before any network request.
 * RBI's official RSS feeds still publish HTTP detail links.
 */
export function normalizeRbiUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid RBI URL: ${rawUrl}`);
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.port) {
    throw new Error(`Unsupported RBI URL: ${rawUrl}`);
  }
  if (!RBI_HOSTNAMES.has(url.hostname.toLowerCase())) {
    throw new Error(`Untrusted RBI hostname: ${url.hostname}`);
  }

  url.protocol = 'https:';
  url.hostname = 'rbi.org.in';
  return url.toString();
}

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
    // Verified 2026-09-12: RBI's official feeds are served on both hosts.
    // Bare-host URLs avoid legacy www item-link inconsistencies.
    // (the previous fallback pointed at a single press-release detail page)
    return normalizeRbiUrl(this.source.feedUrl ?? 'https://rbi.org.in/pressreleases_rss.xml');
  }

  override async discover(context: CrawlContext): Promise<DiscoveredDocument[]> {
    const documents = await super.discover(context);
    return documents.map((document) => ({
      ...document,
      url: normalizeRbiUrl(document.url),
    }));
  }

  override async fetchDocument(
    document: DiscoveredDocument,
    context: CrawlContext,
  ): Promise<FetchedDocument> {
    return super.fetchDocument(
      {
        ...document,
        url: normalizeRbiUrl(document.url),
      },
      context,
    );
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
