import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('admin directory contracts', () => {
  it('keeps all-status company filters unfiltered', () => {
    const page = read('../app/admin/companies/page.tsx');
    expect(page).toContain("const includeAll = pubFilter === 'all'");
    expect(page).toContain("{ value: 'all', label: 'All statuses' }");
    expect(page).toContain('if (!includeAll) query = query.eq');
  });

  it('paginates every profile and reports the true count', () => {
    const page = read('../app/admin/users/page.tsx');
    expect(page).toContain("{ count: 'exact' }");
    expect(page).toContain('.range(offset, offset + PAGE_SIZE - 1)');
    expect(page).toContain('subtitle={`${totalProfiles} profiles');
    expect(page).toContain('Page {page} of {totalPages}');
  });

  it('loads legal reviews beyond the first result batch', () => {
    const page = read('../app/admin/reviews/page.tsx');
    expect(page).toContain('for (let offset = 0; ; offset += batchSize)');
    expect(page).toContain('.range(offset, offset + batchSize - 1)');
    expect(page).toContain("error = 'Legal review queue is unavailable.'");
  });

  it('surfaces source toggle failures and refreshes state', () => {
    const button = read('../app/admin/sources/toggle-source-button.tsx');
    expect(button).toContain("setFeedback(");
    expect(button).toContain("role={feedback.kind === 'error' ? 'alert' : 'status'}");
    expect(button).toContain('router.refresh()');
  });

  it('associates staff form labels with their controls', () => {
    const candidate = read('../app/admin/candidates/[id]/page.tsx');
    const requests = read('../app/admin/corrections/page.tsx');
    expect(candidate).toContain('htmlFor={`rejection-reason-${candidate.id}`}');
    expect(candidate).toContain('id={`rejection-reason-${candidate.id}`}');
    expect(requests).toContain('htmlFor={`correction-decision-${c.id}`}');
    expect(requests).toContain('id={`correction-decision-${c.id}`}');
    expect(requests).toContain('Acceptance records this request only.');
  });
});
