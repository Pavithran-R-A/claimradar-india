import Parser from 'rss-parser';
import type { SourceDefinition } from '@claimradar/source-registry';
import type {
  SourceAdapter,
  CrawlContext,
  DiscoveredDocument,
  FetchedDocument,
  SourceHealthResult,
} from '../types.js';
import { parseRssItem } from '../../extraction/rss.js';
import { extractHtmlContent } from '../../extraction/html.js';
import { extractPdfText } from '../../extraction/pdf.js';
import { HttpClient } from '../../http/client.js';
import { sha256 } from '../../http/hash.js';
import type { CloudflareRelayConfig } from '../../http/types.js';

export class BaseRssAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  protected readonly source: SourceDefinition;
  protected readonly parser: Parser;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
    this.parser = new Parser({
      timeout: 30_000,
      maxRedirects: 2,
    });
  }

  async discover(_context: CrawlContext): Promise<DiscoveredDocument[]> {
    const feedUrl = this.getFeedUrl();
    if (!feedUrl) {
      throw new Error(`[${this.sourceKey}] No feed URL configured for RSS adapter`);
    }

    const client = this.createHttpClient(_context);
    const res = await client.fetch({
      url: feedUrl,
      method: 'GET',
      timeoutMs: _context.timeoutMs,
    });
    const xml = res.body.toString('utf-8');
    const feed = await this.parser.parseString(xml);
    const documents: DiscoveredDocument[] = [];

    for (const item of feed.items ?? []) {
      if (!item.link) continue;
      const rssItem: Parameters<typeof parseRssItem>[0] = { link: item.link };
      if (item.title !== undefined) rssItem.title = item.title;
      if (item.pubDate !== undefined) rssItem.pubDate = item.pubDate;
      if ((item as Record<string, unknown>)['dc:date'] !== undefined)
        rssItem['dc:date'] = (item as Record<string, unknown>)['dc:date'] as string;
      if (item.guid !== undefined) rssItem.guid = item.guid;
      if (item.id !== undefined) rssItem.id = item.id;
      if (item.contentSnippet !== undefined) rssItem.contentSnippet = item.contentSnippet;
      if (item.content !== undefined) rssItem.content = item.content;
      if ((item as { summary?: unknown }).summary !== undefined)
        rssItem.summary = (item as { summary?: unknown }).summary;
      if (item.description !== undefined) rssItem.description = item.description;
      if ((item as Record<string, unknown>)['content:encoded'] !== undefined)
        rssItem['content:encoded'] = (item as Record<string, unknown>)['content:encoded'];

      const doc = parseRssItem(rssItem);
      if (doc.url) {
        documents.push(doc);
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

    const sourceText =
      typeof document.metadata?.['sourceText'] === 'string'
        ? document.metadata['sourceText']
        : typeof document.metadata?.['rssFullText'] === 'string'
          ? document.metadata['rssFullText']
          : undefined;
    // Official RSS feeds can point straight to a PDF, not just an HTML detail page.
    // Never decode PDF bytes as UTF-8 HTML: extract source-backed text and retain
    // any scan/extraction warnings for later editorial review.
    const isPdf =
      result.contentType?.split(';')[0]?.trim().toLowerCase() === 'application/pdf' ||
      /[.]pdf(?:[?#]|$)/i.test(document.url);
    if (isPdf) {
      const pdf = await extractPdfText(result.body);
      const pdfText = pdf.pages
        .map((page) => page.text)
        .filter(Boolean)
        .join('\\n\\n')
        .trim();
      const content = [sourceText, pdfText].filter((part) => Boolean(part?.trim())).join('\\n\\n');
      return {
        url: document.url,
        content,
        contentType: result.contentType ?? 'application/pdf',
        contentHash: sourceText ? sha256(content) : result.contentHash,
        etag: result.etag,
        lastModified: result.lastModified,
        fetchedAt: new Date(),
        metadata: {
          ...document.metadata,
          wasCached: result.wasCached,
          title: document.title ?? pdf.metadata['title'],
          publishedAt: document.publishedAt,
          pageCount: pdf.pageCount,
          warnings: pdf.warnings,
          ...(pdf.isScanned || pdf.pageCount === 0
            ? {
                ocr_required: true,
                ocr_reason:
                  pdf.pageCount === 0
                    ? 'PDF cannot be extracted; inspect document and source'
                    : 'PDF may contain scanned text; manual verification required',
              }
            : {}),
          transport: result.transport,
          ...pdf.metadata,
        },
      };
    }

    const html = result.body.toString('utf-8');
    const extracted = extractHtmlContent(html, document.url);
    const contentParts = [sourceText, extracted.text].filter((part): part is string =>
      Boolean(part && part.trim()),
    );
    const content = contentParts.join('\n\n');

    return {
      url: document.url,
      content,
      contentType: result.contentType ?? 'text/html',
      contentHash: sourceText ? sha256(content) : result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata: {
        ...document.metadata,
        wasCached: result.wasCached,
        title: extracted.title ?? document.title,
        publishedAt: document.publishedAt,
        dates: extracted.dates,
        pdfLinks: extracted.pdfLinks,
        transport: result.transport,
        ...extracted.metadata,
      },
    };
  }

  async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const feedUrl = this.getFeedUrl();
    if (!feedUrl) {
      return { ok: false, latencyMs: 0, error: 'No feed URL configured' };
    }

    const start = Date.now();
    const client = this.createHttpClient(context);

    try {
      const result = await client.fetch({
        url: feedUrl,
        method: 'GET',
        timeoutMs: context.timeoutMs,
      });

      const body = result.body.toString('utf-8');
      const isRss = body.includes('<rss') || body.includes('<feed') || body.includes('<?xml');

      return {
        ok: result.statusCode >= 200 && result.statusCode < 300 && isRss,
        latencyMs: Date.now() - start,
        statusCode: result.statusCode,
        feedValid: isRss,
        transport: result.transport,
      };
    } catch (err) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  protected getFeedUrl(): string | undefined {
    return this.source.feedUrl;
  }

  protected createHttpClient(context: CrawlContext): HttpClient {
    const options: {
      userAgent: string;
      defaultTimeoutMs: number;
      contactEmail?: string;
      relay?: CloudflareRelayConfig;
    } = {
      userAgent: context.userAgent,
      defaultTimeoutMs: context.timeoutMs,
      ...(context.traiRelay !== undefined ? { relay: context.traiRelay } : {}),
    };
    if (context.contactEmail !== undefined) {
      options.contactEmail = context.contactEmail;
    }
    return new HttpClient(options);
  }
}
