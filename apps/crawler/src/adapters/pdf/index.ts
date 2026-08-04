import type { SourceDefinition } from '@claimradar/source-registry';
import type {
  SourceAdapter,
  CrawlContext,
  DiscoveredDocument,
  FetchedDocument,
  SourceHealthResult,
} from '../types.js';
import { extractPdfText } from '../../extraction/pdf.js';
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
 * Fixture-only PDF adapter.
 * Downloads PDF documents and extracts text content.
 * Classifies scanned PDFs (minimal text) as ocr_required.
 */
export class PdfIndexAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  private readonly source: SourceDefinition;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
  }

  async discover(_context: CrawlContext): Promise<DiscoveredDocument[]> {
    // PDF adapter doesn't discover pages — URLs are provided externally
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
        allowedMimeTypes: ['application/pdf'],
      },
      this.source.rateLimit,
    );

    // Attempt text extraction to classify
    const extraction = await extractPdfText(result.body);

    const metadata: Record<string, unknown> = {
      pageCount: extraction.pageCount,
      warnings: extraction.warnings,
      ...extraction.metadata,
    };

    if (document.title !== undefined) {
      metadata['title'] = document.title;
    }
    if (document.publishedAt !== undefined) {
      metadata['publishedAt'] = document.publishedAt;
    }

    // Classify scanned PDFs
    if (extraction.isScanned) {
      metadata['ocr_required'] = true;
      metadata['ocr_reason'] = 'Insufficient text extracted — likely a scanned document';
    }

    // If we got text, include it; otherwise keep raw bytes
    const allText = extraction.pages
      .map((p) => p.text)
      .join('\n\n')
      .trim();
    const content: Buffer | string = allText.length > 0 ? allText : result.body;

    return {
      url: document.url,
      content,
      contentType: result.contentType ?? 'application/pdf',
      contentHash: result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata,
    };
  }

  async healthCheck(_context: CrawlContext): Promise<SourceHealthResult> {
    // Fixture-only adapter
    return { ok: true, latencyMs: 0 };
  }
}
