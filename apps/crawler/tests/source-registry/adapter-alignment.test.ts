import { describe, expect, it } from 'vitest';
import {
  ibbiAnnouncementsSource,
  initialSources,
  pibRssSource,
  rbiNotificationsRssSource,
  rbiRssSource,
  sebiPublicNoticesSource,
  sebiRssSource,
  traiPressReleasesSource,
} from '@claimradar/source-registry';

describe('source registry adapter alignment', () => {
  it('uses adapter names supported by the crawler registry', () => {
    expect(pibRssSource.adapterType).toBe('rss-pib');
    expect(sebiRssSource.adapterType).toBe('rss-sebi');
    expect(rbiRssSource.adapterType).toBe('rss-rbi');
    expect(rbiNotificationsRssSource.adapterType).toBe('rss-rbi');
    expect(traiPressReleasesSource.adapterType).toBe('rss-generic');
    expect(ibbiAnnouncementsSource.adapterType).toBe('ibbi-public-announcement');
    expect(sebiPublicNoticesSource.adapterType).toBe('sebi-public-notices');
    expect(initialSources.every((source) => source.adapterType !== 'pib-rss')).toBe(true);
  });
});
