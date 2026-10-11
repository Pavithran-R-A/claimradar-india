import { describe, expect, it } from 'vitest';
import { DatabaseWriter } from '../../src/pipeline/db-writer.js';

type CandidateRow = {
  id: string;
  ai_extraction_status: string;
  ai_retry_count: number;
  ai_error_category: string | null;
  created_at: string;
  source_documents: {
    id: string;
    raw_text: string | null;
    sources: { domain: string };
  };
};

function makeRow(id: string, rawText: string | null, index: number): CandidateRow {
  return {
    id,
    ai_extraction_status: 'deferred',
    ai_retry_count: 0,
    ai_error_category: null,
    created_at: new Date(Date.UTC(2026, 8, 4, 0, index)).toISOString(),
    source_documents: {
      id: `document-${id}`,
      raw_text: rawText,
      sources: { domain: 'ibbi.gov.in' },
    },
  };
}

function writerWithRows(rows: CandidateRow[]) {
  const calls: Array<[string, unknown, unknown?]> = [];
  const query = {
    select(value: string) {
      calls.push(['select', value]);
      return this;
    },
    in(column: string, values: string[]) {
      calls.push(['in', column, values]);
      return this;
    },
    lt(column: string, value: number) {
      calls.push(['lt', column, value]);
      return this;
    },
    neq(column: string, value: string) {
      calls.push(['neq', column, value]);
      return this;
    },
    order(column: string) {
      calls.push(['order', column]);
      return this;
    },
    async limit(value: number) {
      calls.push(['limit', value]);
      // Model PostgREST: embedded !inner filters are applied before LIMIT,
      // and neq excludes NULL values as well as the empty string.
      const excludeBlankText = calls.some(
        ([name, column, value]) =>
          name === 'neq' && column === 'source_documents.raw_text' && value === '',
      );
      const filtered = excludeBlankText
        ? rows.filter((row) => row.source_documents.raw_text !== null && row.source_documents.raw_text !== '')
        : rows;
      return { data: filtered.slice(0, value), error: null };
    },
  };

  const writer = new DatabaseWriter({
    from(table: string) {
      expect(table).toBe('candidate_documents');
      return query;
    },
  });
  return { writer, calls };
}

describe('deferred AI backlog selection', () => {
  it('does not let empty older PDF records starve eligible candidates', async () => {
    const rows = [
      ...Array.from({ length: 6 }, (_, index) => makeRow(`empty-${index}`, '', index)),
      makeRow('eligible', 'Official creditor claims notice with evidence.', 7),
    ];
    const { writer, calls } = writerWithRows(rows);
    const result = await writer.getDeferredCandidateContexts(2);

    expect(result).toHaveLength(1);
    expect(result[0]?.candidate.id).toBe('eligible');
    expect(result[0]?.source?.domain).toBe('ibbi.gov.in');
    expect(calls).toContainEqual(['neq', 'source_documents.raw_text', '']);
    expect(calls.findIndex(([name]) => name === 'neq')).toBeLessThan(
      calls.findIndex(([name]) => name === 'limit'),
    );
  });

  it('still excludes missing source text and keeps the queue empty when nothing can be read', async () => {
    const { writer } = writerWithRows([makeRow('missing', null, 0), makeRow('empty', '', 1)]);
    expect(await writer.getDeferredCandidateContexts(2)).toEqual([]);
  });
});
