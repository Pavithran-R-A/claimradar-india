import { getAdminDb } from '@/lib/admin-db';

/**
 * Audit trail writer for privileged admin actions.
 * Every state-changing server action must record an entry via this helper
 * (AGENTS.md: "Audit log entries for privileged state changes").
 */
export interface AuditEntry {
  /** Acting staff profile id. */
  actorId: string;
  /** Dot-namespaced action, e.g. `candidate.approved`, `source.toggled`. */
  action: string;
  /** Entity table name, e.g. `candidate_document`, `claimable`, `profile`. */
  entityType: string;
  entityId?: string | null;
  /** Relevant state before the change. */
  before?: Record<string, unknown> | null;
  /** Relevant state after the change. */
  after?: Record<string, unknown> | null;
  /** Free-form additional context (reasons, counts, etc.). */
  details?: Record<string, unknown>;
}

export async function writeAuditLog(entry: AuditEntry): Promise<{ error?: string }> {
  const changes: Record<string, unknown> = { ...(entry.details ?? {}) };
  if (entry.before !== undefined) changes.before = entry.before;
  if (entry.after !== undefined) changes.after = entry.after;

  const db = getAdminDb();
  const { error } = await db.from('audit_logs').insert({
    actor_id: entry.actorId,
    actor_type: 'staff_user',
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    changes,
  });

  if (error) {
    return { error: `Audit log write failed: ${error.message}` };
  }
  return {};
}
