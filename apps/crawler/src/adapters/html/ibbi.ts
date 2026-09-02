import { load } from 'cheerio';
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
import { HttpClient } from '../../http/client.js';

export interface IbbiRowMetadata {
  announcementType: string;
  announcementDate: string;
  claimDeadline: string;
  corporateDebtor: string;
  applicant: string;
  insolvencyProfessional: string;
  pdfUrl?: string;
}

export class IbbiPublicAnnouncementAdapter implements SourceAdapter {
  public readonly sourceKey: string;
  protected readonly source: SourceDefinition;

  constructor(source: SourceDefinition) {
    this.source = source;
    this.sourceKey = source.id;
  }

  async discover(context: CrawlContext): Promise<DiscoveredDocument[]> {
    const client = this.createHttpClient(context);
    const result = await client.fetch(
      {
        url: 'https://ibbi.gov.in/public-announcement',
        method: 'GET',
        timeoutMs: context.timeoutMs,
      },
      this.source.rateLimit,
    );

    const html = result.body.toString('utf-8');
    const $ = load(html);
    const documents: DiscoveredDocument[] = [];

    // Parse structured table rows on IBBI public announcements page
    $('table tr').each((i, elem) => {
      const tds = $(elem)
        .find('td')
        .map((_, td) => $(td).text().trim())
        .get();

      if (tds.length >= 4) {
        const announcementType = tds[0] || 'Public Announcement';
        const announcementDate = tds[1] || '';
        const claimDeadline = tds[2] || '';
        const corporateDebtor = tds[3] || '';
        const applicant = tds[4] || '';
        const insolvencyProfessional = tds[5] || '';

        const pdfHref = $(elem).find('a').attr('href');
        const pdfUrl = pdfHref
          ? pdfHref.startsWith('http')
            ? pdfHref
            : `https://ibbi.gov.in${pdfHref.startsWith('/') ? '' : '/'}${pdfHref}`
          : undefined;

        const docUrl = pdfUrl || `https://ibbi.gov.in/public-announcement#row-${i}`;
        const title = `${announcementType}: ${corporateDebtor} (Claims Deadline: ${claimDeadline})`;

        documents.push({
          url: docUrl,
          title,
          publishedAt: announcementDate
            ? new Date(announcementDate.split('-').reverse().join('-')).toISOString()
            : new Date().toISOString(),
          metadata: {
            announcementType,
            announcementDate,
            claimDeadline,
            corporateDebtor,
            applicant,
            insolvencyProfessional,
            pdfUrl,
          },
        });
      }
    });

    // Fallback if structure changes
    if (documents.length === 0) {
      documents.push({
        url: 'https://ibbi.gov.in/public-announcement',
        title: 'IBBI Corporate Insolvency Creditor Claims Public Announcements Portal',
        publishedAt: new Date().toISOString(),
      });
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

    const isPdf =
      document.url.toLowerCase().endsWith('.pdf') || result.contentType?.includes('pdf');
    let content: string;
    let pdfMetadata: Record<string, unknown> = {};

    if (isPdf) {
      const extractedPdf = await extractPdfText(result.body);
      const extractedText = extractedPdf.pages
        .map((page) => page.text)
        .filter((page) => page.length > 0)
        .join('\n\n')
        .trim();
      content = extractedText;
      const hasExtractedText = extractedText.length > 0;
      pdfMetadata = {
        pageCount: extractedPdf.pageCount,
        warnings: extractedPdf.warnings.filter(
          (warning) => !(hasExtractedText && warning.startsWith('PDF appears to be scanned')),
        ),
        ...extractedPdf.metadata,
        ...(!hasExtractedText && extractedPdf.isScanned
          ? {
              ocr_required: true,
              ocr_reason: 'Insufficient text extracted — likely a scanned document',
            }
          : {}),
      };
    } else {
      const html = result.body.toString('utf-8');
      const extracted = extractHtmlContent(html, document.url);
      content = extracted.text;
    }

    return {
      url: document.url,
      content,
      contentType: result.contentType ?? (isPdf ? 'application/pdf' : 'text/html'),
      contentHash: result.contentHash,
      etag: result.etag,
      lastModified: result.lastModified,
      fetchedAt: new Date(),
      metadata: {
        ...document.metadata,
        wasCached: result.wasCached,
        title: document.title,
        publishedAt: document.publishedAt,
        ...pdfMetadata,
      },
    };
  }

  async healthCheck(context: CrawlContext): Promise<SourceHealthResult> {
    const start = Date.now();
    const client = this.createHttpClient(context);
    try {
      const result = await client.fetch({
        url: 'https://ibbi.gov.in/public-announcement',
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
