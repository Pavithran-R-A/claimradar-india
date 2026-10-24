import type { Extraction } from '@claimradar/claim-schema';
import { LEGAL_SAFETY } from '@claimradar/shared-types';

export interface EvidenceVerification {
  field: string;
  excerpt: string;
  found: boolean;
  normalizedExcerpt: string;
  matchedPosition: { start: number; end: number } | undefined;
  page: number | null | undefined;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function fuzzyFind(
  haystack: string,
  needle: string,
): { found: boolean; start: number; end: number } {
  const normalizedHaystack = normalizeWhitespace(haystack).toLowerCase();
  const normalizedNeedle = normalizeWhitespace(needle).toLowerCase();

  // Direct substring match
  const directIndex = normalizedHaystack.indexOf(normalizedNeedle);
  if (directIndex !== -1) {
    return { found: true, start: directIndex, end: directIndex + normalizedNeedle.length };
  }

  // Try with leading/trailing words removed (handles minor truncation)
  const needleWords = normalizedNeedle.split(' ');
  if (needleWords.length >= 4) {
    const core = needleWords.slice(1, -1).join(' ');
    const coreIndex = normalizedHaystack.indexOf(core);
    if (coreIndex !== -1) {
      return { found: true, start: coreIndex, end: coreIndex + core.length };
    }
  }

  // Some official PDF text layers split a single word across an internal
  // space (e.g. "I nvestors" instead of "investors"). Accept exactly ONE
  // such split, and ONLY inside a long otherwise verbatim excerpt. This
  // keeps short legal terms, deadlines, amounts and URLs under strict checks.
  if (needleWords.length >= 10 && normalizedNeedle.length >= 80 && normalizedNeedle.length <= 400) {
    for (let i = 0; i < needleWords.length; i++) {
      const word = needleWords[i]!;
      if (!/^[a-z]{5,24}$/.test(word)) continue;
      for (let split = 1; split <= word.length - 2; split++) {
        const variant = [
          ...needleWords.slice(0, i),
          word.slice(0, split),
          word.slice(split),
          ...needleWords.slice(i + 1),
        ].join(' ');
        const at = normalizedHaystack.indexOf(variant);
        if (at !== -1) return { found: true, start: at, end: at + variant.length };
      }
    }
  }

  return { found: false, start: -1, end: -1 };
}

export function verifyEvidence(
  extraction: Extraction,
  sourceText: string,
): { allVerified: boolean; results: EvidenceVerification[] } {
  const results: EvidenceVerification[] = [];
  const normalizedSource = normalizeWhitespace(sourceText);

  for (const entry of extraction.evidence) {
    const normalizedExcerpt = normalizeWhitespace(entry.excerpt);
    const match = fuzzyFind(normalizedSource, normalizedExcerpt);

    results.push({
      field: entry.field,
      excerpt: entry.excerpt,
      found: match.found,
      normalizedExcerpt,
      matchedPosition: match.found ? { start: match.start, end: match.end } : undefined,
      page: entry.page ?? null,
    });
  }

  // Check if critical fields have backing evidence
  const criticalFields = LEGAL_SAFETY.REQUIRED_EVIDENCE_FIELDS;
  const fieldsWithEvidence = new Set(results.filter((r) => r.found).map((r) => r.field));

  // allVerified = false if any critical field that is non-null lacks evidence
  const criticalFieldsMissingEvidence = criticalFields.filter((field) => {
    const value = extraction[field as keyof Extraction];
    if (value === null || value === undefined) return false;
    return !fieldsWithEvidence.has(field);
  });

  const allVerified = criticalFieldsMissingEvidence.length === 0;

  return { allVerified, results };
}
