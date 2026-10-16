import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DatabaseWriter } from './db-writer.js';

type Row = Record<string, unknown>;

function createDb(
  runs: Row[],
  children: Row[],
  options: { failSourceUpdate?: boolean } = {},
) {
  const tables: Record<string, Row[]> = {
    crawl_runs: runs,
    crawl_run_sources: children,
  };
  return {
    from(table: string) {
      const predicates: Array<(row: Row) => boolean> = [];
      let updates: Row | null = null;
      const query = {
        select(_columns: string) {
          return query;
        },
        update(changes: Row) {
          updates = changes;
          return query;
        },
        in(column: string, values: string[]) {
          predicates.push((row) => values.includes(String(row[column])));
          return query;
        },
        lt(column: string, value: string) {
          predicates.push((row) => String(row[column]) < value);
          return Promise.resolve(finish());
        },
        eq(column: string, value: string) {
          predicates.push((row) => row[column] === value);
          return Promise.resolve(finish());
        },
      };
      function finish() {
        const matching = (tables[table] ?? []).filter((row) =>
          predicates.every((predicate) => predicate(row)),
        );
        if (updates !== null) {
          if (table === 'crawl_run_sources' && options.failSourceUpdate) {
            return { error: { message: 'simulated child update failure' } };
          }
          matching.forEach((row) => Object.assign(row, updates));
          return { error: null };
        }
        return { data: matching, error: null };
      }
      return query;
    },
  };
}

describe('stale crawl reconciliation', () => {
  it('closes interrupted children, preserves completed children and active crawls', async () => {
    const old = '2026-10-01T00:00:00.000Z';
    const runs: Row[] = [
      { id: 'abandoned', status: 'running', started_at: old },
      { id: 'failed-earlier', status: 'failed', started_at: old },
      { id: 'active', status: 'running', started_at: new Date().toISOString() },
    ];
    const children: Row[] = [
      { id: 'child-a', crawl_run_id: 'abandoned', status: 'running' },
      { id: 'child-b', crawl_run_id: 'abandoned', status: 'completed' },
      { id: 'child-c', crawl_run_id: 'failed-earlier', status: 'running' },
      { id: 'child-d', crawl_run_id: 'active', status: 'running' },
    ];

    const writer = new DatabaseWriter(createDb(runs, children) as never);
    expect(await writer.markStaleCrawlRuns(30)).toBe(1);
    expect(runs.map((row) => row.status)).toEqual(['failed', 'failed', 'running']);
    expect(children.map((row) => row.status)).toEqual([
      'failed',
      'completed',
      'failed',
      'running',
    ]);
    expect(children[0]?.completed_at).toBeTruthy();
    expect(children[0]?.error_message).toContain('Interrupted');
    expect(children[1]?.completed_at).toBeUndefined();

    const firstCompletedAt = children[0]?.completed_at;
    expect(await writer.markStaleCrawlRuns(30)).toBe(0);
    expect(children[0]?.completed_at).toBe(firstCompletedAt);
  });

  it('refuses parent closure if a child reconciliation update fails', async () => {
    const runs: Row[] = [
      { id: 'interrupted', status: 'running', started_at: '2026-10-01T00:00:00.000Z' },
    ];
    const children: Row[] = [
      { id: 'source', crawl_run_id: 'interrupted', status: 'running' },
    ];
    const writer = new DatabaseWriter(
      createDb(runs, children, { failSourceUpdate: true }) as never,
    );
    await expect(writer.markStaleCrawlRuns(30)).rejects.toThrow(
      'Failed to close stale crawl_run_sources',
    );
    expect(runs[0]?.status).toBe('running');
    expect(children[0]?.status).toBe('running');
  });

  it('keeps edge-proxy reconciliation and the direct writer contract aligned', () => {
    const proxy = readFileSync(
      new URL('../../../../supabase/functions/claimradar-crawler-db-proxy/index.ts', import.meta.url),
      'utf8',
    );
    const block = proxy.split("case 'markStaleCrawlRuns': {")[1]?.split(
      "case 'createCrawlRunSource': {",
    )[0];
    expect(block).toContain(".in('status', ['running', 'failed'])");
    expect(block).toContain(".from('crawl_run_sources')");
    expect(block).toContain(".eq('status', 'running')");
    expect(block).toContain('CLOSE_STALE_CRAWL_RUN_SOURCES');
    expect(block).toContain('runningIds.length');
  });
});
