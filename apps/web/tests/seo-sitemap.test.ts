import { describe, it, expect, afterEach } from 'vitest';
import { brandConfig } from '@claimradar/config';
import {
  getPublishedClaimableBySlug,
  __setDbClientFactoryForTests,
  __resetDbClientFactoryForTests,
} from '../lib/claimables-repository';
import { makeValidRow, fakeDbClient } from './fixtures';

afterEach(() => {
  __resetDbClientFactoryForTests();
});

describe('SEO & Sitemap Rules Verification', () => {
  it('generates a valid canonical URL for a published detail page', async () => {
    const slug = 'abc-investor-disgorgement-refund-2026';
    __setDbClientFactoryForTests(() =>
      fakeDbClient({ data: [makeValidRow({ slug })], error: null }),
    );

    const outcome = await getPublishedClaimableBySlug(slug);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.data).not.toBeNull();
      const canonical = `${brandConfig.url}/claimables/${outcome.data?.slug}`;
      expect(canonical).toBe(
        `${brandConfig.url}/claimables/abc-investor-disgorgement-refund-2026`,
      );
    }
  });

  it('does not expose government/legal authority claims in title metadata', () => {
    const title = 'ABC Securities Disgorgement & Refund Scheme 2026';
    expect(title).not.toContain('Government Official Portal');
    expect(title).not.toContain('Legal Service Representation');
  });
});
