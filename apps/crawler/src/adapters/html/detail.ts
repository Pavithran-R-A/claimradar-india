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
 * Fixture-only HTML detail page adapter.
 * Extracts main content from a single detail page.
 * Detail pages don't discover other pages.
 */
export class HtmlDetailAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  private readonly source: SourceDefinition;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
  }

  async discover(_context: CrawlContext): Promise<DiscoveredDocument[]> {
    // Detail pages don't discover other pages
    return [];
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

    const metadata: Record<string, unknown> = {
      title: extracted.title ?? document.title,
      dates: extracted.dates,
      pdfLinks: extracted.pdfLinks,
      ...extracted.metadata,
    };

    if (document.publishedAt !== undefined) {
      metadata['publishedAt'] = document.publishedAt;
    } else if (extracted.dates[0] !== undefined) {
      metadata['publishedAt'] = extracted.dates[0];
    }

    return {
      url: document.url,
      content: extracted.text,
      contentType: result.contentType ?? 'text/html',
      contentHash: result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata,
    };
  }

  async healthCheck(_context: CrawlContext): Promise<SourceHealthResult> {
    // Fixture-only adapter — always returns ok
    return { ok: true, latencyMs: 0 };
  }
}
