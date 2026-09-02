import type { DiscoveredDocument } from '../adapters/types.js';

export interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  'dc:date'?: string;
  description?: unknown;
  'content:encoded'?: unknown;
  summary?: unknown;
  content?: unknown;
  contentSnippet?: string;
  guid?: string;
  id?: string;
}

export function parseRssItem(item: RssItem): DiscoveredDocument {
  const url = item.link ?? '';
  const title = item.title?.trim();

  // Handle date variations: dc:date vs pubDate
  const publishedAt = item['dc:date'] ?? item.pubDate;

  // Prefer full fields for source text; snippets remain excerpts.
  const rawFullText =
    item['content:encoded'] ??
    item.content ??
    item.summary ??
    item.description ??
    item.contentSnippet ??
    '';
  const sourceText = stripHtml(extractTextFromValue(rawFullText));
  const excerpt = truncate(sourceText, 500);

  // Use guid or id as source identifier
  const sourceIdentifier = item.guid ?? item.id;

  const result: DiscoveredDocument = { url };
  if (title) result.title = title;
  if (publishedAt) result.publishedAt = normalizeDate(publishedAt);
  if (sourceIdentifier) result.sourceIdentifier = sourceIdentifier;
  if (excerpt) {
    result.description = excerpt;
    result.metadata = {
      sourceText,
      rssExcerpt: excerpt,
    };
  }

  return result;
}

function extractTextFromValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (typeof obj._ === 'string') return obj._;
    if (typeof obj.$value === 'string') return obj.$value;
    if (typeof obj.value === 'string') return obj.value;
  }
  return String(val);
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function normalizeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // Fall through
  }
  return dateStr;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}
