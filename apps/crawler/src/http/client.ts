import { request, Agent } from 'undici';
import { validateUrl, resolveAndValidate, isPrivateIp } from './ssrf.js';
import { lookup as dnsLookup } from 'node:dns';
import type { LookupAddress } from 'node:dns';
import { RateLimiter } from './rate-limiter.js';
import { getConditionalHeaders, setCacheEntry } from './cache.js';
import { sha256 } from './hash.js';
import { retry } from './retry.js';
import { FetchError } from './types.js';
import type { FetchRequest, FetchResult, RateLimitConfig } from './types.js';

const DEFAULT_MAX_REDIRECTS = 2;
const DEFAULT_MAX_BODY_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Safe undici Agent that validates the resolved IP at connection time,
 * preventing DNS rebinding (TOCTOU) attacks.
 */
const safeAgent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dnsLookup(
        hostname,
        options,
        (err: Error | null, address: string | LookupAddress[], family?: number) => {
          if (err) {
            callback(err, address as string, family as number);
            return;
          }
          const addresses = Array.isArray(address)
            ? address.map((a) => a.address)
            : [address as string];
          for (const ip of addresses) {
            if (ip && isPrivateIp(ip)) {
              callback(
                new Error(`SSRF blocked: ${hostname} resolves to private IP ${ip}`),
                address as string,
                family as number,
              );
              return;
            }
          }
          callback(null, address as string, family as number);
        },
      );
    },
  },
});

export class HttpClient {
  private readonly userAgent: string;
  private readonly contactEmail: string | undefined;
  private readonly defaultTimeoutMs: number;
  private readonly rateLimiter = new RateLimiter();

  constructor(options: { userAgent: string; contactEmail?: string; defaultTimeoutMs: number }) {
    this.userAgent = options.userAgent;
    this.contactEmail = options.contactEmail;
    this.defaultTimeoutMs = options.defaultTimeoutMs;
  }

  async fetch(req: FetchRequest, rateLimitConfig?: RateLimitConfig): Promise<FetchResult> {
    const startTime = Date.now();
    const url = req.url;

    // 1. Validate URL (protocol, hostname format)
    const urlCheck = validateUrl(url);
    if (!urlCheck.safe) {
      throw new FetchError(urlCheck.reason ?? 'URL validation failed', 'ssrf_blocked', url);
    }

    // 2. Resolve and validate hostname (DNS check for private IPs)
    const parsed = new URL(url);
    try {
      await resolveAndValidate(parsed.hostname);
    } catch (err) {
      throw new FetchError(
        err instanceof Error ? err.message : 'SSRF validation failed',
        'ssrf_blocked',
        url,
      );
    }

    // 3. Acquire rate limit slot
    if (rateLimitConfig) {
      try {
        await this.rateLimiter.acquire(parsed.hostname, rateLimitConfig);
      } catch (err) {
        throw new FetchError(
          err instanceof Error ? err.message : 'Rate limit exceeded',
          'rate_limited',
          url,
        );
      }
    }

    // 4. Check cache for conditional headers
    const conditionalHeaders = getConditionalHeaders(url);

    // 5. Build request headers
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      ...(this.contactEmail ? { Contact: `mailto:${this.contactEmail}` } : {}),
      ...conditionalHeaders,
      ...(req.headers ?? {}),
    };

    // 6. Execute request with retry
    const timeoutMs = req.timeoutMs ?? this.defaultTimeoutMs;

