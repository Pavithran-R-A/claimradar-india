import { getDocument } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api.js';

export interface PdfPageResult {
  pageNumber: number;
  text: string;
}

export interface PdfExtractionResult {
  pageCount: number;
  pages: PdfPageResult[];
  metadata: Record<string, unknown>;
  isScanned: boolean;
  warnings: string[];
}

const SCANNED_THRESHOLD_CHARS = 100;

export async function extractPdfText(buffer: Buffer): Promise<PdfExtractionResult> {
  const warnings: string[] = [];
  const metadata: Record<string, unknown> = {};

  let doc;
  try {
    const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    doc = await getDocument({ data }).promise;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('password') || message.includes('encrypted')) {
      warnings.push('PDF is encrypted or password-protected');
      return { pageCount: 0, pages: [], metadata, isScanned: false, warnings };
    }
    warnings.push(`Malformed PDF: ${message}`);
    return { pageCount: 0, pages: [], metadata, isScanned: false, warnings };
  }

  const pageCount = doc.numPages;
  const pages: PdfPageResult[] = [];
  let totalTextLength = 0;

  try {
    // Extract document-level metadata
    const meta = await doc.getMetadata();
    if (meta?.info) {
      const info = meta.info as Record<string, unknown>;
      if (info['Title']) metadata['title'] = info['Title'];
      if (info['Author']) metadata['author'] = info['Author'];
      if (info['CreationDate']) metadata['creationDate'] = info['CreationDate'];
    }
  } catch {
    warnings.push('Could not extract PDF metadata');
  }

  for (let i = 1; i <= pageCount; i++) {
    try {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .filter((item): item is TextItem => 'str' in item && typeof item.str === 'string')
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      totalTextLength += text.length;
      pages.push({ pageNumber: i, text });
    } catch {
      warnings.push(`Failed to extract text from page ${i}`);
      pages.push({ pageNumber: i, text: '' });
    }
  }

  const isScanned = totalTextLength < SCANNED_THRESHOLD_CHARS;

  if (isScanned && pageCount > 0) {
    warnings.push(
      `PDF appears to be scanned (only ${totalTextLength} chars extracted from ${pageCount} pages)`,
    );
  }

  return { pageCount, pages, metadata, isScanned, warnings };
}
