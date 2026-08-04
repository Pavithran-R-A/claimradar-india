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
import { HttpClient } from '../../http/client.js';

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
      return [];
    }

    try {
      const feed = await this.parser.parseURL(feedUrl);
      const documents: DiscoveredDocument[] = [];

      for (const item of feed.items ?? []) {
        if (!item.link) continue;
        const rssItem: Parameters<typeof parseRssItem>[0] = { link: item.link };
        if (item.title !== undefined) rssItem.title = item.title;
        if (item.pubDate !== undefined) rssItem.pubDate = item.pubDate;
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
    } catch (err) {
      console.error(`[${this.sourceKey}] Failed to discover documents:`, err);
      return [];
    }
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
        allowedMimeTypes: ['text/html', 'application/xhtml+xml', 'text/xml', 'application/xml'],
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
        publishedAt: document.publishedAt,
        dates: extracted.dates,
        pdfLinks: extracted.pdfLinks,
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
    const options: { userAgent: string; defaultTimeoutMs: number; contactEmail?: string } = {
      userAgent: context.userAgent,
      defaultTimeoutMs: context.timeoutMs,
    };
    if (context.contactEmail !== undefined) {
      options.contactEmail = context.contactEmail;
    }
    return new HttpClient(options);
  }
}
