/**
 * Weighted keyword classifier for claimable-candidate scoring.
 *
 * Scores a document from 0–100 based on the frequency and weight of
 * positive and negative keyword matches.  Keywords found in the title
 * receive a 2× weight boost because they are stronger signals.
 *
 * Spec requirements:
 *  - Record why a candidate passed / failed (reasoning string)
 *  - Make thresholds configurable
 *  - Do not use AI for clearly irrelevant material
 */

import {
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
  DEFAULT_CANDIDATE_THRESHOLD,
  type KeywordEntry,
} from './keywords.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface KeywordMatch {
  term: string;
  weight: number;
  /** Number of times the term appeared (title matches counted separately with 2× boost). */
  count: number;
}

export interface ScoringResult {
  /** Final normalized score in range 0–100. */
  score: number;
  /** Whether the document passes the candidate threshold. */
  isCandidate: boolean;
  positiveMatches: KeywordMatch[];
  negativeMatches: KeywordMatch[];
  /** Human-readable explanation of the scoring decision. */
  reasoning: string;
}

export interface ScoringInput {
  text: string;
  title?: string;
  source?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escape a string for use as a literal in a regular expression.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count non-overlapping occurrences of `term` in `haystack`.
 * Both are expected to already be lowercased.
 */
function countOccurrences(haystack: string, term: string): number {
  if (!term || !haystack) return 0;
  const pattern = new RegExp(escapeRegex(term), 'g');
  const matches = haystack.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Score a list of keywords against a body of text (and optional title).
 *
 * Returns the weighted sum and the per-keyword match details.
 */
function evaluateKeywords(
  lowerText: string,
  lowerTitle: string,
  keywords: KeywordEntry[],
): { total: number; matches: KeywordMatch[] } {
  let total = 0;
  const matches: KeywordMatch[] = [];

  for (const { term, weight } of keywords) {
    const lowerTerm = term.toLowerCase();

    const textCount = countOccurrences(lowerText, lowerTerm);
    const titleCount = countOccurrences(lowerTitle, lowerTerm);

    // Title matches count double.
    const effectiveCount = textCount + titleCount * 2;

    if (effectiveCount > 0) {
      total += weight * effectiveCount;
      matches.push({ term, weight, count: effectiveCount });
    }
  }

  return { total, matches };
}

// ---------------------------------------------------------------------------
// Main scorer
// ---------------------------------------------------------------------------

/**
 * Score a document for claimable-candidate likelihood.
 *
 * @param input     The document text (and optional title/source metadata).
 * @param threshold Score (0–100) at or above which the document is a candidate.
 *                  Defaults to `DEFAULT_CANDIDATE_THRESHOLD` (15).
 */
export function scoreDocument(
  input: ScoringInput,
  threshold: number = DEFAULT_CANDIDATE_THRESHOLD,
): ScoringResult {
  const lowerText = (input.text ?? '').toLowerCase();
  const lowerTitle = (input.title ?? '').toLowerCase();

  // Evaluate positive and negative keyword lists.
  const positive = evaluateKeywords(lowerText, lowerTitle, POSITIVE_KEYWORDS);
  const negative = evaluateKeywords(lowerText, lowerTitle, NEGATIVE_KEYWORDS);

  // Raw score: positive minus negative, clamped to [0, 100].
  let raw = positive.total - negative.total;
  let score = Math.max(0, Math.min(100, raw));

  // Explicit deterministic context overrides:
  // 1. Regulatory monetary penalties without explicit customer refund/repayment routes
  const combinedText = `${lowerTitle} ${lowerText}`;
  const isRegulatoryPenalty =
    lowerTitle.includes('imposes monetary penalty') ||
    lowerTitle.includes('monetary penalty on') ||
    combinedText.includes('rbi imposes monetary penalty') ||
    combinedText.includes('deficiencies in regulatory compliance');

  const hasExplicitRestitutionRoute =
    combinedText.includes('repay depositors') ||
    combinedText.includes('repayment of deposits') ||
    combinedText.includes('refund to depositors') ||
    combinedText.includes('refund to customers') ||
    combinedText.includes('reimbursement to customers') ||
    combinedText.includes('portal for claims') ||
    combinedText.includes('submit claim') ||
    combinedText.includes('invitation of claims') ||
    combinedText.includes('file claim') ||
    combinedText.includes('proof of claim');

  if (isRegulatoryPenalty && !hasExplicitRestitutionRoute) {
    score = 0;
  }

  // 2. IBBI Form G / Resolution Applicant Expression of Interest notices
  const isFormGEoi =
    lowerTitle.includes('form g') ||
    lowerTitle.includes('expression of interest') ||
    combinedText.includes('expression of interest from prospective resolution applicants') ||
    combinedText.includes('prospective resolution applicant') ||
    combinedText.includes('receipt of expression of interest');

  const isCreditorClaimNotice =
    lowerTitle.includes('claims deadline') ||
    lowerTitle.includes('public announcement of corporate insolvency') ||
    combinedText.includes('proof of claim') ||
    combinedText.includes('invitation of claims from creditors') ||
    combinedText.includes('submission of claims by creditors');

  if (isFormGEoi && !isCreditorClaimNotice) {
    score = 0;
  }

  const isCandidate = score >= threshold;

  // Build reasoning string.
  const positiveSummary =
    positive.matches.length > 0
      ? positive.matches.map((m) => `"${m.term}" (×${m.count}, w${m.weight})`).join(', ')
      : 'none';

  const negativeSummary =
    negative.matches.length > 0
      ? negative.matches.map((m) => `"${m.term}" (×${m.count}, w${m.weight})`).join(', ')
      : 'none';

  const decision = isCandidate ? 'PASSES' : 'FAILS';
  const sourceNote = input.source ? ` [source: ${input.source}]` : '';

  let contextNote = '';
  if (isRegulatoryPenalty && !hasExplicitRestitutionRoute) {
    contextNote = ' [Overridden: regulatory penalty without customer restitution route]';
  } else if (isFormGEoi && !isCreditorClaimNotice) {
    contextNote = ' [Overridden: Form G resolution applicant EOI (non-claimant)]';
  }

  const reasoning =
    `Scored ${score}/100 (threshold ${threshold}). ${decision}${sourceNote}${contextNote}. ` +
    `Positive: ${positiveSummary}. Negative: ${negativeSummary}.`;

  return {
    score,
    isCandidate,
    positiveMatches: positive.matches,
    negativeMatches: negative.matches,
    reasoning,
  };
}
