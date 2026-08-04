import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractHtmlContent } from '../../src/extraction/html.js';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, '..', 'fixtures', 'html', 'listing-page.html');
const listingHtml = readFileSync(fixturePath, 'utf-8');

describe('HTML Listing Page Adapter', () => {
  describe('extractHtmlContent on listing page', () => {
    it('should extract the page title from h1', () => {
      const result = extractHtmlContent(listingHtml, 'https://sebi.gov.in/press');
      expect(result.title).toBe('Press Releases');
    });

    it('should discover 3 links in the listing page', () => {
      const $ = cheerio.load(listingHtml);
      const links: Array<{ href: string; title: string }> = [];
      const baseUrl = 'https://sebi.gov.in';

      $('a[href]').each((_, el) => {
        let href = $(el).attr('href');
        if (!href) return;
        if (!href.startsWith('http')) {
          try {
            href = new URL(href, baseUrl).href;
          } catch {
            return;
          }
        }
        const title = $(el).text().trim();
        if (title && href.includes('/press/')) {
          links.push({ href, title });
        }
      });

      expect(links).toHaveLength(3);
      expect(links[0]!.title).toBe('SEBI orders refund to affected investors');
      expect(links[0]!.href).toBe('https://sebi.gov.in/press/2024/refund-order.html');
      expect(links[1]!.title).toBe('Penalty imposed on XYZ Corp');
      expect(links[2]!.title).toBe('Routine administrative circular');
    });

    it('should resolve relative URLs correctly', () => {
      const $ = cheerio.load(listingHtml);
      const baseUrl = 'https://sebi.gov.in';
      const resolvedUrls: string[] = [];

      $('ul a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http')) {
          try {
            resolvedUrls.push(new URL(href, baseUrl).href);
          } catch {
            /* skip */
          }
        }
      });

      expect(resolvedUrls).toContain('https://sebi.gov.in/press/2024/refund-order.html');
      expect(resolvedUrls).toContain('https://sebi.gov.in/press/2024/penalty-notice.html');
      expect(resolvedUrls).toContain('https://sebi.gov.in/press/2024/routine-circular.html');
    });

    it('should strip nav and footer content from extracted text', () => {
      const result = extractHtmlContent(listingHtml, 'https://sebi.gov.in/press');
      // nav and footer content should not appear in main text
      expect(result.text).not.toContain('Copyright SEBI');
      // Main content should contain the listing
      expect(result.text).toContain('Press Releases');
    });
  });
});
