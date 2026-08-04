import * as cheerio from 'cheerio';

export interface HtmlExtractionResult {
  title: string | null;
  text: string;
  dates: string[];
  pdfLinks: string[];
  metadata: Record<string, unknown>;
}

const STRIP_SELECTORS = [
  'nav',
  'footer',
  'script',
  'style',
  '[class*="cookie"]',
  '[class*="consent"]',
  '[class*="related"]',
  '[class*="sidebar"]',
  '[class*="advertisement"]',
  '[id*="cookie"]',
  '[id*="consent"]',
].join(', ');

export function extractHtmlContent(html: string, baseUrl?: string): HtmlExtractionResult {
  const $ = cheerio.load(html);

  // Strip unwanted elements
  $(STRIP_SELECTORS).remove();

  // Extract title (prefer h1, fallback to title tag)
  const title = $('h1').first().text().trim() || $('title').first().text().trim() || null;

  // Extract publication dates from meta tags and time elements
  const dates: string[] = [];
  const dateMetaSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="publish-date"]',
    'meta[name="pubdate"]',
    'meta[name="date"]',
    'meta[name="DC.date"]',
    'meta[itemprop="datePublished"]',
  ];
  for (const selector of dateMetaSelectors) {
    const content = $(selector).attr('content');
    if (content) dates.push(content);
  }
  $('time[datetime]').each((_, el) => {
    const dt = $(el).attr('datetime');
    if (dt) dates.push(dt);
  });

  // Extract main text content
  const contentSelectors = ['article', 'main', '[role="main"]', '.content', '#content'];
  let textContent = '';
  for (const selector of contentSelectors) {
    const el = $(selector).first();
    if (el.length) {
      textContent = el.text();
      break;
    }
  }
  if (!textContent) {
    textContent = $('body').text();
  }

  // Normalize whitespace
  const text = textContent.replace(/\s+/g, ' ').trim();

  // Extract PDF links
  const pdfLinks: string[] = [];
  $('a[href$=".pdf"], a[href*=".pdf?"]').each((_, el) => {
    let href = $(el).attr('href');
    if (href) {
      if (baseUrl && !href.startsWith('http')) {
        try {
          href = new URL(href, baseUrl).href;
        } catch {
          // Keep original href
        }
      }
      pdfLinks.push(href);
    }
  });

  // Extract useful metadata
  const metadata: Record<string, unknown> = {};
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const author = $('meta[name="author"]').attr('content');
  if (ogTitle) metadata['ogTitle'] = ogTitle;
  if (ogDesc) metadata['ogDescription'] = ogDesc;
  if (author) metadata['author'] = author;

  return { title, text, dates, pdfLinks, metadata };
}
