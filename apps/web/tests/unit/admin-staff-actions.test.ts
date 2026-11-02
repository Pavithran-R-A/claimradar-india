import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminDb } from '@/lib/admin-db';
import { getActionActor } from '@/app/admin/_lib/roles';
import { requireRole } from '@/lib/auth';
import { toggleSource } from '@/app/admin/actions';
import { assignReview, completeReviewAssignment, submitLegalReview, updateUserRole } from '@/app/admin/editorial-actions';
import { readFileSync } from 'node:fs';

vi.mock('@/lib/admin-db', () => ({ getAdminDb: vi.fn() }));
vi.mock('@/lib/auth', () => ({ requireRole: vi.fn() }));
vi.mock('@/app/admin/_lib/roles', () => ({ ADMINS_ONLY: [], EDITORIAL: [], LEGAL: [], getActionActor: vi.fn(), unauthorized: () => ({ error: 'Unauthorized' }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const actor = { id: '00000000-0000-4000-8000-000000000001', role: 'admin' as const };
const id = '00000000-0000-4000-8000-000000000002';
const rpc = vi.fn();
const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

describe('atomic staff admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActionActor).mockResolvedValue(actor as never);
    vi.mocked(requireRole).mockResolvedValue(actor as never);
    rpc.mockResolvedValue({ data: { success: true, claimable_id: id }, error: null });
    vi.mocked(getAdminDb).mockReturnValue({ rpc } as never);
  });

  it('toggles sources through one audited RPC', async () => {
    expect(await toggleSource(id)).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith('toggle_source_with_audit', { p_actor_id: actor.id, p_source_id: id });
  });

  it('submits legal reviews through one audited RPC', async () => {
    await submitLegalReview(id, form({ decision: 'clear_to_publish', findings: 'Reviewed the filing.', expected_updated_at: '2026-11-02T07:00:00.000Z' }));
    expect(rpc).toHaveBeenCalledWith('submit_legal_review_with_audit', { p_actor_id: actor.id, p_claimable_id: id, p_decision: 'clear_to_publish', p_findings: 'Reviewed the filing.', p_expected_updated_at: '2026-11-02T07:00:00.000Z' });
  });

  it('assigns reviews through one audited RPC', async () => {
    await assignReview(id, form({ assigned_to: '', notes: 'Review filing.' }));
    expect(rpc).toHaveBeenCalledWith('assign_review_with_audit', { p_actor_id: actor.id, p_claimable_id: id, p_assigned_to: null, p_notes: 'Review filing.' });
  });

  it('completes assignments through one audited RPC', async () => {
    await completeReviewAssignment(id);
    expect(rpc).toHaveBeenCalledWith('complete_review_assignment_with_audit', { p_actor_id: actor.id, p_assignment_id: id });
  });

  it('updates roles through one audited RPC', async () => {
    await updateUserRole(id, form({ role: 'editor' }));
    expect(rpc).toHaveBeenCalledWith('update_user_role_with_audit', { p_actor_id: actor.id, p_user_id: id, p_role: 'editor' });
  });

  it('locks role changes and restricts all RPC grants', () => {
    const sql = readFileSync(new URL('../../../../supabase/migrations/20261102160000_atomic_staff_admin_mutations.sql', import.meta.url), 'utf8');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain("v_admin_count <= 1");
    expect(sql).toContain('p_expected_updated_at timestamptz');
    expect(sql).toContain('FOR UPDATE');
    expect(sql).toContain('IS DISTINCT FROM p_expected_updated_at');
    expect((sql.match(/GRANT EXECUTE ON FUNCTION/g) ?? []).length).toBe(5);
    expect((sql.match(/FROM PUBLIC, anon, authenticated/g) ?? []).length).toBe(5);
  });
});
