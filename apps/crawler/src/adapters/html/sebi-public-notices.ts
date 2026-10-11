import type { SourceDefinition } from '@claimradar/source-registry';
import type {
  SourceAdapter,
  CrawlContext,
  DiscoveredDocument,
  FetchedDocument,
  SourceHealthResult,
} from '../types.js';
import { extractHtmlContent } from '../../extraction/html.js';
import { extractPdfText } from '../../extraction/pdf.js';
import { sha256 } from '../../http/hash.js';
import * as cheerio from 'cheerio';
import { HttpClient } from '../../http/client.js';

/**
 * SEBI notice pages put the signed source PDF in an iframe viewer, often as
 * /web/?file=https://www.sebi.gov.in/sebi_data/attachdocs/...pdf.
 * It is not an <a href="...pdf">, so ordinary HTML extraction misses it.
 * Restrict evidence fetches to SEBI's own attachment directory.
 */
export function findOfficialSebiNoticePdf(html: string, pageUrl: string): string | null {
  const $ = cheerio.load(html);
  const selectors = [
    'iframe[src]',
    'embed[src]',
    'object[data]',
    '[data-original-tag="iframe"][src]',
  ].join(', ');

  for (const element of $(selectors).toArray()) {
    const raw = $(element).attr('src') ?? $(element).attr('data');
    if (!raw) continue;
    try {
      const viewer = new URL(raw, pageUrl);
      const wrapped = viewer.pathname === '/web/' ? viewer.searchParams.get('file') : null;
      const target = new URL(wrapped ?? viewer.href, viewer.href);
      if (
        target.protocol === 'https:' &&
        /^(?:www\.)?sebi\.gov\.in$/i.test(target.hostname) &&
        target.pathname.startsWith('/sebi_data/attachdocs/') &&
        target.pathname.toLowerCase().endsWith('.pdf')
      ) {
        return target.href;
      }
    } catch {
      // Ignore malformed or external viewer URLs; never fetch arbitrary targets.
    }
  }
  return null;
}

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

    let lastError: Error | null = null;
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
              metadata: {
                sourceListingUrl: listingUrl,
              },
            });
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[${this.sourceKey}] Failed to fetch listing ${listingUrl}:`, err);
      }
    }

    if (documents.length === 0 && lastError) {
      throw lastError;
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
    const baseText = extracted.text || document.title || 'SEBI Notice';
    const officialPdfUrl = findOfficialSebiNoticePdf(html, document.url);
    let evidenceText = '';
    let pdfPages = 0;
    let pdfError: string | null = null;

    if (officialPdfUrl) {
      try {
        const attachment = await client.fetch(
          {
            url: officialPdfUrl,
            method: 'GET',
            timeoutMs: context.timeoutMs,
            allowedMimeTypes: ['application/pdf'],
            maxBodySize: 10 * 1024 * 1024,
          },
          this.source.rateLimit,
        );
        if (attachment.body.length === 0) {
          pdfError = 'pdf_response_empty';
        } else {
          const pdf = await extractPdfText(attachment.body);
          pdfPages = pdf.pageCount;
          evidenceText = pdf.pages
            .map((page) => page.text)
            .filter(Boolean)
            .join('\n')
            .trim();
          if (pdf.isScanned || evidenceText.length < 100) {
            evidenceText = '';
            pdfError = 'pdf_text_unavailable';
          }
        }
      } catch (error) {
        // Never pass a title-only notice off as validated source evidence.
        pdfError = error instanceof Error ? error.name : 'pdf_fetch_failed';
      }
    }

    const content = evidenceText
      ? `${baseText}\n\nOfficial SEBI notice PDF: ${officialPdfUrl}\n${evidenceText}`
      : baseText;
    const dateLabel = cheerio.load(html)('.date_value h5').first().text().trim();
    const labelDate = /^[A-Za-z]{3} \d{1,2}, \d{4}$/.test(dateLabel) ? new Date(dateLabel) : null;
    const publishedAt =
      document.publishedAt ??
      extracted.dates[0] ??
      (labelDate && !Number.isNaN(labelDate.getTime()) ? labelDate.toISOString() : undefined);

    return {
      url: document.url,
      content,
      contentType: result.contentType ?? 'text/html',
      // Hash the actual extracted evidence, not just the HTML viewer wrapper.
      contentHash: evidenceText ? sha256(Buffer.from(content)) : result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata: {
        title: extracted.title ?? document.title,
        ...(publishedAt ? { publishedAt } : {}),
        dates: extracted.dates,
        pdfLinks: officialPdfUrl ? [officialPdfUrl] : extracted.pdfLinks,
        officialPdfUrl,
        pdfPageCount: pdfPages,
        evidenceComplete: evidenceText.length >= 100,
        ...(pdfError ? { pdfError } : {}),
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
