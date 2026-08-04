import { describe, it, expect } from 'vitest';
import { parseRssItem } from '../../src/extraction/rss.js';

describe('Atom and RSS description extraction unit tests', () => {
  it('should extract description from Atom entry with summary', () => {
    const item = {
      title: 'Summary Test',
      link: 'https://example.gov.in/test1',
      summary: 'Summary text for test entry',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Summary text for test entry');
  });

  it('should extract description from Atom entry with content', () => {
    const item = {
      title: 'Content Test',
      link: 'https://example.gov.in/test2',
      content: '<p>Content text for test entry</p>',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Content text for test entry');
  });

  it('should respect field precedence when both content and summary are present', () => {
    const item = {
      title: 'Both Test',
      link: 'https://example.gov.in/test3',
      content: 'Detailed content text',
      summary: 'Short summary text',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Detailed content text');
  });

  it('should decode HTML-encoded entities in description', () => {
    const item = {
      title: 'Entities Test',
      link: 'https://example.gov.in/test4',
      summary: 'Notice &amp; Order for &quot;Refunds&quot; &lt;2026&gt;',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Notice & Order for "Refunds" <2026>');
  });

  it('should handle empty description gracefully without producing undefined keys', () => {
    const item = {
      title: 'Empty Test',
      link: 'https://example.gov.in/test5',
      summary: '   ',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBeUndefined();
  });

  it('should handle missing description gracefully', () => {
    const item = {
      title: 'Missing Test',
      link: 'https://example.gov.in/test6',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBeUndefined();
  });

  it('should preserve RSS description behavior with content:encoded and description', () => {
    const rssItem = {
      title: 'RSS Test',
      link: 'https://example.gov.in/test7',
      'content:encoded': '<p>Full encoded body</p>',
      description: 'Short RSS description',
    };
    const doc = parseRssItem(rssItem);
    expect(doc.description).toBe('Full encoded body');
  });

  it('should safely extract text from object structures without producing [object Object]', () => {
    const item = {
      title: 'Object Test',
      link: 'https://example.gov.in/test8',
      summary: { _: 'Extracted text inside XML object' },
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Extracted text inside XML object');
    expect(doc.description).not.toContain('[object Object]');
  });

  it('should perform safe text normalization and whitespace collapse', () => {
    const item = {
      title: 'Whitespace Test',
      link: 'https://example.gov.in/test9',
      summary: '  Multi-line  \n  description  with   extra   spaces.  ',
    };
    const doc = parseRssItem(item);
    expect(doc.description).toBe('Multi-line description with extra spaces.');
  });
});
