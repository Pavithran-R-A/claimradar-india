import { describe, it, expect } from 'vitest';
import { scoreDocument } from '../../src/scoring/classifier.js';
import {
  SemanticDocumentClass,
  ActionabilityCategory,
} from '../../src/scoring/document-classes.js';

interface CorpusItem {
  id: string;
  title: string;
  text: string;
  expectedClass: SemanticDocumentClass;
  expectedActionability: ActionabilityCategory;
  isPositive: boolean;
  notes: string;
}

export const CORPUS: CorpusItem[] = [
  // ---------------------------------------------------------------------------
  // POSITIVE EXAMPLES (Known Actionable Claims)
  // ---------------------------------------------------------------------------
  {
    id: 'POS-01',
    title:
      'IBBI CIRP Creditor Claim Notice: KRUX PHARMA PRIVATE LIMITED (Claims Deadline: 21-08-2026)',
    text: 'Public Announcement of Corporate Insolvency Resolution Process for KRUX PHARMA PRIVATE LIMITED. Notice inviting proof of claim from all creditors and claimants under Form A / Regulation 6. Last date for submission of claims: 21-08-2026.',
    expectedClass: SemanticDocumentClass.CreditorClaimInvitation,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'IBBI CIRP Form A public announcement inviting creditor claims with explicit deadline.',
  },
  {
    id: 'POS-02',
    title:
      'PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT. LTD FOR REFUND (PHASE-II).',
    text: 'PUBLIC NOTICE IN THE MATTER OF CITRUS CHECK INNS LIMITED AND ROYAL TWINKLE STAR CLUB PVT. LTD FOR REFUND (PHASE-II). Justice (Retd.) J.P. Devadhar Committee invites online claim applications from eligible investors through the designated investor refund portal.',
    expectedClass: SemanticDocumentClass.InvestorRefundProgram,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'SEBI High Powered Committee public investor refund portal launch.',
  },
  {
    id: 'POS-03',
    title:
      'IBBI Voluntary Liquidation Creditor Claim Notice: ROSSLAND PHARMACEUTICALS PRIVATE LIMITED (Claims Deadline: 07-09-2026)',
    text: 'Public Announcement of Voluntary Liquidation Process for ROSSLAND PHARMACEUTICALS PRIVATE LIMITED. Notice inviting proof of claim from all stakeholders and financial creditors. Last date for submission of claims: 07-09-2026.',
    expectedClass: SemanticDocumentClass.CreditorClaimInvitation,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'IBBI voluntary liquidation creditor proof-of-claim invitation.',
  },
  {
    id: 'POS-04',
    title: 'TRAI Directive on Refund of Excess Tariff Charges to Prepaid Subscribers',
    text: 'Telecom Regulatory Authority of India (TRAI) directs telecom service providers to process tariff refund and reimbursement to customers affected by unauthorized service activations. Eligible subscribers can submit claim on the portal.',
    expectedClass: SemanticDocumentClass.ConsumerRefundProgram,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'TRAI consumer overcharge refund program directive.',
  },
  {
    id: 'POS-05',
    title: 'RBI Directive on Repayment of Deposits and Refund to Depositors',
    text: 'The Reserve Bank of India has issued directions requiring the bank to repay depositors and commence refund to customers through the designated portal for claims. Notice inviting proof of claim from eligible depositors by last date for submission of claims 31-10-2026.',
    expectedClass: SemanticDocumentClass.ConsumerRefundProgram,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'RBI directive establishing a concrete depositor refund mechanism.',
  },
  {
    id: 'POS-06',
    title:
      'Investor Education and Protection Fund Authority — Unclaimed Dividend Recovery Portal Notice',
    text: 'IEPF Authority invites applications from eligible investors for refund of unclaimed dividend, unclaimed deposit, and transferred shares under Rule 7.',
    expectedClass: SemanticDocumentClass.PublicClaimNotice,
    expectedActionability: ActionabilityCategory.TrueActionable,
    isPositive: true,
    notes: 'Statutory investor protection fund unclaimed asset recovery route.',
  },

  // ---------------------------------------------------------------------------
  // NEGATIVE EXAMPLES (Known Non-Actionable Administrative / Enforcement Noise)
  // ---------------------------------------------------------------------------
  {
    id: 'NEG-01',
    title: 'PRESS RELEASE - RBI imposes monetary penalty on The Karad Urban Co-operative Bank Ltd.',
    text: 'The Reserve Bank of India (RBI) has, by an order dated August 22, 2026, imposed a monetary penalty of Rs 5.00 Lakh on The Karad Urban Co-operative Bank Ltd., Karad, Maharashtra for non-compliance with the directions issued by RBI on Customer Protection. This action is based on deficiencies in regulatory compliance and is not intended to pronounce upon the validity of any transaction or agreement entered into by the bank with its customers.',
    expectedClass: SemanticDocumentClass.RegulatoryPenaltyOnly,
    expectedActionability: ActionabilityCategory.NonActionable,
    isPositive: false,
    notes:
      'Standard RBI monetary penalty for regulatory non-compliance without consumer restitution.',
  },
  {
    id: 'NEG-02',
    title: 'Corporate Insolvency Resolution Process: Form G - Apex Buildtech Private Limited',
    text: 'Corporate Insolvency Resolution Process: Form G - Invitation for Expression of Interest from prospective resolution applicants for Apex Buildtech Private Limited under Regulation 36A(1). Last date for receipt of expression of interest: 15-09-2026.',
    expectedClass: SemanticDocumentClass.ResolutionPlanEoi,
    expectedActionability: ActionabilityCategory.InformationalOnly,
    isPositive: false,
    notes:
      'IBBI Form G is for prospective resolution applicants / EOI, not a creditor claim opportunity.',
  },
  {
    id: 'NEG-03',
    title: 'Adjudication Order in the matter of Nirman Agri Genetics Limited',
    text: 'Adjudication Order in respect of Nirman Agri Genetics Limited. Monetary penalty of Rs 10 lakh imposed on directors for disclosure violations during IPO under Section 15HA of SEBI Act.',
    expectedClass: SemanticDocumentClass.EnforcementOrderOnly,
    expectedActionability: ActionabilityCategory.NonActionable,
    isPositive: false,
    notes:
      'SEBI adjudication order imposing penalty on directors without investor refund mechanism.',
  },
  {
    id: 'NEG-04',
    title: 'Settlement Order in the matter of 3One 4 Capital Continuum IE',
    text: 'Settlement Order in the matter of 3One 4 Capital Continuum IE. The applicant submitted settlement application and paid settlement amount to SEBI in terms of SEBI (Settlement Proceedings) Regulations.',
    expectedClass: SemanticDocumentClass.EnforcementOrderOnly,
    expectedActionability: ActionabilityCategory.NonActionable,
    isPositive: false,
    notes: 'SEBI settlement order disposing proceedings without an investor claim route.',
  },
  {
    id: 'NEG-05',
    title: 'TRAI Consumer Awareness Program Kangra Himachal Pradesh',
    text: 'TRAI organized a consumer awareness program and education workshop in Kangra, Himachal Pradesh for telecom subscribers on consumer rights and tariff transparency.',
    expectedClass: SemanticDocumentClass.InformationalNotice,
    expectedActionability: ActionabilityCategory.InformationalOnly,
    isPositive: false,
    notes: 'Consumer outreach workshop without monetary remedy.',
  },
  {
    id: 'NEG-06',
    title: 'SEBI Recovery Certificate Notice in respect of Mr. Sharma',
    text: 'Release order for recovery certificate issued in respect of individual monetary penalty payable by Mr. Sharma under Section 28A of SEBI Act.',
    expectedClass: SemanticDocumentClass.EnforcementOrderOnly,
    expectedActionability: ActionabilityCategory.NonActionable,
    isPositive: false,
    notes: 'Individual regulatory recovery proceeding.',
  },
  {
    id: 'NEG-07',
    title: 'Press Information Bureau Press Release — Ministry of Textiles',
    text: 'Union Minister inaugurates new textiles development initiative and National Quantum Mission facility in New Delhi.',
    expectedClass: SemanticDocumentClass.GeneralPressRelease,
    expectedActionability: ActionabilityCategory.InformationalOnly,
    isPositive: false,
    notes: 'Generic government press announcement.',
  },
  {
    id: 'NEG-08',
    title: 'Notice for Recruitment of Legal Consultants in Ministry of Corporate Affairs',
    text: 'Applications are invited for vacancy of Legal Consultants in MCA. Candidates with LL.B and 5 years experience may apply. Tender notice for security services also published.',
    expectedClass: SemanticDocumentClass.InformationalNotice,
    expectedActionability: ActionabilityCategory.NonActionable,
    isPositive: false,
    notes: 'Hiring and tender administrative notice.',
  },
];

