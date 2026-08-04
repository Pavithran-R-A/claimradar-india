import type { CacheEntry } from './types.js';

const cacheStore = new Map<string, CacheEntry>();

export function getCacheEntry(url: string): CacheEntry | undefined {
  return cacheStore.get(url);
}

export function setCacheEntry(url: string, entry: CacheEntry): void {
  cacheStore.set(url, entry);
}

export function getConditionalHeaders(url: string): Record<string, string> {
  const entry = cacheStore.get(url);
  if (!entry) return {};

  const headers: Record<string, string> = {};
  if (entry.etag) {
    headers['If-None-Match'] = entry.etag;
  }
  if (entry.lastModified) {
    headers['If-Modified-Since'] = entry.lastModified;
  }
  return headers;
}
