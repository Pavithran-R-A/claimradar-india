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
  const normalizedPublishedAt = publishedAt ? normalizeDate(publishedAt) : undefined;
  if (normalizedPublishedAt) result.publishedAt = normalizedPublishedAt;
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

function normalizeDate(dateStr: string): string | undefined {
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const match = /^(\d{1,2})\s+([A-Za-z]{3,9}),?\s+(\d{4})(?:\s+([+-])(\d{2})(\d{2}))?$/.exec(
    trimmed,
  );
  if (!match) return undefined;

  const monthIndex = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ].indexOf(match[2]!.slice(0, 3).toLowerCase());
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (monthIndex < 0 || day < 1 || day > 31) return undefined;

  const offsetMinutes = match[4]
    ? (Number(match[5]) * 60 + Number(match[6])) * (match[4] === '+' ? 1 : -1)
    : 0;
  const calendarDate = new Date(Date.UTC(year, monthIndex, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== monthIndex ||
    calendarDate.getUTCDate() !== day
  ) {
    return undefined;
  }
  const parsed = new Date(calendarDate.getTime() - offsetMinutes * 60_000);
  return parsed.toISOString();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}
