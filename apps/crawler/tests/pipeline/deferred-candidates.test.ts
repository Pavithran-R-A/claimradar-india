import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const selectionImplementations = [
  '../../src/pipeline/db-writer.ts',
  '../../../../supabase/functions/claimradar-crawler-db-proxy/index.ts',
];

describe('deferred AI backlog query contract', () => {
  it.each(selectionImplementations)('filters empty joined source text before limiting in %s', (path) => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    const queryStart = source.indexOf(".select('*, source_documents!inner(*, sources(*))')");
    const textFilter = source.indexOf(".neq('source_documents.raw_text', '')", queryStart);
    const queryLimit = source.indexOf('.limit(', textFilter);

    expect(queryStart).toBeGreaterThanOrEqual(0);
    expect(textFilter).toBeGreaterThan(queryStart);
    expect(queryLimit).toBeGreaterThan(textFilter);
  });
});
