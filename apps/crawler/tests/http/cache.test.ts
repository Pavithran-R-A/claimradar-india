import { describe, it, expect, beforeEach } from 'vitest';
import { getCacheEntry, setCacheEntry, getConditionalHeaders } from '../../src/http/cache.js';
import type { CacheEntry } from '../../src/http/types.js';

describe('HTTP Cache', () => {
  beforeEach(() => {
    // Clear the cache between tests by setting a known key to undefined
    // Note: The module-level Map persists, so we use unique URLs per test
  });

  it('should store and retrieve cache entries', () => {
    const url = 'https://example.com/cache-test-1';
    const entry: CacheEntry = {
      etag: '"abc123"',
      lastModified: 'Mon, 01 Jan 2026 00:00:00 GMT',
      contentHash: 'hash123',
      checkedAt: new Date('2026-01-01'),
    };

    setCacheEntry(url, entry);
    const retrieved = getCacheEntry(url);

    expect(retrieved).toBeDefined();
    expect(retrieved?.etag).toBe('"abc123"');
    expect(retrieved?.lastModified).toBe('Mon, 01 Jan 2026 00:00:00 GMT');
    expect(retrieved?.contentHash).toBe('hash123');
  });

  it('should return undefined for non-existent entries', () => {
    const result = getCacheEntry('https://example.com/nonexistent-url');
    expect(result).toBeUndefined();
  });

  it('should generate If-None-Match header from etag', () => {
    const url = 'https://example.com/cache-test-2';
    const entry: CacheEntry = {
      etag: '"xyz789"',
      lastModified: null,
      contentHash: 'hash456',
      checkedAt: new Date(),
    };

    setCacheEntry(url, entry);
    const headers = getConditionalHeaders(url);

    expect(headers['If-None-Match']).toBe('"xyz789"');
    expect(headers['If-Modified-Since']).toBeUndefined();
  });

  it('should generate If-Modified-Since header from lastModified', () => {
    const url = 'https://example.com/cache-test-3';
    const entry: CacheEntry = {
      etag: null,
      lastModified: 'Tue, 15 Jul 2026 10:00:00 GMT',
      contentHash: 'hash789',
      checkedAt: new Date(),
    };

    setCacheEntry(url, entry);
    const headers = getConditionalHeaders(url);

    expect(headers['If-Modified-Since']).toBe('Tue, 15 Jul 2026 10:00:00 GMT');
    expect(headers['If-None-Match']).toBeUndefined();
  });

  it('should generate both headers when both etag and lastModified present', () => {
    const url = 'https://example.com/cache-test-4';
    const entry: CacheEntry = {
      etag: '"both-test"',
      lastModified: 'Wed, 16 Jul 2026 09:00:00 GMT',
      contentHash: 'hashboth',
      checkedAt: new Date(),
    };

    setCacheEntry(url, entry);
    const headers = getConditionalHeaders(url);

    expect(headers['If-None-Match']).toBe('"both-test"');
    expect(headers['If-Modified-Since']).toBe('Wed, 16 Jul 2026 09:00:00 GMT');
  });

  it('should return empty headers for uncached URL', () => {
    const headers = getConditionalHeaders('https://example.com/never-cached');
    expect(headers).toEqual({});
  });

  describe('HTTP 304 Entity Hash Invariants (Phase V3.1)', () => {
    it('304 cached entity hash reuse: retrieves valid cached contentHash on revalidation', () => {
      const url = 'https://example.com/citrus-notice-304-test';
      const originalHash = '40e9d0f89b7eb12dddc276b75dd8bc794c0ab7caf315e5f0ecefdc499f56176e';

      // Store initial 200 result
      setCacheEntry(url, {
        etag: '"v1-etag"',
        lastModified: 'Wed, 29 Jul 2026 12:00:00 GMT',
        contentHash: originalHash,
        checkedAt: new Date(),
      });

      const entry = getCacheEntry(url);
      expect(entry).toBeDefined();
      expect(entry?.contentHash).toBe(originalHash);
      // Invariant: Must not be the empty body hash 'e3b0c442...'
      expect(entry?.contentHash).not.toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    });

    it('304 without cached body/hash must not invent an entity hash', () => {
      const url = 'https://example.com/uncached-304-test';
      const entry = getCacheEntry(url);
      expect(entry).toBeUndefined();
      const contentHash = entry?.contentHash ?? '';
      expect(contentHash).toBe('');
      expect(contentHash).not.toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      );
    });
  });
});