    try {
      const result = await retry(
        () => this.executeRequest(url, req.method ?? 'GET', headers, timeoutMs, req.maxRedirects),
        {
          maxRetries: 2,
          baseDelay: 1000,
          shouldRetry: (error) => {
            if (error instanceof FetchError) {
              return error.category === 'network_error' || error.category === 'timeout';
            }
            return true;
          },
        },
      );

      // 7. Validate MIME type
      const contentType = result.contentType;
      if (req.allowedMimeTypes && req.allowedMimeTypes.length > 0 && contentType) {
        const mimeType = contentType.split(';')[0]?.trim().toLowerCase();
        if (mimeType && !req.allowedMimeTypes.includes(mimeType)) {
          throw new FetchError(
            `MIME type ${mimeType} not in allowed list: ${req.allowedMimeTypes.join(', ')}`,
            'mime_rejected',
            url,
          );
        }
      }

      // 8. Check body size
      const maxBody = req.maxBodySize ?? DEFAULT_MAX_BODY_SIZE;
      if (result.body.length > maxBody) {
        throw new FetchError(
          `Body size ${result.body.length} exceeds max ${maxBody}`,
          'size_exceeded',
          url,
        );
      }

      // 9. Update cache entry
      if (result.etag || result.lastModified) {
        setCacheEntry(url, {
          etag: result.etag,
          lastModified: result.lastModified,
          contentHash: result.contentHash,
          checkedAt: new Date(),
        });
      }

      return {
        ...result,
        durationMs: Date.now() - startTime,
      };
    } catch (err) {
      if (err instanceof FetchError) {
        throw err;
      }
      // Classify timeout errors
      if (err instanceof Error && err.message.includes('timeout')) {
        throw new FetchError(err.message, 'timeout', url);
      }
      throw new FetchError(
        err instanceof Error ? err.message : 'Unknown network error',
        'network_error',
        url,
      );
    }
  }

  private async executeRequest(
    url: string,
    method: 'GET' | 'HEAD',
    headers: Record<string, string>,
    timeoutMs: number,
    maxRedirects?: number,
  ): Promise<Omit<FetchResult, 'durationMs'>> {
    const maxHops = maxRedirects ?? DEFAULT_MAX_REDIRECTS;
    let currentUrl = url;

    for (let hop = 0; hop <= maxHops; hop++) {
      const response = await request(currentUrl, {
        method,
        headers,
        headersTimeout: timeoutMs,
        bodyTimeout: timeoutMs,
        maxRedirections: 0,
        dispatcher: safeAgent,
      } as Parameters<typeof request>[1]);

      const { statusCode, headers: resHeaders, body } = response;

      // Normalize headers to Record<string, string>
      const normalizedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(resHeaders)) {
        if (value !== undefined) {
          normalizedHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
        }
      }

      const contentType = normalizedHeaders['content-type'] ?? null;
      const etag = normalizedHeaders['etag'] ?? null;
      const lastModified = normalizedHeaders['last-modified'] ?? null;

      // Handle 304 Not Modified
      if (statusCode === 304) {
        // Consume body to free resources
        await body.dump();
        return {
          url: currentUrl,
          statusCode,
          headers: normalizedHeaders,
          body: Buffer.alloc(0),
          contentType,
          etag,
          lastModified,
          contentHash: sha256(Buffer.alloc(0)),
          wasCached: true,
        };
      }

      // Handle redirects (301, 302, 303, 307, 308)
      if (statusCode >= 300 && statusCode < 400 && normalizedHeaders['location']) {
        // Consume body to free resources
        await body.dump();

        if (hop >= maxHops) {
          throw new FetchError(`Too many redirects (max ${maxHops})`, 'network_error', currentUrl);
        }

        const location = normalizedHeaders['location'];
        // Resolve relative redirect URLs
        let redirectUrl: string;
        try {
          redirectUrl = new URL(location, currentUrl).href;
        } catch {
          throw new FetchError(
            `Invalid redirect location: ${location}`,
            'network_error',
            currentUrl,
          );
        }

        // Validate redirect target through SSRF checks
        const redirectCheck = validateUrl(redirectUrl);
        if (!redirectCheck.safe) {
          throw new FetchError(
            `Redirect blocked by SSRF: ${redirectCheck.reason}`,
            'ssrf_blocked',
            redirectUrl,
          );
        }

        const redirectParsed = new URL(redirectUrl);
        try {
          await resolveAndValidate(redirectParsed.hostname);
        } catch (err) {
          throw new FetchError(
            `Redirect blocked: ${err instanceof Error ? err.message : 'SSRF validation failed'}`,
            'ssrf_blocked',
            redirectUrl,
          );
        }

        currentUrl = redirectUrl;
        continue;
      }

      // Handle HTTP errors (4xx, 5xx)
      if (statusCode >= 400) {
        await body.dump();
        throw new FetchError(
          `HTTP ${statusCode} error for ${currentUrl}`,
          'http_error',
          currentUrl,
          statusCode,
        );
      }

      // Read body
      const bodyBuffer = Buffer.from(await body.arrayBuffer());
      const contentHash = sha256(bodyBuffer);

      return {
        url: currentUrl,
        statusCode,
        headers: normalizedHeaders,
        body: bodyBuffer,
        contentType,
        etag,
        lastModified,
        contentHash,
        wasCached: false,
      };
    }

    throw new FetchError(`Too many redirects (max ${maxHops})`, 'network_error', url);
  }
}
