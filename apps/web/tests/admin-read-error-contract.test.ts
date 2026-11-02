import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

describe('admin read failures remain visible', () => {
  it('keeps each source alert query independent', () => {
    const page = source('../app/admin/alerts/page.tsx');
    for (const field of ['sources', 'health', 'crawlErrors']) {
      expect(page).toContain(`queryErrors.${field}`);
    }
    expect(page).toContain("'unavailable'");
    expect(page).not.toContain('failingRes.error.message');
  });

  it('does not turn crawl detail query failures into empty results', () => {
    const page = source('../app/admin/crawl-runs/[id]/page.tsx');
    expect(page).toContain('sourcesRes.error');
    expect(page).toContain('errorsRes.error');
    expect(page).toContain('candidatesRes.error');
    expect(page).toContain('errorsError ?');
    expect(page).toContain('candidatesError ?');
    expect(page).not.toContain('runRes.error.message');
  });

  it('keeps claimable history unavailable when a query fails', () => {
    const page = source('../app/admin/claimables/[id]/page.tsx');
    for (const field of [
      'legalReviews',
      'assignments',
      'corrections',
      'takedowns',
      'versions',
      'events',
    ]) {
      expect(page).toContain(`queryErrors.${field}`);
    }
    expect(page).toContain('legalReviews.length === 0 ?');
    expect(page).toContain('versions.length === 0 ?');
    expect(page).not.toContain('claimRes.error.message');
  });

  it('does not report zero AI usage after count failures', () => {
    const page = source('../app/admin/ai-runs/page.tsx');
    expect(page).toContain('countRes.error');
    expect(page).toContain('todayRes.error');
    expect(page).toContain("countError ? 'Unavailable' : totalRuns");
    expect(page).toContain("todayError ? 'Unavailable' : todayRuns");
    expect(page).toContain('runsError ?');
    expect(page).toContain("if (countRes.error) countError = 'Total run count is unavailable.';");
    expect(page).toContain('else totalRuns = countRes.count ?? 0;');
  });
});
