import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { prioritizeConsumerBacklog } from '../../src/ai/free-backlog-policy.js';
import { DatabaseWriter } from '../../src/pipeline/db-writer.js';

describe('consumer-first free AI retry queue', () => {
  const creditor = { source: { adapter_name: 'ibbi-public-announcement' }, candidate: { id: 'ibbi' } };
  const consumer = { source: { adapter_name: 'rss-rbi' }, candidate: { id: 'rbi' } };
  const other = { source: null, candidate: { id: 'unknown' } };

  it('prefers consumer cases without rejecting or publishing any creditor notice', () => {
    const ranked = prioritizeConsumerBacklog([creditor, consumer, other]);
    expect(ranked.map((row) => row.candidate.id)).toEqual(['rbi', 'unknown', 'ibbi']);
    expect(ranked).toHaveLength(3);
    expect([creditor, consumer, other].map((row) => row.candidate.id)).toEqual([
      'ibbi',
      'rbi',
      'unknown',
    ]);
  });

  it('preserves database ranking within the two source categories', () => {
    const creditor2 = { source: creditor.source, candidate: { id: 'ibbi2' } };
    const consumer2 = { source: consumer.source, candidate: { id: 'sebi' } };
    expect(
      prioritizeConsumerBacklog([creditor, consumer, creditor2, consumer2]).map(
        (row) => row.candidate.id,
      ),
    ).toEqual(['rbi', 'sebi', 'ibbi', 'ibbi2']);
  });

  it('direct writer selects from a wider pool, while outgoing work is still limited', async () => {
    const sourceDoc = (id: string, adapter_name: string) => ({
      id,
      keyword_score: 30,
      created_at: '2026-10-20T00:00:00Z',
      source_documents: {
        id: `source-${id}`,
        raw_text: 'Source-text evidence for review',
        sources: { adapter_name, domain: 'official.gov.in' },
      },
    });
    const rows = [
      sourceDoc('ibbi-new', 'ibbi-public-announcement'),
      sourceDoc('ibbi-old', 'ibbi-public-announcement'),
      sourceDoc('consumer', 'rss-rbi'),
    ];
    const query = {
      select() { return query; },
      in() { return query; },
      lt() { return query; },
      neq() { return query; },
      order() { return query; },
      limit(limit: number) {
        expect(limit).toBe(100);
        return Promise.resolve({ data: rows, error: null });
      },
    };
    const writer = new DatabaseWriter({
      from(name: string) {
        expect(name).toBe('candidate_documents');
        return query;
      },
    } as never);
    const results = await writer.getDeferredCandidateContexts(2);
    expect(results.map((row) => row.candidate.id)).toEqual(['consumer', 'ibbi-new']);
    expect(results).toHaveLength(2);
  });

  it('keeps the Supabase proxy implementation aligned with the direct writer', () => {
    const code = readFileSync(
      new URL(
        '../../../../supabase/functions/claimradar-crawler-db-proxy/index.ts',
        import.meta.url,
      ),
      'utf8',
    );
    const operation = code
      .split("case 'getDeferredCandidateContexts': {")[1]
      ?.split("default:", 1)[0];
    expect(operation).toContain('.limit(100)');
    expect(operation).toContain("adapter_name !== 'ibbi-public-announcement'");
    expect(operation).toContain("adapter_name === 'ibbi-public-announcement'");
    expect(operation).toContain('.slice(0, limit)');
  });
});
