import { describe, it, expect } from 'vitest';
import { getPublishedClaimableBySlug } from '../lib/claimables-repository';

describe('SEO & Sitemap Rules Verification', () => {
  it('should generate valid canonical URL for detail pages', async () => {
    const slug = 'abc-investor-disgorgement-refund-2026';
    const claim = await getPublishedClaimableBySlug(slug);
    expect(claim).not.toBeNull();
    const canonical = `https://claimradar.in/claimables/${claim?.slug}`;
    expect(canonical).toBe(
      'https://claimradar.in/claimables/abc-investor-disgorgement-refund-2026',
    );
  });

  it('should not expose government/legal authority claims in title metadata', () => {
    const title = 'ABC Securities Disgorgement & Refund Scheme 2026';
    expect(title).not.toContain('Government Official Portal');
    expect(title).not.toContain('Legal Service Representation');
  });
});
