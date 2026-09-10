import { request, Agent } from 'undici';
import { validateUrl, resolveAndValidate, isPrivateIp } from './ssrf.js';
import { lookup as dnsLookup } from 'node:dns';
import type { LookupAddress } from 'node:dns';
import { RateLimiter } from './rate-limiter.js';
import { getConditionalHeaders, setCacheEntry, getCacheEntry } from './cache.js';
import { sha256 } from './hash.js';
import { retry } from './retry.js';
import { FetchError } from './types.js';
import type { CloudflareRelayConfig, FetchRequest, FetchResult, RateLimitConfig } from './types.js';
import { buildRelayUrl, createRelaySignature, getTraiRelayTarget } from './cloudflare-relay.js';
import { randomUUID } from 'node:crypto';

const DEFAULT_MAX_REDIRECTS = 2;
const DEFAULT_MAX_BODY_SIZE = 50 * 1024 * 1024; // 50 MB
const DEFAULT_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_HTTP_MAX_RETRIES = 3;
const MAX_HTTP_MAX_RETRIES = 4;
const DEFAULT_RETRY_BASE_DELAY_MS = 1_000;
const DEFAULT_RETRY_MAX_DELAY_MS = 5_000;

type RequestOptions = Parameters<typeof request>[1];

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: {
    dump(): Promise<void>;
    arrayBuffer(): Promise<ArrayBuffer>;
  };
}

export type RequestExecutor = (url: string, options: RequestOptions) => Promise<HttpResponse>;

/**
 * Safe undici Agent that validates the resolved IP at connection time,
 * preventing DNS rebinding (TOCTOU) attacks.
 */
