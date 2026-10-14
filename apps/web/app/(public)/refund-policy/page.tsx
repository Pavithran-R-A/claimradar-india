import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Refund Policy',
  'Refund policy for ClaimKhoj India subscriptions.',
);

export default function RefundPolicyPage() {
  return (
    <LegalPageTemplate title="Refund Policy" lastUpdated="October 14, 2026">
      <h2>1. No Paid Subscriptions at Present</h2>
      <p>
        ClaimKhoj currently offers a free public information service. We are not offering or
        processing paid subscriptions, so there are no active ClaimKhoj subscription charges to
        refund under this policy.
      </p>

      <h2>2. Suspected Charges or Impersonation</h2>
      <p>
        If someone asks you to pay to access ClaimKhoj or claims to have charged you on our behalf,
        do not share OTPs, bank passwords, or payment credentials. Review the charge with your
        payment provider and use the currently available channels on our Contact page.
      </p>

      <h2>3. Future Changes</h2>
      <p>
        If paid subscriptions are introduced, their cancellation, charge dispute, and refund terms
        will be made available before checkout. Refunds or eligibility under third-party official
        government schemes are determined by their respective authorities, not by ClaimKhoj.
      </p>
    </LegalPageTemplate>
  );
}
