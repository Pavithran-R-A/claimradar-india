import { describe, it, expect } from 'vitest';
import {
  matchByUrl,
  matchByContentHash,
  matchBySourceIdentifier,
  matchByTitleDate,
  normalizeUrl,
} from '../../src/deduplication/strategies.js';
import { checkDuplicate } from '../../src/deduplication/index.js';

describe('Deduplication Strategies', () => {
  it('keeps identical hashes from different sources as provenance matches', () => {
    const result = checkDuplicate(
      {
        url: 'https://pib.gov.in/release/1',
        contentHash: 'shared-hash',
        sourceId: 'pib-rss',
      },
      [
        {
          id: 'doc-sebi-1',
          source_id: 'sebi-rss',
          canonical_url: 'https://sebi.gov.in/order/1',
          content_hash: 'shared-hash',
          source_identifier: null,
          title: null,
          published_at: null,
        },
      ],
    );

    expect(result.isDuplicate).toBe(true);
    expect(result.crossSourceMatch).toBe(true);
  });

  describe('URL Match with Normalization', () => {
    it('should match URLs with trailing slash difference', () => {
      const result = matchByUrl('https://example.com/news', [
        { id: 'doc-1', canonical_url: 'https://example.com/news/' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should match URLs with www prefix difference', () => {
      const result = matchByUrl('https://www.example.com/page', [
        { id: 'doc-2', canonical_url: 'https://example.com/page' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should match URLs with utm parameters stripped', () => {
      const result = matchByUrl(
        'https://example.com/article?utm_source=twitter&utm_medium=social',
        [{ id: 'doc-3', canonical_url: 'https://example.com/article' }],
      );
      expect(result.isDuplicate).toBe(true);
    });

    it('should not match different paths', () => {
      const result = matchByUrl('https://example.com/page-a', [
        { id: 'doc-4', canonical_url: 'https://example.com/page-b' },
      ]);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should lowercase URLs', () => {
      expect(normalizeUrl('HTTPS://EXAMPLE.COM/Page')).toBe('example.com/page');
    });

    it('should strip fragments', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe('example.com/page');
    });

    it('should strip utm parameters', () => {
      const result = normalizeUrl('https://example.com/article?utm_source=google&id=123');
      expect(result).toContain('id=123');
      expect(result).not.toContain('utm_source');
    });
  });

  describe('Content Hash Match', () => {
    it('should match identical content hashes', () => {
      const result = matchByContentHash('abc123def456', [
        { id: 'doc-1', content_hash: 'abc123def456' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should match case-insensitively', () => {
      const result = matchByContentHash('ABC123DEF456', [
        { id: 'doc-2', content_hash: 'abc123def456' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should not match different hashes', () => {
      const result = matchByContentHash('abc123', [{ id: 'doc-3', content_hash: 'xyz789' }]);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('Source + Identifier Match', () => {
    it('should match same source with same identifier', () => {
      const result = matchBySourceIdentifier('source-1', 'PIB-2000001', [
        { id: 'doc-1', source_id: 'source-1', source_identifier: 'PIB-2000001' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should not match different source with same identifier', () => {
      const result = matchBySourceIdentifier('source-2', 'PIB-2000001', [
        { id: 'doc-2', source_id: 'source-1', source_identifier: 'PIB-2000001' },
      ]);
      expect(result.isDuplicate).toBe(false);
    });

    it('should not match null identifiers', () => {
      const result = matchBySourceIdentifier('source-1', 'PIB-2000001', [
        { id: 'doc-3', source_id: 'source-1', source_identifier: null },
      ]);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('Title + Date Fingerprint Match', () => {
    it('should match same title and same date', () => {
      const result = matchByTitleDate('Consumer Refund Order', '2026-07-15T10:00:00Z', [
        { id: 'doc-1', title: 'Consumer Refund Order', published_at: '2026-07-15T12:00:00Z' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should match normalized titles (punctuation stripped)', () => {
      const result = matchByTitleDate('Consumer Refund Order!', '2026-07-15T10:00:00Z', [
        { id: 'doc-2', title: 'Consumer Refund Order', published_at: '2026-07-15T08:00:00Z' },
      ]);
      expect(result.isDuplicate).toBe(true);
    });

    it('should not match same title with different date', () => {
      const result = matchByTitleDate('Consumer Refund Order', '2026-07-15T10:00:00Z', [
        { id: 'doc-3', title: 'Consumer Refund Order', published_at: '2026-08-01T10:00:00Z' },
      ]);
      expect(result.isDuplicate).toBe(false);
    });

    it('should not match different title with same date', () => {
      const result = matchByTitleDate('Refund Order', '2026-07-15T10:00:00Z', [
        { id: 'doc-4', title: 'Compensation Order', published_at: '2026-07-15T10:00:00Z' },
      ]);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('No Match', () => {
    it('should return isDuplicate: false when no match found', () => {
      const urlResult = matchByUrl('https://new.example.com', []);
      expect(urlResult.isDuplicate).toBe(false);

      const hashResult = matchByContentHash('newhash', []);
      expect(hashResult.isDuplicate).toBe(false);

      const srcResult = matchBySourceIdentifier('source-1', 'new-id', []);
      expect(srcResult.isDuplicate).toBe(false);

      const titleResult = matchByTitleDate('New Title', '2026-01-01', []);
      expect(titleResult.isDuplicate).toBe(false);
    });
  });
});
