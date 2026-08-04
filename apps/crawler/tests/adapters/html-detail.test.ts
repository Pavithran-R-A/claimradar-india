import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractHtmlContent } from '../../src/extraction/html.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, '..', 'fixtures', 'html', 'detail-page.html');
const detailHtml = readFileSync(fixturePath, 'utf-8');

describe('HTML Detail Page Adapter', () => {
  describe('extractHtmlContent on detail page', () => {
    it('should extract the article title from h1', () => {
      const result = extractHtmlContent(
        detailHtml,
        'https://sebi.gov.in/press/2024/refund-order.html',
      );
      expect(result.title).toBe('SEBI orders refund to affected investors');
    });

    it('should extract the publication date from time element', () => {
      const result = extractHtmlContent(
        detailHtml,
        'https://sebi.gov.in/press/2024/refund-order.html',
      );
      expect(result.dates).toContain('2024-06-15');
    });

    it('should extract main article text content', () => {
      const result = extractHtmlContent(
        detailHtml,
        'https://sebi.gov.in/press/2024/refund-order.html',
      );
      expect(result.text).toContain('Securities and Exchange Board of India');
      expect(result.text).toContain('₹50 crore');
      expect(result.text).toContain('affected investors');
      expect(result.text).toContain('deadline for submitting claims');
    });

    it('should extract PDF links from the article', () => {
      const result = extractHtmlContent(
        detailHtml,
        'https://sebi.gov.in/press/2024/refund-order.html',
      );
      expect(result.pdfLinks).toContain('https://sebi.gov.in/claims/abc-refund.pdf');
    });

    it('should strip nav and footer from extracted text', () => {
      const result = extractHtmlContent(
        detailHtml,
        'https://sebi.gov.in/press/2024/refund-order.html',
      );
      expect(result.text).not.toContain('Copyright SEBI');
    });
  });
});
