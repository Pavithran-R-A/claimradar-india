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
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.ibbi.gov.in',
  feedUrl: 'https://www.ibbi.gov.in/rss-feed',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const ncdrcOrdersSource: SourceDefinition = {
  id: 'ncdrc-orders',
  name: 'National Consumer Commission Compensation Judgments',
  domain: 'ncdrc.nic.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://ncdrc.nic.in',
  feedUrl: 'https://ncdrc.nic.in/rss.xml',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const dgcaPassengerRightsSource: SourceDefinition = {
  id: 'dgca-passenger-rights',
  name: 'DGCA Airline Passenger Refund & Compensation Directives',
  domain: 'dgca.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.dgca.gov.in',
  feedUrl: 'https://www.dgca.gov.in/digigov-portal/rss-feed',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 10 },
};

export const mcaCircularsSource: SourceDefinition = {
  id: 'mca-circulars',
  name: 'Ministry of Corporate Affairs Deposit Restitution Notices',
  domain: 'mca.gov.in',
  sourceType: SourceType.RSS,
  adapterType: 'rss',
  baseUrl: 'https://www.mca.gov.in',
  feedUrl: 'https://www.mca.gov.in/content/mca/global/en/rss.xml',
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

export const initialSources: SourceDefinition[] = [
  pibRssSource,
  sebiRssSource,
  rbiRssSource,
  genericRssSource,
  sebiOrdersRssSource,
  rbiNotificationsRssSource,
  irdaiNoticesSource,
  iepfNoticesSource,
  ibbiAnnouncementsSource,
  ncdrcOrdersSource,
  dgcaPassengerRightsSource,
  mcaCircularsSource,
  traiPressReleasesSource,
];

