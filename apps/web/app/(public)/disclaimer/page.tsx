import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Disclaimer',
  'Important disclaimers about ClaimRadar India and the information it provides.',
);

export default function DisclaimerPage() {
  return (
    <LegalPageTemplate title="Disclaimer" lastUpdated="July 27, 2026">
      <h2>Not Legal Advice</h2>
      <p>
        The information provided on ClaimRadar India is for general informational purposes only. It
        does not constitute legal, financial, tax, or regulatory advice. No attorney-client or
        advisor-client relationship is created by your use of the Platform.
      </p>
      <p>
        You should consult a qualified legal professional before taking any action based on
        information found on this Platform. Your specific circumstances may differ from those
        described in our listings, and applicable laws and regulations may change.
      </p>

      <h2>Not a Law Firm</h2>
      <p>
        ClaimRadar is not a law firm, legal services provider, or claims management company. We do
        not represent users in legal proceedings, file claims on your behalf, or negotiate
        settlements. We are an information platform that surfaces publicly available data.
      </p>

      <h2>Not Government-Affiliated</h2>
      <p>
        ClaimRadar is an independent, privately operated platform. We are not affiliated with,
        endorsed by, or connected to:
      </p>
      <ul>
        <li>The Government of India or any state government</li>
        <li>Any court, tribunal, or judicial body</li>
        <li>Any regulatory authority (RBI, SEBI, IRDAI, TRAI, etc.)</li>
        <li>Any consumer protection agency or forum</li>
        <li>Any listed or private company referenced on the Platform</li>
      </ul>
      <p>
        References to government schemes, court orders, or regulatory actions are sourced from
        public records and linked to official sources where possible. The presence of such
        information on ClaimRadar does not imply official endorsement.
      </p>

      <h2>No Guarantee of Results</h2>
      <p>We do not guarantee that:</p>
      <ul>
        <li>You will qualify for any listed opportunity</li>
        <li>You will receive any refund or compensation</li>
        <li>The information is complete or error-free</li>
        <li>Deadlines or terms will remain unchanged</li>
      </ul>
      <p>
        All claim outcomes are determined solely by the relevant official authority, company, or
        adjudicating body. ClaimRadar has no influence over these decisions.
      </p>

      <h2>Information Accuracy</h2>
      <p>
        While we strive for accuracy through automated monitoring and editorial review, the
        information on the Platform may contain errors, omissions, or outdated details. We encourage
        users to verify all information through the linked official sources before taking action.
      </p>
      <p>
        If you identify an error, please report it through our Corrections page so our editorial
        team can review and update the content.
      </p>
    </LegalPageTemplate>
  );
}
