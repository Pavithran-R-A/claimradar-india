import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const selectionImplementations = [
  '../../src/pipeline/db-writer.ts',
  '../../../../supabase/functions/claimradar-crawler-db-proxy/index.ts',
];

describe('deferred AI backlog query contract', () => {
  it.each(selectionImplementations)('filters source text before limit in %s', (path) => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const queryStart = source.indexOf(".select('*, source_documents!inner(*, sources(*))')");
    const textFilter = source.indexOf(".neq('source_documents.raw_text', '')", queryStart);
    const priorityScore = source.indexOf(".order('keyword_score', { ascending: false })", textFilter);
    const priorityRecency = source.indexOf(".order('created_at', { ascending: false })", priorityScore);
    const queryLimit = source.indexOf('.limit(', priorityRecency);

    expect(queryStart).toBeGreaterThanOrEqual(0);
    expect(textFilter).toBeGreaterThan(queryStart);
    expect(priorityScore).toBeGreaterThan(textFilter);
    expect(priorityRecency).toBeGreaterThan(priorityScore);
    expect(queryLimit).toBeGreaterThan(priorityRecency);
  });
});
