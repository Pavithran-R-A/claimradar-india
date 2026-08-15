import { load } from 'cheerio';
import { createHash } from 'node:crypto';
import type { SourceDefinition } from '@claimradar/source-registry';
import type {
  SourceAdapter,
  CrawlContext,
  DiscoveredDocument,
  FetchedDocument,
  SourceHealthResult,
} from '../types.js';
import { extractHtmlContent } from '../../extraction/html.js';
import { HttpClient } from '../../http/client.js';

export class SebiPublicNoticesAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  protected readonly source: SourceDefinition;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
  }

  async discover(context: CrawlContext): Promise<DiscoveredDocument[]> {
    const client = this.createHttpClient(context);
    const listingUrls = [
      'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
    ];

    const documents: DiscoveredDocument[] = [];
    const seenUrls = new Set<string>();

    for (const listingUrl of listingUrls) {
      try {
        const result = await client.fetch(
          {
            url: listingUrl,
            method: 'GET',
            timeoutMs: context.timeoutMs,
          },
          this.source.rateLimit,
        );

        const html = result.body.toString('utf-8');
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match;

        while ((match = linkRegex.exec(html)) !== null) {
          if (!match[1] || !match[2]) {
            continue;
          }
          const rawHref = match[1];
          const text = match[2]
            .replace(/<[^>]+>/g, '')
            .trim()
            .replace(/\s+/g, ' ');

          if (
            !rawHref ||
            rawHref.startsWith('javascript:') ||
            rawHref.startsWith('#') ||
            rawHref.startsWith('mailto:') ||
            rawHref.includes('doRegister') ||
            rawHref.includes('HomeAction.do?doListing')
          ) {
            continue;
          }

          if (text.length > 10 && !seenUrls.has(rawHref)) {
            seenUrls.add(rawHref);
            const fullUrl = rawHref.startsWith('http')
              ? rawHref
              : `https://www.sebi.gov.in${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;

            documents.push({
              url: fullUrl,
              title: text,
              publishedAt: new Date().toISOString(),
              metadata: {
                sourceListingUrl: listingUrl,
              },
            });
          }
        }
      } catch (err) {
        console.error(`[${this.sourceKey}] Failed to fetch listing ${listingUrl}:`, err);
      }
    }

    return documents;
  }

  async fetchDocument(
    document: DiscoveredDocument,
    context: CrawlContext,
  ): Promise<FetchedDocument> {
    const client = this.createHttpClient(context);
    const result = await client.fetch(
      {
        url: document.url,
        method: 'GET',
        timeoutMs: context.timeoutMs,
        allowedMimeTypes: [
          'text/html',
          'application/xhtml+xml',
          'text/xml',
          'application/xml',
          'application/pdf',
        ],
      },
      this.source.rateLimit,
    );

    const html = result.body.toString('utf-8');
    const extracted = extractHtmlContent(html, document.url);

    return {
      url: document.url,
      content: extracted.text || document.title || 'SEBI Notice',
      contentType: result.contentType ?? 'text/html',
      contentHash: result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata: {
        title: extracted.title ?? document.title,
        publishedAt: document.publishedAt,
        dates: extracted.dates,
        pdfLinks: extracted.pdfLinks,
      },
    };
  }

  async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const start = Date.now();
    const client = this.createHttpClient(context);
    try {
      const result = await client.fetch({
        url: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=2&smid=2',
        method: 'GET',
        timeoutMs: context.timeoutMs,
      });

      return {
        ok: result.statusCode >= 200 && result.statusCode < 400,
        latencyMs: Date.now() - start,
        statusCode: result.statusCode,
      };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  protected createHttpClient(context: CrawlContext): HttpClient {
    return new HttpClient({
      userAgent: context.userAgent,
      defaultTimeoutMs: context.timeoutMs,
    });
  }
}