const safeAgent = new Agent({
  connect: {
    // Undici's default connect timeout is 10s. Official government hosts can
    // take longer to establish a connection from hosted runners.
    timeout: DEFAULT_CONNECT_TIMEOUT_MS,
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

export function isRetryableFetchError(error: unknown): boolean {
  return (
    error instanceof FetchError &&
    (error.category === 'network_error' || error.category === 'timeout')
  );
}

export class HttpClient {
  private readonly userAgent: string;
  private readonly contactEmail: string | undefined;
  private readonly defaultTimeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly retryMaxDelayMs: number;
  private readonly relay: CloudflareRelayConfig | undefined;
  private readonly requestExecutor: RequestExecutor;
  private readonly rateLimiter = new RateLimiter();

  constructor(options: {
    userAgent: string;
    contactEmail?: string;
    defaultTimeoutMs: number;
    maxRetries?: number;
    retryBaseDelayMs?: number;
    retryMaxDelayMs?: number;
    relay?: CloudflareRelayConfig;
    requestExecutor?: RequestExecutor;
  }) {
    this.userAgent = options.userAgent;
    this.contactEmail = options.contactEmail;
    this.defaultTimeoutMs = options.defaultTimeoutMs;
    this.maxRetries = Math.min(
      MAX_HTTP_MAX_RETRIES,
      Math.max(0, Math.floor(options.maxRetries ?? DEFAULT_HTTP_MAX_RETRIES)),
    );
    this.retryBaseDelayMs = Math.max(0, options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS);
    this.retryMaxDelayMs = Math.max(
      this.retryBaseDelayMs,
      options.retryMaxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS,
    );
    this.relay = options.relay;
    this.requestExecutor = options.requestExecutor ?? (request as unknown as RequestExecutor);
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
    const relayTarget = this.relay ? getTraiRelayTarget(url) : null;
    try {
      await resolveAndValidate(parsed.hostname);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SSRF validation failed';
      const dnsResolutionFailure = message.includes('unable to resolve');
      if (!relayTarget || !dnsResolutionFailure) {
        throw new FetchError(message, 'ssrf_blocked', url);
      }
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
      let result;
      try {
        result = await retry(
          () =>
            this.executeDirectRequest(
              url,
              req.method ?? 'GET',
              headers,
              timeoutMs,
              req.maxRedirects,
            ),
          this.retryOptions(),
        );
      } catch (directError) {
        const directFailure = this.classifyRequestError(directError, url);
        const targetPath = this.relay ? getTraiRelayTarget(url) : null;
        if (!this.relay || !targetPath || !isRetryableFetchError(directFailure)) {
          throw directFailure;
        }

        result = await retry(
          () =>
            this.executeRelayRequestSafe(url, req.method ?? 'GET', headers, timeoutMs, targetPath),
          this.retryOptions(),
        );
      }

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
        if (result.statusCode === 200 && result.contentHash) {
          setCacheEntry(url, {
            etag: result.etag,
            lastModified: result.lastModified,
            contentHash: result.contentHash,
            checkedAt: new Date(),
          });
        } else if (result.statusCode === 304) {
          const existing = getCacheEntry(url);
          if (existing) {
            setCacheEntry(url, {
              ...existing,
              etag: result.etag ?? existing.etag,
              lastModified: result.lastModified ?? existing.lastModified,
              checkedAt: new Date(),
            });
          }
        }
      }

      return {
        ...result,
        durationMs: Date.now() - startTime,
      };
    } catch (err) {
      throw this.classifyRequestError(err, url);
    }
  }

  private retryOptions() {
    return {
      maxRetries: this.maxRetries,
      baseDelay: this.retryBaseDelayMs,
      maxDelay: this.retryMaxDelayMs,
      shouldRetry: isRetryableFetchError,
    };
  }

  private classifyRequestError(error: unknown, url: string): FetchError {
    if (error instanceof FetchError) return error;

    const message = error instanceof Error ? error.message : 'Unknown network error';
    const normalized = message.toLowerCase();
    const category = /timeout|timed out|etimedout|headers_timeout|body_timeout/.test(normalized)
      ? 'timeout'
      : 'network_error';
    return new FetchError(message, category, url);
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
      const response = await this.requestExecutor(currentUrl, {
        method,
        headers,
        headersTimeout: timeoutMs,
        bodyTimeout: timeoutMs,
        maxRedirections: 0,
        dispatcher: safeAgent,
      } as Parameters<typeof request>[1]);

      const { statusCode, headers: resHeaders, body } = response;

      const normalizedHeaders = this.normalizeHeaders(resHeaders);

      const contentType = normalizedHeaders['content-type'] ?? null;
      const etag = normalizedHeaders['etag'] ?? null;
      const lastModified = normalizedHeaders['last-modified'] ?? null;

      // Handle 304 Not Modified
      if (statusCode === 304) {
        // Consume body to free resources
        await body.dump();
        const cached = getCacheEntry(currentUrl);
        return {
          url: currentUrl,
          statusCode,
          headers: normalizedHeaders,
          body: Buffer.alloc(0),
          contentType,
          etag: etag ?? cached?.etag ?? null,
          lastModified: lastModified ?? cached?.lastModified ?? null,
          contentHash: cached?.contentHash ?? '',
          wasCached: true,
          transport: 'DIRECT',
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
        transport: 'DIRECT',
      };
    }

    throw new FetchError(`Too many redirects (max ${maxHops})`, 'network_error', url);
  }

  private async executeDirectRequest(
    url: string,
    method: 'GET' | 'HEAD',
    headers: Record<string, string>,
    timeoutMs: number,
    maxRedirects?: number,
  ): Promise<Omit<FetchResult, 'durationMs'>> {
    try {
      return await this.executeRequest(url, method, headers, timeoutMs, maxRedirects);
    } catch (error) {
      throw this.classifyRequestError(error, url);
    }
  }

  private async executeRelayRequest(
    originalUrl: string,
    method: 'GET' | 'HEAD',
    headers: Record<string, string>,
    timeoutMs: number,
    targetPath: string,
  ): Promise<Omit<FetchResult, 'durationMs'>> {
    if (!this.relay) {
      throw new FetchError('Relay is not configured', 'network_error', originalUrl);
    }

    const relayEndpoint = new URL(this.relay.endpoint);
    if (relayEndpoint.protocol !== 'https:') {
      throw new FetchError('Relay endpoint must use HTTPS', 'network_error', originalUrl);
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomUUID();
    const relayUrl = buildRelayUrl(this.relay.endpoint, targetPath);
    const relayHeaders = {
      ...headers,
      'X-ClaimRadar-Original-URL': originalUrl,
      'X-ClaimRadar-Timestamp': timestamp,
      'X-ClaimRadar-Nonce': nonce,
      'X-ClaimRadar-Signature': createRelaySignature(
        timestamp,
        nonce,
        method,
        targetPath,
        this.relay.sharedSecret,
      ),
    };

    const response = await this.requestExecutor(relayUrl, {
      method,
      headers: relayHeaders,
      headersTimeout: this.relay.timeoutMs ?? timeoutMs,
      bodyTimeout: this.relay.timeoutMs ?? timeoutMs,
      maxRedirections: 0,
      dispatcher: safeAgent,
    } as RequestOptions);

    const normalizedHeaders = this.normalizeHeaders(response.headers);
    const relayError = normalizedHeaders['x-claimradar-relay-error'];
    if (relayError) {
      await response.body.dump();
      const category =
        relayError === 'TIMEOUT'
          ? 'timeout'
          : relayError === 'DNS_ERROR' || relayError === 'NETWORK_ERROR'
            ? 'network_error'
            : 'network_error';
      throw new FetchError(`Cloudflare relay ${relayError}`, category, originalUrl);
    }

    if (response.statusCode >= 400) {
      await response.body.dump();
      throw new FetchError(
        `HTTP ${response.statusCode} error for ${originalUrl}`,
        'http_error',
        originalUrl,
        response.statusCode,
      );
    }

    if (response.statusCode >= 300) {
      await response.body.dump();
      throw new FetchError('Unexpected relay redirect', 'network_error', originalUrl);
    }

    const body = Buffer.from(await response.body.arrayBuffer());
    return {
      url: originalUrl,
      statusCode: response.statusCode,
      headers: normalizedHeaders,
      body,
      contentType: normalizedHeaders['content-type'] ?? null,
      etag: normalizedHeaders['etag'] ?? null,
      lastModified: normalizedHeaders['last-modified'] ?? null,
      contentHash: sha256(body),
      wasCached: false,
      transport: 'CLOUDFLARE_RELAY',
    };
  }

  private async executeRelayRequestSafe(
    originalUrl: string,
    method: 'GET' | 'HEAD',
    headers: Record<string, string>,
    timeoutMs: number,
    targetPath: string,
  ): Promise<Omit<FetchResult, 'durationMs'>> {
    try {
      return await this.executeRelayRequest(originalUrl, method, headers, timeoutMs, targetPath);
    } catch (error) {
      throw this.classifyRequestError(error, originalUrl);
    }
  }

  private normalizeHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined)
        normalized[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
    }
    return normalized;
  }
}
