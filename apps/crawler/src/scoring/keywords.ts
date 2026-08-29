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
  // ── High weight (10-15): Concrete actionable claim mechanisms ─────────────
  { term: 'unclaimed deposit', weight: 15 },
  { term: 'unclaimed amount', weight: 15 },
  { term: 'unclaimed dividend', weight: 15 },
  { term: 'investor refund portal', weight: 15 },
  { term: 'invitation of claims', weight: 15 },
  { term: 'proof of claim', weight: 15 },
  { term: 'last date for submission of claims', weight: 15 },
  { term: 'submit a claim', weight: 12 },
  { term: 'claim form', weight: 12 },
  { term: 'iepf', weight: 12 },
  { term: 'disgorgement distribution', weight: 15 },
  { term: 'recall and refund', weight: 15 },
  { term: 'deposit repayment portal', weight: 15 },
  { term: 'refund directed', weight: 10 },
  { term: 'refund ordered', weight: 10 },
  { term: 'customers shall be reimbursed', weight: 12 },
  { term: 'eligible depositors', weight: 10 },
  { term: 'eligible investors', weight: 10 },
  { term: 'cirp creditor claim', weight: 15 },
  { term: 'public notice for refund', weight: 15 },
  { term: 'for refund (phase', weight: 15 },
  { term: 'refund (phase', weight: 15 },
  { term: 'for refund', weight: 12 },
  { term: 'public notice in the matter of', weight: 12 },
  { term: 'submit claim applications', weight: 15 },

  // ── Medium weight (5-8): Supporting indicators (require combined signal) ──
  { term: 'refund', weight: 6 },
  { term: 'reimbursement', weight: 6 },
  { term: 'compensation', weight: 5 },
  { term: 'settlement', weight: 6 },
  { term: 'disgorgement', weight: 8 },
  { term: 'restitution', weight: 8 },
  { term: 'payout', weight: 6 },
  { term: 'redressal', weight: 5 },
];

export const NEGATIVE_KEYWORDS: KeywordEntry[] = [
  // ── High weight (15-25): Immediate rejection of administrative noise ──────
  { term: 'consumer awareness program', weight: 25 },
  { term: 'consumer outreach program', weight: 25 },
  { term: 'consumer education workshop', weight: 25 },
  { term: 'awareness campaign', weight: 25 },
  { term: 'outreach event', weight: 25 },
  { term: 'workshop at', weight: 20 },
  { term: 'release order for recovery certificate', weight: 25 },
  { term: 'completion of recovery certificate', weight: 25 },
  { term: 'adjudication order in respect of', weight: 25 },
  { term: 'adjudication order in the matter of', weight: 25 },
  { term: 'settlement order in the matter of', weight: 25 },
  { term: 'settlement order in respect of', weight: 25 },
  { term: 'consent order in the matter of', weight: 25 },
  { term: 'consent order in respect of', weight: 25 },
  { term: 'settlement proceedings in the matter of', weight: 25 },
  { term: 'illiquid stock options', weight: 20 },
  { term: 'monetary penalty payable to', weight: 20 },
  { term: 'vacancy', weight: 20 },
  { term: 'recruitment', weight: 20 },
  { term: 'tender', weight: 20 },
  { term: 'procurement', weight: 20 },
  { term: 'appointment', weight: 15 },
  { term: 'speech', weight: 15 },
  { term: 'seminar', weight: 20 },
  { term: 'conference', weight: 15 },
  { term: 'training', weight: 15 },
  { term: 'rbi imposes monetary penalty', weight: 50 },
  { term: 'imposes monetary penalty on', weight: 50 },
  { term: 'monetary penalty on', weight: 40 },
  { term: 'deficiencies in regulatory compliance', weight: 35 },
  { term: 'not intended to pronounce upon the validity of any transaction', weight: 40 },
  { term: 'without prejudice to any other action', weight: 25 },
  { term: 'form g', weight: 50 },
  { term: 'invitation for expression of interest', weight: 50 },
  { term: 'expression of interest from prospective resolution applicants', weight: 50 },
  { term: 'prospective resolution applicant', weight: 50 },
  { term: 'resolution applicant', weight: 35 },
  { term: 'receipt of expression of interest', weight: 40 },
  { term: 'invitation of resolution plans', weight: 40 },
  { term: 'employee transfer', weight: 20 },
  { term: 'annual report', weight: 15 },
  { term: 'aria in html', weight: 25 },
  { term: 'w3c recommendation', weight: 25 },
];

export const DEFAULT_CANDIDATE_THRESHOLD = 30;
