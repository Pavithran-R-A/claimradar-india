import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const actions = readFileSync(new URL('../../app/admin/actions.ts', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL(
    '../../../../supabase/migrations/20261102150000_atomic_admin_candidate_actions.sql',
    import.meta.url,
  ),
  'utf8',
);

describe('candidate publication writes are atomic', () => {
  it('routes decisions and promotion through transactional RPCs', () => {
    expect(actions).toContain("'approve_candidate_with_event'");
    expect(actions).toContain("'reject_candidate_with_event'");
    expect(actions).toContain("'promote_candidate_with_source'");
  });

  it('locks candidate state before decision writes', () => {
    for (const name of ['approve_candidate_with_event', 'reject_candidate_with_event']) {
      const body = migration.split(`FUNCTION public.${name}`)[1]?.split('$$;')[0] ?? '';
      expect(body).toContain('FOR UPDATE');
      expect(body).toContain('publication_events');
      expect(body).toContain('audit_logs');
    }
    const approve =
      migration.split('FUNCTION public.approve_candidate_with_event')[1]?.split('$$;')[0] ?? '';
    expect(approve).toContain('p_expected_updated_at timestamptz');
    expect(approve).toContain('IS DISTINCT FROM p_expected_updated_at');
  });

  it('makes promotion event, source, and audit one transaction', () => {
    const body =
      migration.split('FUNCTION public.promote_candidate_with_source')[1]?.split('$$;')[0] ?? '';
    expect(body).toContain('FOR UPDATE');
    expect(body).toContain('already_promoted');
    expect(body).toContain('claim_sources');
    expect(body).toContain('publication_events');
    expect(body).toContain('audit_logs');
  });

  it('restricts execution to service role', () => {
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.approve_candidate_with_event\(uuid, uuid, timestamptz\)[\s\S]+FROM PUBLIC, anon, authenticated/i,
    );
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.promote_candidate_with_source[\s\S]+FROM PUBLIC, anon, authenticated/i,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.promote_candidate_with_source[\s\S]+TO service_role/i,
    );
  });
});
