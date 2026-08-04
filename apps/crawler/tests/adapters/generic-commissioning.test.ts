import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverFromFeedXml, parseFeedTitle } from './live-helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(
  __dirname,
  '..',
  'fixtures',
  'rss',
  'generic-commissioning-fixture.xml',
);
const xmlContent = readFileSync(fixturePath, 'utf-8');

describe('Generic RSS Adapter Commissioning Test', () => {
  it('should parse channel title and items from generic commissioning feed', async () => {
    const title = await parseFeedTitle(xmlContent);
    const docs = await discoverFromFeedXml(xmlContent);

    expect(title).toBe('Generic Regulatory Notice Commissioning Feed');
    expect(docs).toHaveLength(2);
    expect(docs[0]?.title).toContain('Notice 101');
    expect(docs[1]?.url).toBe('https://generic-regulatory-feed.gov.in/notices/2026/notice-102.pdf');
  });
});