describe('Classifier Precision and Recall Corpus Audit', () => {
  it('evaluates complete corpus with >=90% recall, >=90% precision, and 0 hard-negative false positives', () => {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let trueNegatives = 0;

    let rbiPenaltyFalsePositives = 0;
    let ibbiFormGFalsePositives = 0;
    let sebiEnforcementFalsePositives = 0;

    for (const item of CORPUS) {
      const result = scoreDocument({ text: item.text, title: item.title });

      if (item.isPositive) {
        if (result.isCandidate) {
          truePositives++;
        } else {
          falseNegatives++;
        }
      } else {
        if (result.isCandidate) {
          falsePositives++;
          if (item.id === 'NEG-01') rbiPenaltyFalsePositives++;
          if (item.id === 'NEG-02') ibbiFormGFalsePositives++;
          if (item.id === 'NEG-03' || item.id === 'NEG-04' || item.id === 'NEG-06')
            sebiEnforcementFalsePositives++;
        } else {
          trueNegatives++;
        }
      }

      // Assert semantic class matches expected specification
      expect(result.documentClass).toBe(item.expectedClass);
    }

    const totalPositives = truePositives + falseNegatives;
    const recall = (truePositives / totalPositives) * 100;
    const precision =
      truePositives + falsePositives > 0
        ? (truePositives / (truePositives + falsePositives)) * 100
        : 0;

    console.log(`Corpus Evaluation Results:
- Total Items: ${CORPUS.length}
- Positives: ${totalPositives} (TP: ${truePositives}, FN: ${falseNegatives})
- Negatives: ${trueNegatives + falsePositives} (TN: ${trueNegatives}, FP: ${falsePositives})
- Known Positive Recall: ${recall.toFixed(1)}% (Target: >=90%)
- Precision: ${precision.toFixed(1)}% (Target: >=90%)
- RBI Penalty False Positives: ${rbiPenaltyFalsePositives} (Target: 0)
- IBBI Form G False Positives: ${ibbiFormGFalsePositives} (Target: 0)
- SEBI Enforcement False Positives: ${sebiEnforcementFalsePositives} (Target: 0)`);

    expect(recall).toBeGreaterThanOrEqual(90);
    expect(precision).toBeGreaterThanOrEqual(90);
    expect(rbiPenaltyFalsePositives).toBe(0);
    expect(ibbiFormGFalsePositives).toBe(0);
    expect(sebiEnforcementFalsePositives).toBe(0);
  });
});
