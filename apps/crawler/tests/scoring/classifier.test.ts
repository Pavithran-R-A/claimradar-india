import { describe, it, expect } from 'vitest';
import { scoreDocument } from '../../src/scoring/classifier.js';
import { DEFAULT_CANDIDATE_THRESHOLD } from '../../src/scoring/keywords.js';

describe('Keyword Classifier', () => {
  it('should give high score for claimable document with refund keywords', () => {
    const result = scoreDocument({
      text: 'The consumer forum has ordered a refund of Rs. 5 crore to all affected consumers who purchased defective products. The compensation order requires the company to reimburse customers within 90 days.',
      title: 'NCDRC orders refund and compensation to consumers',
    });

    expect(result.score).toBeGreaterThanOrEqual(30);
    expect(result.isCandidate).toBe(true);
    expect(result.positiveMatches.length).toBeGreaterThan(0);
  });

  it('should give low score for irrelevant document with vacancy/recruitment keywords', () => {
    const result = scoreDocument({
      text: 'Applications are invited for the post of Assistant Director in the Ministry of Consumer Affairs. Candidates with a degree in law and 5 years experience in recruitment may apply for this vacancy.',
      title: 'Job vacancy announcement - Assistant Director',
    });

    expect(result.score).toBeLessThan(DEFAULT_CANDIDATE_THRESHOLD);
    expect(result.isCandidate).toBe(false);
    expect(result.negativeMatches.length).toBeGreaterThan(0);
  });

  it('should handle false positive: mixed keywords', () => {
    const result = scoreDocument({
      text: 'The seminar on consumer protection discussed refund policies and compensation mechanisms. The conference brought together experts to discuss procurement of training materials for consumer forums.',
      title: 'Conference on consumer protection policies',
    });

    // Mixed keywords - may have some positive and negative
    expect(result.score).toBeTypeOf('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasoning).toBeDefined();
  });

  it('should handle false negative: unusual phrasing', () => {
    const result = scoreDocument({
      text: 'The regulatory body has mandated that the corporation shall return all monies collected from eligible persons who participated in the scheme during the specified period.',
      title: 'Regulatory directive on monetary returns',
    });

    // The text describes a refund without using exact keywords
    expect(result.score).toBeTypeOf('number');
    expect(result.reasoning).toContain('Scored');
  });

  it('should support configurable threshold', () => {
    const lowThreshold = scoreDocument({ text: 'refund compensation consumers' }, 10);
    const highThreshold = scoreDocument({ text: 'refund compensation consumers' }, 80);

    expect(lowThreshold.isCandidate).toBe(true);
    // With high threshold, same text might not pass
    // The threshold is reflected in the reasoning string
    expect(highThreshold.reasoning).toContain('threshold 80');
  });

  it('should apply title keyword boost', () => {
    const withTitle = scoreDocument({
      text: 'A document about consumer issues',
      title: 'Refund Order for All Consumers',
    });

    const withoutTitle = scoreDocument({
      text: 'A document about consumer issues',
      title: '',
    });

    expect(withTitle.score).toBeGreaterThan(withoutTitle.score);
  });

  it('should include reasoning in result', () => {
    const result = scoreDocument({
      text: 'refund compensation consumers',
      title: 'Refund Order',
    });

    expect(result.reasoning).toContain('Scored');
    expect(result.reasoning).toContain('threshold');
    // Should contain either PASSES or FAILS
    const containsPASSES = result.reasoning.includes('PASSES');
    const containsFAILS = result.reasoning.includes('FAILS');
    expect(containsPASSES || containsFAILS).toBe(true);
  });

  it('should normalize score between 0 and 100', () => {
    const highResult = scoreDocument({
      text: 'refund '.repeat(100) + ' compensation '.repeat(50),
      title: 'refund compensation',
    });

    expect(highResult.score).toBeLessThanOrEqual(100);
    expect(highResult.score).toBeGreaterThanOrEqual(0);
  });

  describe('Real Document Shape Regression Tests (Phase L)', () => {
    it('Positive Case 1: IBBI creditor claim invitation', () => {
      const result = scoreDocument({
        text: 'Public Announcement of Corporate Insolvency Resolution Process for KRUX PHARMA PRIVATE LIMITED. Notice inviting proof of claim from all creditors and claimants. Last date for submission of claims: 21-08-2026.',
        title:
          'IBBI CIRP Creditor Claim Notice: KRUX PHARMA PRIVATE LIMITED (Claims Deadline: 21-08-2026)',
      });
      expect(result.isCandidate).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('Positive Case 2: SEBI Citrus Check Inns / Royal Twinkle refund public notice (Exact Live Shape)', () => {
      const result = scoreDocument({
        text: 'PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT. LTD FOR REFUND (PHASE-II). Jul 29, 2026| Public Notices PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT. LTD FOR REFUND (PHASE-II).',
        title:
          'PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT. LTD FOR REFUND (PHASE-II).',
      });
      expect(result.isCandidate).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('Positive Case 3: IBBI Voluntary Liquidation claim invitation', () => {
      const result = scoreDocument({
        text: 'Public Announcement of Voluntary Liquidation Process for ROSSLAND PHARMACEUTICALS PRIVATE LIMITED. Notice inviting proof of claim from all stakeholders and claimants. Last date for submission of claims: 07-09-2026.',
        title:
          'IBBI Voluntary Liquidation Creditor Claim Notice: ROSSLAND PHARMACEUTICALS PRIVATE LIMITED (Claims Deadline: 07-09-2026)',
      });
      expect(result.isCandidate).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it('Negative Case 0: SEBI generic enforcement order (Nirman Agri)', () => {
      const result = scoreDocument({
        text: 'Adjudication Order in respect of Nirman Agri Genetics Limited. Monetary penalty of Rs 10 lakh imposed on directors for disclosure violations during IPO.',
        title: 'Adjudication Order in the matter of Nirman Agri Genetics Limited',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 1: TRAI consumer awareness event', () => {
      const result = scoreDocument({
        text: 'TRAI organized a consumer awareness program and education workshop in Kangra, Himachal Pradesh for telecom subscribers.',
        title: 'TRAI Consumer Awareness Program Kangra Himachal Pradesh',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 2: SEBI individual recovery certificate', () => {
      const result = scoreDocument({
        text: 'Release order for recovery certificate issued in respect of individual monetary penalty payable by Mr. Sharma.',
        title: 'SEBI Recovery Certificate Notice',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 3: RBI monetary penalty', () => {
      const result = scoreDocument({
        text: 'RBI imposes monetary penalty on ABC Cooperative Bank for non-compliance with KYC directives.',
        title: 'Monetary Penalty Imposed on ABC Cooperative Bank',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 4: PIB generic press release', () => {
      const result = scoreDocument({
        text: 'Union Minister inaugurates new textiles development initiative and National Quantum Mission facility.',
        title: 'Press Information Bureau Press Release',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 5: W3C reference document', () => {
      const result = scoreDocument({
        text: 'W3C Recommendation for Accessible Rich Internet Applications (ARIA) in HTML specifications.',
        title: 'W3C ARIA Recommendation',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 6: SEBI Settlement Order (3One 4 Capital Continuum IE)', () => {
      const result = scoreDocument({
        text: 'Settlement Order in the matter of 3One 4 Capital Continuum IE. The applicant submitted settlement application and paid settlement amount to SEBI in terms of SEBI (Settlement Proceedings) Regulations.',
        title: 'Settlement Order in the matter of 3One 4 Capital Continuum IE',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Negative Case 7: SEBI Settlement Order (Jetha Global Master Fund)', () => {
      const result = scoreDocument({
        text: 'Settlement Order in the matter of Jetha Global Master Fund. High Powered Advisory Committee considered settlement terms and recommended settlement on payment of charges.',
        title: 'Settlement Order in the matter of Jetha Global Master Fund',
      });
      expect(result.isCandidate).toBe(false);
      expect(result.score).toBeLessThan(30);
    });

    it('Positive Case 4: Public compensation settlement with active claim invitation', () => {
      const result = scoreDocument({
        text: 'Public Notice for Settlement and Refund Scheme for affected consumers. Notice inviting proof of claim and claim application submission for refund ordered to eligible depositors by deadline 30-09-2026.',
        title: 'Public Notice for Consumer Compensation Settlement and Refund Scheme',
      });
      expect(result.isCandidate).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });
  });
});
