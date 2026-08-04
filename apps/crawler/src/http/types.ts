export interface FetchRequest {
  url: string;
  method?: 'GET' | 'HEAD';
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRedirects?: number;
  allowedMimeTypes?: string[];
  maxBodySize?: number;
}

export interface FetchResult {
  url: string;
  statusCode: number;
  headers: Record<string, string>;
  body: Buffer;
  contentType: string | null;
  etag: string | null;
  lastModified: string | null;
  contentHash: string;
  durationMs: number;
  wasCached: boolean;
}

export interface CacheEntry {
  etag: string | null;
  lastModified: string | null;
  contentHash: string;
  checkedAt: Date;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
}

export type FetchErrorCategory =
  | 'timeout'
  | 'ssrf_blocked'
  | 'rate_limited'
  | 'mime_rejected'
  | 'size_exceeded'
  | 'network_error'
  | 'http_error';

export class FetchError extends Error {
  public readonly category: FetchErrorCategory;
  public readonly statusCode: number | undefined;
  public readonly url: string;

  constructor(message: string, category: FetchErrorCategory, url: string, statusCode?: number) {
    super(message);
    this.name = 'FetchError';
    this.category = category;
    this.url = url;
    this.statusCode = statusCode;
  }
}
