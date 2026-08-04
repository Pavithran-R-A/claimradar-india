import Parser from 'rss-parser';
import { parseRssItem } from '../../src/extraction/rss.js';
import type { DiscoveredDocument } from '../../src/adapters/types.js';

/**
 * Offline mirror of BaseRssAdapter.discover(): parses feed XML with the same
 * rss-parser configuration and applies the identical item -> DiscoveredDocument
 * mapping, so live-fixture tests exercise the production pipeline without
 * touching the network.
 */
export async function discoverFromFeedXml(xml: string): Promise<DiscoveredDocument[]> {
  const parser = new Parser({ timeout: 30_000, maxRedirects: 2 });
  const feed = await parser.parseString(xml);
  const documents: DiscoveredDocument[] = [];

  for (const item of feed.items ?? []) {
    if (!item.link) continue;
    const rssItem: Parameters<typeof parseRssItem>[0] = { link: item.link };
    if (item.title !== undefined) rssItem.title = item.title;
    if (item.pubDate !== undefined) rssItem.pubDate = item.pubDate;
    if (item.guid !== undefined) rssItem.guid = item.guid;
    if (item.id !== undefined) rssItem.id = item.id;
    if (item.contentSnippet !== undefined) rssItem.contentSnippet = item.contentSnippet;
    if (item.content !== undefined) rssItem.content = item.content;
    if ((item as { summary?: unknown }).summary !== undefined)
      rssItem.summary = (item as { summary?: unknown }).summary;
    if (item.description !== undefined) rssItem.description = item.description;
    if ((item as Record<string, unknown>)['content:encoded'] !== undefined)
      rssItem['content:encoded'] = (item as Record<string, unknown>)['content:encoded'];

    const doc = parseRssItem(rssItem);
    if (doc.url) {
      documents.push(doc);
    }
  }

  return documents;
}

/** Parses feed XML and returns the channel/feed title alongside the documents. */
export async function parseFeedTitle(xml: string): Promise<string | undefined> {
  const parser = new Parser({ timeout: 30_000, maxRedirects: 2 });
  const feed = await parser.parseString(xml);
  return feed.title;
}
