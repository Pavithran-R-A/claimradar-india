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

// Decommissioned 2026-08-05 (new-device live dry run): https://www.cci.gov.in/rss.xml
// fails the TLS handshake with UNABLE_TO_VERIFY_LEAF_SIGNATURE — the server presents only
// the leaf certificate (CN=cci.gov.in <- Sectigo Public Server Authentication CA DV R36)
// and omits the intermediate, so the chain cannot be verified. This is a server-side
// misconfiguration we must not work around (TLS verification stays strict; no
// NODE_TLS_REJECT_UNAUTHORIZED=0). The endpoint is disabled from scheduled crawling by
// being removed from initialSources; the definition is kept for provenance only.
export const cciRssSourceDisabled: SourceDefinition = {
  id: 'cci-rss',
  name: 'Competition Commission of India RSS (disabled — untrusted TLS chain)',
  domain: 'cci.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.cci.gov.in',
  feedUrl: 'https://www.cci.gov.in/rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

// Commissioned 2026-08-05 as the replacement live endpoint for the generic RSS adapter.
// Suitability: publicly permitted official RSS 2.0 feed of the W3C (World Wide Web
// Consortium) news channel; verified live over strict TLS — HTTP 200
// application/rss+xml, 25 items with RFC-822 pubDates, GUIDs and absolute links, ETag
// support, no redirects, and no bot-blocking for the declared crawler User-Agent.
// Unlike the previous CCI endpoint (which never got past the TLS handshake), it
// exercises the full adapter path: discover -> fetch detail pages -> extract.
export const genericRssSource: SourceDefinition = {
  id: 'generic-rss',
  name: 'W3C News RSS (Generic Adapter)',
  domain: 'www.w3.org',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.w3.org',
  feedUrl: 'https://www.w3.org/news/feed/',
  trustLevel: 'reputable',
  rateLimit: { requestsPerMinute: 10 },
};

export const sebiOrdersRssSource: SourceDefinition = {
  id: 'sebi-orders-rss',
  name: 'SEBI Enforcement & Recovery Orders',
  domain: 'sebi.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.sebi.gov.in',
  feedUrl: 'https://www.sebi.gov.in/sebirss.xml?type=orders',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const rbiNotificationsRssSource: SourceDefinition = {
  id: 'rbi-notifications-rss',
  name: 'RBI Consumer Protection & Ombudsman Notifications',
  domain: 'rbi.org.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.rbi.org.in',
  feedUrl: 'https://www.rbi.org.in/notifications_rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const irdaiNoticesSource: SourceDefinition = {
  id: 'irdai-notices',
  name: 'IRDAI Policyholder Unclaimed Funds & Claim Notices',
  domain: 'irdai.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://irdai.gov.in',
  feedUrl: 'https://irdai.gov.in/rss-feed',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const iepfNoticesSource: SourceDefinition = {
  id: 'iepf-notices',
  name: 'Investor Education & Protection Fund Authority Notices',
  domain: 'iepf.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.iepf.gov.in',
  feedUrl: 'https://www.iepf.gov.in/IEPF/rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const ibbiAnnouncementsSource: SourceDefinition = {
  id: 'ibbi-public-announcements',
  name: 'IBBI Corporate Insolvency Creditor Claims Notices',
  domain: 'ibbi.gov.in',
  sourceType: SourceType.HTMLListing,
  adapterType: 'ibbi-public-announcement',
  baseUrl: 'https://ibbi.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const traiPressReleasesSource: SourceDefinition = {
  id: 'trai-press-releases',
  name: 'TRAI Telecom Tariff Refund & Overcharge Directives',
  domain: 'trai.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.trai.gov.in',
  feedUrl: 'https://www.trai.gov.in/rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const sebiPublicNoticesSource: SourceDefinition = {
  id: 'sebi-public-notices',
  name: 'SEBI Public Notices & Investor Refund Orders',
  domain: 'sebi.gov.in',
  sourceType: SourceType.HTMLListing,
  adapterType: 'sebi-public-notices',
  baseUrl: 'https://www.sebi.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const initialSources: SourceDefinition[] = [
  pibRssSource,
  sebiRssSource,
  rbiRssSource,
  rbiNotificationsRssSource,
  ibbiAnnouncementsSource,
  sebiPublicNoticesSource,
  traiPressReleasesSource,
];

export interface PublicSourceFamily {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  category: string;
  description: string;
  scope: string;
  activeSourceIds: string[];
}

export const publicSourceFamilies: PublicSourceFamily[] = [
  {
    id: 'sebi',
    name: 'Securities and Exchange Board of India',
    shortName: 'SEBI',
    domain: 'sebi.gov.in',
    category: 'Securities & Market Regulation',
    description: 'Investor compensation schemes, refund orders, and recovery distributions.',
    scope: 'Securities notices & refund orders',
    activeSourceIds: ['sebi-rss', 'sebi-public-notices'],
  },
  {
    id: 'rbi',
    name: 'Reserve Bank of India',
    shortName: 'RBI',
    domain: 'rbi.org.in',
    category: 'Banking & Financial Depository',
    description: 'Banking directives, ombudsman resolutions, and depositor protection guidelines.',
    scope: 'Banking & ombudsman directives',
    activeSourceIds: ['rbi-rss', 'rbi-notifications-rss'],
  },
  {
    id: 'ibbi',
    name: 'Insolvency and Bankruptcy Board of India',
    shortName: 'IBBI',
    domain: 'ibbi.gov.in',
    category: 'Insolvency & Corporate Resolution',
    description: 'Corporate insolvency resolution announcements and creditor claim filing notices.',
    scope: 'Insolvency creditor claim notices',
    activeSourceIds: ['ibbi-public-announcements'],
  },
  {
    id: 'pib',
    name: 'Press Information Bureau',
    shortName: 'PIB',
    domain: 'pib.gov.in',
    category: 'Government Press Releases',
    description:
      'Central government compensation packages, press announcements, and ministry notifications.',
    scope: 'Government compensation press releases',
    activeSourceIds: ['pib-rss'],
  },
  {
    id: 'trai',
    name: 'Telecom Regulatory Authority of India',
    shortName: 'TRAI',
    domain: 'trai.gov.in',
    category: 'Consumer & Telecom Regulation',
    description: 'Telecom tariff directives, overcharge refunds, and consumer protection notices.',
    scope: 'Telecom refund & consumer directives',
    activeSourceIds: ['trai-press-releases'],
  },
];

export const getActivePublicSourceIds = (): string[] =>
  publicSourceFamilies.flatMap((f) => f.activeSourceIds);
