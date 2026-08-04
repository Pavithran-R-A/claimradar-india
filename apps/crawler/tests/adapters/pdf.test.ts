import { describe, it, expect, vi } from 'vitest';

// Mock pdfjs-dist before importing extractPdfText
vi.mock('pdfjs-dist', () => {
  const createMockPage = (text: string) => ({
    getTextContent: () =>
      Promise.resolve({
        items: text
          .split(' ')
          .filter(Boolean)
          .map((str) => ({ str, hasEOL: false })),
      }),
  });

  const createMockDoc = (pages: string[], meta: Record<string, unknown> = {}) => ({
    numPages: pages.length,
    getPage: (n: number) => Promise.resolve(createMockPage(pages[n - 1] ?? '')),
    getMetadata: () =>
      Promise.resolve({
        info: meta,
      }),
  });

  return {
    getDocument: vi.fn((opts: { data: Uint8Array }) => {
      // Inspect the buffer to decide what to return
      const text = Buffer.from(opts.data).toString('utf-8');

      if (text === 'SCANNED_PDF') {
        // Scanned PDF: pages with minimal text
        return {
          promise: Promise.resolve(
            createMockDoc(['  ', '  ', '  '], { Title: 'Scanned Document' }),
          ),
        };
      }

      if (text === 'ENCRYPTED_PDF') {
        return {
          promise: Promise.reject(new Error('PDF is encrypted and password-protected')),
        };
      }

      // Text-based PDF: pages with substantial text
      return {
        promise: Promise.resolve(
          createMockDoc(
            [
              'The National Consumer Disputes Redressal Commission has ordered ABC Company to refund Rs 5 crore to all affected consumers who purchased defective products between January 2023 and December 2024.',
              'All eligible consumers may submit a claim form with proof of purchase by 31 December 2026.',
              'This is a final order. No appeal pending.',
            ],
            { Title: 'NCDRC Refund Order', Author: 'NCDRC', CreationDate: '2024-06-15' },
          ),
        ),
      };
    }),
  };
});

// Import after mocking
import { extractPdfText } from '../../src/extraction/pdf.js';

describe('PDF Adapter', () => {
  describe('extractPdfText with text-based PDF', () => {
    it('should extract text from all pages', async () => {
      const buffer = Buffer.from('TEXT_PDF');
      const result = await extractPdfText(buffer);

      expect(result.pageCount).toBe(3);
      expect(result.pages).toHaveLength(3);
      expect(result.pages[0]!.pageNumber).toBe(1);
      expect(result.pages[0]!.text).toContain('National Consumer Disputes Redressal Commission');
      expect(result.pages[1]!.text).toContain('claim form');
      expect(result.pages[2]!.text).toContain('final order');
    });

    it('should not mark text PDF as scanned', async () => {
      const buffer = Buffer.from('TEXT_PDF');
      const result = await extractPdfText(buffer);
      expect(result.isScanned).toBe(false);
    });

    it('should extract metadata from PDF', async () => {
      const buffer = Buffer.from('TEXT_PDF');
      const result = await extractPdfText(buffer);
      expect(result.metadata['title']).toBe('NCDRC Refund Order');
      expect(result.metadata['author']).toBe('NCDRC');
      expect(result.metadata['creationDate']).toBe('2024-06-15');
    });
  });

  describe('extractPdfText with scanned PDF', () => {
    it('should return ocr_required metadata for scanned PDFs', async () => {
      const buffer = Buffer.from('SCANNED_PDF');
      const result = await extractPdfText(buffer);

      expect(result.pageCount).toBe(3);
      expect(result.isScanned).toBe(true);
      expect(result.warnings.some((w) => w.includes('scanned'))).toBe(true);
    });

    it('should return empty text pages for scanned PDFs', async () => {
      const buffer = Buffer.from('SCANNED_PDF');
      const result = await extractPdfText(buffer);

      for (const page of result.pages) {
        expect(page.text.trim().length).toBeLessThan(100);
      }
    });
  });

  describe('extractPdfText with encrypted PDF', () => {
    it('should handle encrypted PDF gracefully', async () => {
      const buffer = Buffer.from('ENCRYPTED_PDF');
      const result = await extractPdfText(buffer);

      expect(result.pageCount).toBe(0);
      expect(result.pages).toHaveLength(0);
      expect(result.warnings.some((w) => w.includes('encrypted') || w.includes('password'))).toBe(
        true,
      );
    });
  });
});
