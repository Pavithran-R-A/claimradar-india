import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { extractHtmlContent } from '../../src/extraction/html.js';
import { sha256 } from '../../src/http/hash.js';
import { matchByUrl } from '../../src/deduplication/strategies.js';
import { discoverFromFeedXml, parseFeedTitle } from './live-helpers.js';
import type { DiscoveredDocument } from '../../src/adapters/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '..', 'fixtures', 'live', 'rbi');
const feedPath = resolve(fixtureDir, 'feed.xml');
const feedXml = readFileSync(feedPath, 'utf-8');
const detailHtml = readFileSync(resolve(fixtureDir, 'detail.html'), 'utf-8');
const pdfPath = resolve(fixtureDir, 'press.pdf');

describe('RBI live fixture regression', () => {
  let documents: DiscoveredDocument[] = [];

  beforeAll(async () => {
    documents = await discoverFromFeedXml(feedXml);
  });

  describe('feed parsing', () => {
    it('should report the live channel title', async () => {
      await expect(parseFeedTitle(feedXml)).resolves.toBe('PRESS RELEASES FROM RBI');
    });

    it('should discover all 6 fixture items', () => {
      expect(documents).toHaveLength(6);
    });

    it('should extract clean titles from CDATA sections', () => {
      expect(documents[0]!.title).toBe('Auction of Government of India Dated Security');
      expect(documents[2]!.title).toBe(
        'RBI imposes monetary penalty on Raigad District Central Co-operative Bank Ltd., Maharashtra',
      );
      for (const doc of documents) {
        expect(doc.title).not.toContain('CDATA');
      }
    });

    it('should extract valid rbi.org.in press-release URLs', () => {
      for (const doc of documents) {
        const url = new URL(doc.url);
        expect(url.hostname).toBe('www.rbi.org.in');
        expect(url.pathname).toBe('/scripts/BS_PressReleaseDisplay.aspx');
        expect(url.searchParams.get('prid')).toMatch(/^\d+$/);
      }
    });

    it('should strip HTML from CDATA descriptions', () => {
      expect(documents[0]!.description).toContain('34,000 crore');
      expect(documents[0]!.description).not.toContain('<table');
      expect(documents[0]!.description).not.toContain('<p>');
    });
  });

  describe('date handling', () => {
    it('should normalize the timezone-less RBI pubDate to ISO 8601 (no crash)', () => {
      // Real RBI quirk: 'Mon, 27 Jul 2026 18:30:00' has no timezone designator.
      expect(documents[0]!.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(Number.isNaN(new Date(documents[0]!.publishedAt!).getTime())).toBe(false);
    });

    it('should leave malformed dates unknown', () => {
      const malformed = documents[4]!;
      expect(malformed.title).toContain('malformed date');
      expect(malformed.publishedAt).toBeUndefined();
    });
  });

  describe('duplicate link handling', () => {
    it('should keep the synthesized duplicate link intact in discovery output', () => {
      expect(documents[5]!.url).toBe(documents[2]!.url);
    });

    it('should flag the duplicate via canonical URL matching', () => {
      const existing = [{ id: 'doc-rbi-63243', canonical_url: documents[2]!.url }];
      const result = matchByUrl(documents[5]!.url, existing);
      expect(result.isDuplicate).toBe(true);
      expect(result.existingId).toBe('doc-rbi-63243');
    });
  });

  describe('content hashing', () => {
    it('should generate a stable SHA-256 for identical feed content', () => {
      const again = readFileSync(feedPath, 'utf-8');
      expect(sha256(feedXml)).toBe(sha256(again));
      expect(sha256(feedXml)).not.toBe(sha256(feedXml.replace('63243', '63299')));
    });
  });

  describe('detail page extraction', () => {
    it('should extract the penalty text content', () => {
      const result = extractHtmlContent(detailHtml, documents[2]!.url);
      expect(result.text).toContain('monetary penalty of Rs.10.10 lakh');
      expect(result.text).toContain('Date : Jul 27, 2026');
    });

    it('should expose the linked rbidocs press-release PDF (uppercase .PDF)', () => {
      // RBI links press-release PDFs with an uppercase .PDF extension.
      const $ = cheerio.load(detailHtml);
      const pdfLinks: string[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.toLowerCase().endsWith('.pdf')) pdfLinks.push(href);
      });
      expect(pdfLinks).toContain(
        'https://rbidocs.rbi.org.in/rdocs/PressRelease/PDFs/PR76376917CB8E0A04AFF87BF7A0A19B1C3DB.PDF',
      );
    });
  });

  describe('linked PDF fixture', () => {
    it('should be a structurally valid PDF document', () => {
      const buffer = readFileSync(pdfPath);
      expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
      expect(buffer.toString('latin1')).toContain('%%EOF');
      expect(buffer.toString('latin1')).toContain('/Type /Page');
    });

    it('should produce a stable content hash across reads', () => {
      expect(sha256(readFileSync(pdfPath))).toBe(sha256(readFileSync(pdfPath)));
    });
  });
});
