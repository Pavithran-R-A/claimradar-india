import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isLegalClearanceCurrent,
  isPublicationDeadlineExpired,
} from '../../lib/editorial-publication-safety';

afterEach(() => vi.useRealTimers());

describe('editorial publish deadline gate', () => {
  it('accepts a real India calendar deadline through the final evening', () => {
    const lastDayAt2130IST = new Date('2026-10-14T16:00:00.000Z');
    expect(isPublicationDeadlineExpired('2026-10-14', lastDayAt2130IST)).toBe(false);
    const nextDayAt0001IST = new Date('2026-10-14T18:31:00.000Z');
    expect(isPublicationDeadlineExpired('2026-10-14', nextDayAt0001IST)).toBe(true);
  });
  it('fails closed for malformed calendar days and respects explicit timestamps', () => {
    const now = new Date('2026-10-12T13:00:00.000Z');
    expect(isPublicationDeadlineExpired('2026-02-30', now)).toBe(true);
    expect(isPublicationDeadlineExpired('bad date', now)).toBe(true);
    expect(isPublicationDeadlineExpired('2026-10-12T12:00:00Z', now)).toBe(true);
    expect(isPublicationDeadlineExpired('2026-10-12T14:00:00Z', now)).toBe(false);
    expect(isPublicationDeadlineExpired(null, now)).toBe(false);
  });
});

describe('post-edit legal review freshness', () => {
  const editedAt = '2026-10-12T14:00:00.000Z';
  it('accepts only a successful legal clearance at or after the latest content revision', () => {
    expect(isLegalClearanceCurrent('clear_to_publish', '2026-10-12T14:05:00Z', editedAt)).toBe(
      true,
    );
    expect(isLegalClearanceCurrent('clear_to_publish', editedAt, editedAt)).toBe(true);
    expect(isLegalClearanceCurrent('clear_to_publish', '2026-10-12T13:55:00Z', editedAt)).toBe(
      false,
    );
  });
  it('refuses negative, missing, or unparsable reviews', () => {
    expect(isLegalClearanceCurrent('blocked', '2026-10-12T15:00:00Z', editedAt)).toBe(false);
    expect(isLegalClearanceCurrent('needs_changes', '2026-10-12T15:00:00Z', editedAt)).toBe(false);
    expect(isLegalClearanceCurrent('clear_to_publish', null, editedAt)).toBe(false);
    expect(isLegalClearanceCurrent('clear_to_publish', 'garbage', editedAt)).toBe(false);
    expect(isLegalClearanceCurrent('clear_to_publish', editedAt, null)).toBe(false);
  });
});
