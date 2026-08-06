import { describe, it, expect } from 'vitest';
import { evaluateSourceHealth, recordFetchResult } from '../../src/freshness/source-health.js';
import { evaluateClaimFreshness } from '../../src/freshness/claim-freshness.js';

describe('Source Freshness Runtime Module', () => {
  const now = new Date('2026-08-05T00:00:00.000Z');

  it('Rule 1: First successful fetch produces healthy state', () => {
    const input = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: now,
      consecutiveFailureCount: 0,
    };
    const health = evaluateSourceHealth(input, now);
    expect(health.status).toBe('healthy');
    expect(health.shouldAttemptFetch).toBe(false);
  });

  it('Rule 2 & 3: Unchanged successful fetch updates last success date', () => {
    const prev = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-08-04T00:00:00.000Z'),
      consecutiveFailureCount: 0,
    };
    const res = recordFetchResult(prev, { success: true, contentChanged: false }, now);
    expect(res.consecutiveFailureCount).toBe(0);
    expect(res.lastSuccessfulCheck?.toISOString()).toBe(now.toISOString());
    expect(res.newHealth.status).toBe('healthy');
  });

  it('Rule 4: Single transient failure increments count without failing state', () => {
    const prev = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: now,
      consecutiveFailureCount: 0,
    };
    const res = recordFetchResult(
      prev,
      { success: false, contentChanged: false, errorCategory: 'TIMEOUT' },
      now,
    );
    expect(res.consecutiveFailureCount).toBe(1);
    expect(res.newHealth.status).toBe('healthy');
  });

  it('Rule 5: 3 consecutive failures move source to failing', () => {
    const input = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-08-01T00:00:00.000Z'),
      consecutiveFailureCount: 3,
    };
    const health = evaluateSourceHealth(input, now);
    expect(health.status).toBe('failing');
    expect(health.shouldAttemptFetch).toBe(true);
  });

  it('Rule 6: Excess age moves source to delayed or stale', () => {
    const delayedInput = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-08-03T10:00:00.000Z'), // 38 hours ago (> 1.5x)
      consecutiveFailureCount: 0,
    };
    expect(evaluateSourceHealth(delayedInput, now).status).toBe('delayed');

    const staleInput = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-07-30T00:00:00.000Z'), // > 3x
      consecutiveFailureCount: 0,
    };
    expect(evaluateSourceHealth(staleInput, now).status).toBe('stale');
  });

  it('Rule 7: Disabled sources remain disabled', () => {
    const input = {
      isCurrentlyEnabled: false,
      expectedCheckFrequencyHours: 24,
      consecutiveFailureCount: 0,
    };
    const health = evaluateSourceHealth(input, now);
    expect(health.status).toBe('disabled');
    expect(health.shouldAttemptFetch).toBe(false);
  });

  it('Rule 8: Successful recovery restores healthy state', () => {
    const failing = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-08-01T00:00:00.000Z'),
      consecutiveFailureCount: 4,
    };
    const res = recordFetchResult(failing, { success: true, contentChanged: true }, now);
    expect(res.consecutiveFailureCount).toBe(0);
    expect(res.newHealth.status).toBe('healthy');
  });

  it('Rules 9 & 10: Source failure never alters procedural legal status or closes claim', () => {
    const claim = {
      claimId: 'claim-101',
      sourceHealthState: 'failing' as const,
      proceduralStatus: 'open',
      isOfficialRouteValid: true,
    };
    const res = evaluateClaimFreshness(claim, now);
    expect(res.proceduralStatusUnchanged).toBe(true);
    expect(res.displayStatus).toBe('open');
  });

  it('Rule 11: Closing-soon claims use 24h verification threshold', () => {
    const closingSoon = {
      claimId: 'claim-102',
      deadlineDate: new Date('2026-08-08T00:00:00.000Z'), // 3 days away
      lastVerifiedAt: new Date('2026-08-03T12:00:00.000Z'), // 36 hours ago
      sourceHealthState: 'healthy' as const,
      proceduralStatus: 'closing_soon',
      isOfficialRouteValid: true,
    };
    const res = evaluateClaimFreshness(closingSoon, now);
    expect(res.needsReverification).toBe(true); // > 24 hours
  });

  it('Rule 12: Actionable status holds when official route and deadline remain valid', () => {
    const oldOrder = {
      claimId: 'claim-103',
      deadlineDate: new Date('2026-09-01T00:00:00.000Z'),
      lastVerifiedAt: new Date('2026-08-01T00:00:00.000Z'),
      sourceHealthState: 'healthy' as const,
      proceduralStatus: 'open',
      isOfficialRouteValid: true,
    };
    const res = evaluateClaimFreshness(oldOrder, now);
    expect(res.isActionable).toBe(true);
  });

  it('Rule 13: Stale/failing active records display explicit warning', () => {
    const staleClaim = {
      claimId: 'claim-104',
      sourceHealthState: 'stale' as const,
      proceduralStatus: 'open',
      isOfficialRouteValid: true,
    };
    const res = evaluateClaimFreshness(staleClaim, now);
    expect(res.freshnessWarning).toContain('Upstream source currently delayed or unverified');
  });

  it('Rule 4b: Failure preserves prior success/content-change timestamps (never invents or erases)', () => {
    const prevSuccess = new Date('2026-08-04T06:00:00.000Z');
    const prevContentChange = new Date('2026-08-02T12:00:00.000Z');
    const prev = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: prevSuccess,
      lastContentChange: prevContentChange,
      consecutiveFailureCount: 1,
    };
    const res = recordFetchResult(
      prev,
      { success: false, contentChanged: false, errorCategory: 'HTTP_403' },
      now,
    );
    // Attempt timestamp advances, but success/content-change history is untouched.
    expect(res.lastAttemptedCheck.toISOString()).toBe(now.toISOString());
    expect(res.lastSuccessfulCheck?.toISOString()).toBe(prevSuccess.toISOString());
    expect(res.lastContentChange?.toISOString()).toBe(prevContentChange.toISOString());
    expect(res.consecutiveFailureCount).toBe(2);
    // No deadline or claim lifecycle concept is produced by a fetch failure.
  });

  it('Rule 2b: Unchanged success preserves lastContentChange; content change updates it', () => {
    const prevContentChange = new Date('2026-08-02T12:00:00.000Z');
    const prev = {
      isCurrentlyEnabled: true,
      expectedCheckFrequencyHours: 24,
      lastSuccessfulCheck: new Date('2026-08-04T00:00:00.000Z'),
      lastContentChange: prevContentChange,
      consecutiveFailureCount: 0,
    };
    const unchanged = recordFetchResult(prev, { success: true, contentChanged: false }, now);
    expect(unchanged.lastContentChange?.toISOString()).toBe(prevContentChange.toISOString());

    const changed = recordFetchResult(prev, { success: true, contentChanged: true }, now);
    expect(changed.lastContentChange?.toISOString()).toBe(now.toISOString());
  });

  it('Rules 9 & 10b: Source failure never invents a deadline, removes evidence, or changes claim fields', () => {
    const deadline = new Date('2026-09-15T00:00:00.000Z');
    const claim = {
      claimId: 'claim-105',
      deadlineDate: deadline,
      lastVerifiedAt: new Date('2026-08-05T00:00:00.000Z'),
      sourceHealthState: 'failing' as const,
      proceduralStatus: 'open',
      isOfficialRouteValid: true,
    };
    const res = evaluateClaimFreshness(claim, now);
    // Evaluation is read-only: procedural status and displayed status are unchanged,
    // the deadline is echoed (never invented or mutated), and the claim stays actionable
    // because the official route and deadline remain valid despite the failing source.
    expect(res.proceduralStatusUnchanged).toBe(true);
    expect(res.displayStatus).toBe('open');
    expect(res.isActionable).toBe(true);
    expect(claim.deadlineDate).toEqual(deadline); // input untouched — no invented deadlines
  });
});
