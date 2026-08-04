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
import * as cheerio from 'cheerio';

function createClient(context: CrawlContext): HttpClient {
  const options: { userAgent: string; defaultTimeoutMs: number; contactEmail?: string } = {
    userAgent: context.userAgent,
    defaultTimeoutMs: context.timeoutMs,
  };
  if (context.contactEmail !== undefined) {
    options.contactEmail = context.contactEmail;
  }
  return new HttpClient(options);
}

/**
 * Fixture-only HTML listing page adapter.
 * Parses an HTML listing page to extract links to detail pages.
 * Only works with local fixtures — no live sources use this adapter yet.
 */
export class HtmlListingAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  private readonly source: SourceDefinition;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
  }

  async discover(context: CrawlContext): Promise<DiscoveredDocument[]> {
    const client = createClient(context);

    const result = await client.fetch(
      {
        url: this.source.baseUrl,
        method: 'GET',
        timeoutMs: context.timeoutMs,
        allowedMimeTypes: ['text/html', 'application/xhtml+xml'],
      },
      this.source.rateLimit,
    );

    const html = result.body.toString('utf-8');
    const $ = cheerio.load(html);
    const documents: DiscoveredDocument[] = [];

    // Extract links from the listing page
    const linkSelector = (this.source.config?.['linkSelector'] as string) ?? 'a[href]';
    $(linkSelector).each((_, el) => {
      let href = $(el).attr('href');
      if (!href) return;

      // Resolve relative URLs
      if (!href.startsWith('http')) {
        try {
          href = new URL(href, this.source.baseUrl).href;
        } catch {
          return;
        }
      }

      // Only include links from the same domain
      try {
        const linkHost = new URL(href).hostname;
        if (linkHost !== this.source.domain) return;
      } catch {
        return;
      }

      const title = $(el).text().trim();
      const doc: DiscoveredDocument = { url: href };
      if (title) doc.title = title;
      documents.push(doc);
    });

    return documents;
  }

  async fetchDocument(
    document: DiscoveredDocument,
    context: CrawlContext,
  ): Promise<FetchedDocument> {
    const client = createClient(context);

    const result = await client.fetch(
      {
        url: document.url,
        method: 'GET',
        timeoutMs: context.timeoutMs,
        allowedMimeTypes: ['text/html', 'application/xhtml+xml'],
      },
      this.source.rateLimit,
    );

    const html = result.body.toString('utf-8');
    const extracted = extractHtmlContent(html, document.url);

    return {
      url: document.url,
      content: extracted.text,
      contentType: result.contentType ?? 'text/html',
      contentHash: result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata: {
        title: extracted.title ?? document.title,
        dates: extracted.dates,
        pdfLinks: extracted.pdfLinks,
        ...extracted.metadata,
      },
    };
  }

  async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const start = Date.now();
    const client = createClient(context);

    try {
      const result = await client.fetch({
        url: this.source.baseUrl,
        method: 'HEAD',
        timeoutMs: context.timeoutMs,
      });

      return {
        ok: result.statusCode >= 200 && result.statusCode < 300,
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
}
