import { calculateDeadlineStatus } from '@claimradar/shared-types';

/** A dated notice closes after the FULL final local calendar day, not at 00:00 UTC. */
export function isPublicationDeadlineExpired(
  deadline: string | null,
  now: Date = new Date(),
): boolean {
  if (!deadline) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const parsed = new Date(deadline + 'T00:00:00.000Z');
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== deadline) {
      return true;
    }
    return calculateDeadlineStatus(deadline, { clockDate: now }).status === 'EXPIRED';
  }
  const epoch = Date.parse(deadline);
  return !Number.isFinite(epoch) || epoch < now.getTime();
}

/**
 * A legal approval attaches to reviewed content, not the same record ID forever.
 * Any edit since that clearance requires a fresh legal assessment.
 */
export function isLegalClearanceCurrent(
  decision: string | null | undefined,
  reviewedAt: string | null | undefined,
  claimUpdatedAt: string | null | undefined,
): boolean {
  if (decision !== 'clear_to_publish' || !reviewedAt || !claimUpdatedAt) return false;
  const reviewed = Date.parse(reviewedAt);
  const lastEdit = Date.parse(claimUpdatedAt);
  return Number.isFinite(reviewed) && Number.isFinite(lastEdit) && reviewed >= lastEdit;
}
