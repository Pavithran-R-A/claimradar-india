import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractHtmlContent } from '../../src/extraction/html.js';
import { sha256 } from '../../src/http/hash.js';
import { matchByUrl } from '../../src/deduplication/strategies.js';
import { discoverFromFeedXml, parseFeedTitle } from './live-helpers.js';
import type { DiscoveredDocument } from '../../src/adapters/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '..', 'fixtures', 'live', 'sebi');
const feedPath = resolve(fixtureDir, 'feed.xml');
const feedXml = readFileSync(feedPath, 'utf-8');
const detailHtml = readFileSync(resolve(fixtureDir, 'detail.html'), 'utf-8');

describe('SEBI live fixture regression', () => {
  let documents: DiscoveredDocument[] = [];

  beforeAll(async () => {
    documents = await discoverFromFeedXml(feedXml);
  });

  describe('feed parsing', () => {
    it('should report the live channel title', async () => {
      await expect(parseFeedTitle(feedXml)).resolves.toBe('SEBI RSS Feed');
    });

    it('should discover all 6 fixture items', () => {
      expect(documents).toHaveLength(6);
    });

    it('should extract titles and valid sebi.gov.in URLs', () => {
      expect(documents[0]!.title).toContain('front running by Madhav Stock Vision');
      expect(documents[2]!.title).toBe('Order in the matter of Nalwa Sons Investments Limited');
      for (const doc of documents) {
        expect(new URL(doc.url).hostname).toBe('www.sebi.gov.in');
        expect(doc.url).toContain('/enforcement/orders/jul-2026/');
      }
    });
  });

  describe('date handling', () => {
    it("should fall back to the raw string for SEBI's non-RFC-822 pubDate (no crash)", () => {
      // '24 Jul, 2026 +0530' is rejected by Date parsing; normalizeDate keeps the raw value.
      expect(documents[0]!.publishedAt).toBe('24 Jul, 2026 +0530');
      expect(documents[3]!.publishedAt).toBe('22 Jul, 2026 +0530');
    });

    it('should leave publishedAt undefined for the empty-pubDate item', () => {
      const missingDateDoc = documents[4]!;
      expect(missingDateDoc.title).toContain('Hexa Tradex');
      expect(missingDateDoc.publishedAt).toBeUndefined();
    });
  });

  describe('duplicate link handling', () => {
    it('should keep the synthesized duplicate link intact in discovery output', () => {
      expect(documents[5]!.url).toBe(documents[0]!.url);
    });

    it('should flag the duplicate via canonical URL matching', () => {
      const existing = [{ id: 'doc-sebi-1', canonical_url: documents[0]!.url }];
      const result = matchByUrl(documents[5]!.url, existing);
      expect(result.isDuplicate).toBe(true);
      expect(result.existingId).toBe('doc-sebi-1');
    });
  });

  describe('content hashing', () => {
    it('should generate a stable SHA-256 for identical feed content', () => {
      const again = readFileSync(feedPath, 'utf-8');
      expect(sha256(feedXml)).toBe(sha256(again));
      expect(sha256(feedXml)).not.toBe(sha256(feedXml.replace('103046', '103047')));
    });
  });

  describe('detail page extraction', () => {
    it('should extract the order title from h1', () => {
      const result = extractHtmlContent(detailHtml, documents[0]!.url);
      expect(result.title).toContain('Final Order in the matter of front running');
    });

    it('should retain the publication date text', () => {
      const result = extractHtmlContent(detailHtml, documents[0]!.url);
      expect(result.text).toContain('Jul 24, 2026');
    });

    it('should discover the linked order PDF', () => {
      const result = extractHtmlContent(detailHtml, documents[0]!.url);
      expect(result.pdfLinks).toContain(
        'https://www.sebi.gov.in/sebi_data/attachdocs/jul-2026/1784905586189.pdf',
      );
    });
  });
});
