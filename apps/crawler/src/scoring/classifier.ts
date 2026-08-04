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
  const raw = positive.total - negative.total;
  const score = Math.max(0, Math.min(100, raw));

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

  const reasoning =
    `Scored ${score}/100 (threshold ${threshold}). ${decision}${sourceNote}. ` +
    `Positive: ${positiveSummary}. Negative: ${negativeSummary}.`;

  return {
    score,
    isCandidate,
    positiveMatches: positive.matches,
    negativeMatches: negative.matches,
    reasoning,
  };
}
