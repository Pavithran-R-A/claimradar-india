import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
const actions = source('../../app/admin/editorial-actions.ts');
const migration = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../supabase/migrations/20261102140000_atomic_publication_actions.sql',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('atomic publication actions', () => {
  it('routes publish and archive through transaction RPCs', () => {
    expect(actions).toContain("db.rpc('publish_claimable_with_audit'");
    expect(actions).toContain("db.rpc('archive_claimable_with_audit'");
    expect(actions).toContain('p_expected_updated_at: claimable.updated_at');
    expect(actions).not.toContain(
      ".from('publication_events').insert({\n    claimable_id: claimableId",
    );
  });

  it('writes state, event, and audit inside locked RPCs', () => {
    for (const fn of ['publish_claimable_with_audit', 'archive_claimable_with_audit']) {
      const body = migration.split(`FUNCTION public.${fn}(`)[1]?.split('$$;')[0] ?? '';
      expect(body).toContain('SECURITY DEFINER');
      expect(body).toContain('FOR UPDATE');
      expect(body).toContain('UPDATE public.claimables');
      expect(body).toContain('INSERT INTO public.publication_events');
      expect(body).toContain('INSERT INTO public.audit_logs');
    }
    expect(migration).toContain('TO service_role');
    expect(migration).toContain('FROM authenticated');
    expect(migration).toContain('FROM anon');
    expect(migration).toContain("SET search_path = ''");
  });
});
