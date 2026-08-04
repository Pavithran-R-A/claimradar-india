import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../../src/http/hash.js';
import { matchByUrl } from '../../src/deduplication/strategies.js';
import { discoverFromFeedXml, parseFeedTitle } from './live-helpers.js';
import type { DiscoveredDocument } from '../../src/adapters/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '..', 'fixtures', 'live', 'generic');
const rss2Path = resolve(fixtureDir, 'rss2.xml');
const rss2Xml = readFileSync(rss2Path, 'utf-8');
const atomXml = readFileSync(resolve(fixtureDir, 'atom.xml'), 'utf-8');

describe('Generic RSS adapter fixture regression', () => {
  describe('standard RSS 2.0 feed', () => {
    let documents: DiscoveredDocument[] = [];

    beforeAll(async () => {
      documents = await discoverFromFeedXml(rss2Xml);
    });

    it('should report the channel title', async () => {
      await expect(parseFeedTitle(rss2Xml)).resolves.toBe('Consumer Affairs Updates');
    });

    it('should discover all 3 items', () => {
      expect(documents).toHaveLength(3);
    });

    it('should extract titles and valid absolute URLs', () => {
      expect(documents[0]!.title).toBe('Regulator orders refund for cancelled service plans');
      expect(documents[2]!.title).toBe('Compensation window opens for delayed deliveries');
      for (const doc of documents) {
        expect(new URL(doc.url).hostname).toBe('consumeraffairs.example.gov.in');
      }
    });

    it('should normalize RFC-822 GMT pubDates to ISO 8601', () => {
      expect(documents[0]!.publishedAt).toBe('2026-07-20T10:00:00.000Z');
      expect(documents[1]!.publishedAt).toBe('2026-07-19T08:30:00.000Z');
      expect(documents[2]!.publishedAt).toBe('2026-07-18T14:45:00.000Z');
    });

    it('should map non-permalink guids to sourceIdentifier', () => {
      expect(documents[0]!.sourceIdentifier).toBe('GEN-2026-0001');
      expect(documents[1]!.sourceIdentifier).toBe('GEN-2026-0002');
    });

    it('should strip embedded HTML from descriptions', () => {
      expect(documents[0]!.description).toContain('refund');
      expect(documents[0]!.description).not.toContain('<b>');
      expect(documents[0]!.description).not.toContain('<p>');
    });

    it('should not flag distinct items as duplicates', () => {
      const existing = [{ id: 'doc-gen-1', canonical_url: documents[0]!.url }];
      const result = matchByUrl(documents[1]!.url, existing);
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('standard Atom 1.0 feed', () => {
    let documents: DiscoveredDocument[] = [];

    beforeAll(async () => {
      documents = await discoverFromFeedXml(atomXml);
    });

    it('should report the feed title', async () => {
      await expect(parseFeedTitle(atomXml)).resolves.toBe('Public Notices Atom Feed');
    });

    it('should discover both entries with link hrefs resolved', () => {
      expect(documents).toHaveLength(2);
      expect(documents[0]!.url).toBe('https://notices.example.gov.in/notices/penalty-billing-2026');
      expect(documents[1]!.url).toBe('https://notices.example.gov.in/notices/annual-report-2026');
    });

    it('should extract entry titles and summaries', () => {
      expect(documents[0]!.title).toBe(
        'Penalty notice issued to service provider for billing violations',
      );
      expect(documents[0]!.description).toContain('systematic overbilling');
    });

    it('should normalize atom <updated> timestamps to ISO 8601', () => {
      expect(documents[0]!.publishedAt).toBe('2026-07-20T10:00:00.000Z');
      expect(documents[1]!.publishedAt).toBe('2026-07-18T16:20:00.000Z');
    });
  });

  describe('content hashing', () => {
    it('should generate a stable SHA-256 for identical feed content', () => {
      const again = readFileSync(rss2Path, 'utf-8');
      expect(sha256(rss2Xml)).toBe(sha256(again));
      expect(sha256(rss2Xml)).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different hashes for different feeds', () => {
      expect(sha256(rss2Xml)).not.toBe(sha256(atomXml));
    });
  });
});
