import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractHtmlContent } from '../../src/extraction/html.js';
import { sha256 } from '../../src/http/hash.js';
import { matchByUrl, normalizeUrl } from '../../src/deduplication/strategies.js';
import { discoverFromFeedXml } from './live-helpers.js';
import type { DiscoveredDocument } from '../../src/adapters/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '..', 'fixtures', 'live', 'pib');
const feedPath = resolve(fixtureDir, 'feed.xml');
const feedXml = readFileSync(feedPath, 'utf-8');
const detailHtml = readFileSync(resolve(fixtureDir, 'detail.html'), 'utf-8');

describe('PIB live fixture regression', () => {
  let documents: DiscoveredDocument[] = [];

  beforeAll(async () => {
    documents = await discoverFromFeedXml(feedXml);
  });

  describe('feed parsing', () => {
    it('should discover all 5 fixture items', () => {
      expect(documents).toHaveLength(5);
    });

    it('should extract trimmed titles (real feed has a leading space)', () => {
      expect(documents[0]!.title).toBe(
        'Progress of area coverage under Kharif crops as on 24.07.2026',
      );
      expect(documents[1]!.title).toBe('PM-Vidyalaxmi Portal for Higher Education Loans');
    });

    it('should extract a valid absolute pib.gov.in URL for every item', () => {
      for (const doc of documents) {
        const url = new URL(doc.url);
        expect(url.hostname).toBe('pib.gov.in');
        expect(url.searchParams.get('PRID')).toMatch(/^\d+$/);
      }
    });

    it('should leave publishedAt undefined when items carry no pubDate (real PIB quirk)', () => {
      // The live PIB feed publishes items without pubDate or guid.
      for (const doc of documents) {
        expect(doc.publishedAt).toBeUndefined();
      }
    });
  });

  describe('duplicate link handling', () => {
    it('should keep the synthesized duplicate link intact in discovery output', () => {
      expect(documents[4]!.url).toBe(documents[0]!.url);
      expect(normalizeUrl(documents[4]!.url)).toBe(normalizeUrl(documents[0]!.url));
    });

    it('should flag the duplicate via canonical URL matching', () => {
      const existing = [{ id: 'doc-1', canonical_url: documents[0]!.url }];
      const result = matchByUrl(documents[4]!.url, existing);
      expect(result.isDuplicate).toBe(true);
      expect(result.existingId).toBe('doc-1');
    });
  });

  describe('content hashing', () => {
    it('should generate a stable SHA-256 for identical feed content', () => {
      const again = readFileSync(feedPath, 'utf-8');
      expect(sha256(feedXml)).toBe(sha256(again));
      expect(sha256(feedXml)).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate a different hash when content changes', () => {
      expect(sha256(feedXml)).not.toBe(sha256(feedXml + ' '));
    });
  });

  describe('detail page extraction', () => {
    it('should extract the release content and timestamp text', () => {
      const result = extractHtmlContent(detailHtml, documents[0]!.url);
      expect(result.text).toContain('Progress of area coverage under Kharif crops');
      expect(result.text).toContain('Posted On: 27 JUL 2026 9:06PM by PIB Delhi');
    });

    it('should surface the og:title metadata for the release', () => {
      const result = extractHtmlContent(detailHtml, documents[0]!.url);
      expect(result.metadata['ogTitle']).toBe(
        'Progress of area coverage under Kharif crops as on 24.07.2026',
      );
    });
  });
});
