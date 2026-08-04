/**
 * Keyword lists and weights for the claimable-candidate classifier.
 *
 * Weights range from 1 (weak signal) to 10 (very strong signal).
 * The classifier sums weighted occurrences and normalizes to a 0–100 score.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeywordEntry {
  term: string;
  /** Signal strength: 1 (weak) – 10 (very strong). */
  weight: number;
}

// ---------------------------------------------------------------------------
// Positive keywords — signals that a document IS a claimable candidate
// ---------------------------------------------------------------------------

export const POSITIVE_KEYWORDS: KeywordEntry[] = [
  // ── High weight (8-10): Strong claimable indicators ──────────────────────
  { term: 'refund', weight: 10 },
  { term: 'reimbursement', weight: 9 },
  { term: 'compensation', weight: 9 },
  { term: 'compensate', weight: 9 },
  { term: 'settlement', weight: 9 },
  { term: 'class action', weight: 10 },
  { term: 'collective complaint', weight: 10 },
  { term: 'representative complaint', weight: 10 },
  { term: 'recall and refund', weight: 10 },

  // ── Medium-high weight (6-8): Likely claimable ────────────────────────────
  { term: 'claim form', weight: 8 },
  { term: 'submit a claim', weight: 8 },
  { term: 'register claims', weight: 8 },
  { term: 'refund directed', weight: 9 },
  { term: 'refund ordered', weight: 9 },
  { term: 'amount shall be returned', weight: 8 },
  { term: 'customers shall be reimbursed', weight: 9 },
  { term: 'relief to consumers', weight: 8 },
  { term: 'invite applications', weight: 7 },
  { term: 'affected consumers', weight: 7 },
  { term: 'affected customers', weight: 7 },
  { term: 'eligible consumers', weight: 7 },
  { term: 'public notice', weight: 6 },

  // ── Medium weight (4-6): Supporting indicators ────────────────────────────
  { term: 'depositors', weight: 6 },
  { term: 'shareholders', weight: 5 },
  { term: 'policyholders', weight: 6 },
  { term: 'homebuyers', weight: 6 },
  { term: 'investors', weight: 5 },
  { term: 'consumer forum', weight: 5 },
  { term: 'consumer court', weight: 5 },
  { term: 'consumer protection', weight: 5 },
  { term: 'penalty', weight: 4 },
  { term: 'restitution', weight: 7 },
];

// ---------------------------------------------------------------------------
// Negative keywords — signals that a document is NOT a claimable candidate
// ---------------------------------------------------------------------------

export const NEGATIVE_KEYWORDS: KeywordEntry[] = [
  { term: 'vacancy', weight: 8 },
  { term: 'recruitment', weight: 8 },
  { term: 'tender', weight: 8 },
  { term: 'procurement', weight: 8 },
  { term: 'appointment', weight: 7 },
  { term: 'speech', weight: 6 },
  { term: 'seminar', weight: 7 },
  { term: 'conference', weight: 7 },
  { term: 'training', weight: 6 },
  { term: 'examination', weight: 7 },
  { term: 'routine administrative order', weight: 8 },
  { term: 'employee transfer', weight: 8 },
  { term: 'job opening', weight: 8 },
  { term: 'hiring', weight: 8 },
  { term: 'annual report', weight: 5 },
  { term: 'policy circular', weight: 5 },
  { term: 'guidelines issued', weight: 4 },
];

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Default score threshold (0–100) above which a document is considered a
 * claimable candidate.  Can be overridden at call time.
 */
export const DEFAULT_CANDIDATE_THRESHOLD = 15;
