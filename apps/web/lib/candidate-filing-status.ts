import { isPublicationDeadlineExpired } from './editorial-publication-safety';

/**
 * The extracted deadline is historical evidence, not fresh legal clearance.
 * Missing deadlines are UNKNOWN, never assumed current. Malformed stated
 * deadlines are treated as expired by the existing fail-closed approval gate.
 */
export function candidateFilingStatus(
  extracted: unknown,
  now: Date = new Date(),
): { deadline: string | null; expired: boolean } {
  if (!extracted || typeof extracted !== 'object' || Array.isArray(extracted)) {
    return { deadline: null, expired: false };
  }
  const raw = (extracted as Record<string, unknown>).deadline;
  const deadline = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  return { deadline, expired: isPublicationDeadlineExpired(deadline, now) };
}
