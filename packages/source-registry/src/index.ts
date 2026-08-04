import { SourceType } from '@claimradar/shared-types';

export interface SourceAdapter {
  discover(): Promise<string[]>;
  fetchDocument(url: string): Promise<string>;
  extractMetadata(content: string): Promise<Record<string, unknown>>;
  normalizeUrl(url: string): string;
  healthCheck(): Promise<boolean>;
}

export interface SourceDefinition {
  id: string;
  name: string;
  domain: string;
  sourceType: SourceType;
  adapterType: string;
  baseUrl: string;
  feedUrl?: string;
  trustLevel: 'official' | 'reputable' | 'community' | 'unverified';
  rateLimit: {
    requestsPerMinute: number;
  };
  config?: Record<string, unknown>;
}

export const pibRssSource: SourceDefinition = {
  id: 'pib-rss',
  name: 'Press Information Bureau RSS',
  domain: 'pib.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.pib.gov.in',
  // Verified 2026-07-27: indexallrss.aspx redirects to ErrorPage.html; the official
  // English all-ministries press-release feed is RssMain.aspx (ModId=6, Lang=1,
  // Regid=3, reg=3 pins English — without reg the server geo-redirects to Hindi).
  // Note: pib.gov.in (Akamai) returns 403 to non-browser user agents.
  feedUrl: 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const sebiRssSource: SourceDefinition = {
  id: 'sebi-rss',
  name: 'SEBI RSS Feed',
  domain: 'sebi.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.sebi.gov.in',
  // Verified 2026-07-27: the old sebi_data/attachdocs/rss-feeds/press-release.xml
  // path returns HTTP 404 (stale since ~2022); /sebirss.xml is the live official feed.
  feedUrl: 'https://www.sebi.gov.in/sebirss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const rbiRssSource: SourceDefinition = {
  id: 'rbi-rss',
  name: 'Reserve Bank of India RSS',
  domain: 'rbi.org.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.rbi.org.in',
  // Verified 2026-07-27: the previous URL was a single press-release DETAIL page,
  // not a feed. RBI's official press-release RSS (listed on rbi.org.in/scripts/rss.aspx)
  // is pressreleases_rss.xml, live with ETag/Last-Modified/304 support.
  feedUrl: 'https://www.rbi.org.in/pressreleases_rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const initialSources: SourceDefinition[] = [pibRssSource, sebiRssSource, rbiRssSource];
