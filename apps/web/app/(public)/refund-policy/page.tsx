import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Refund Policy',
  'Refund policy for ClaimRadar India subscriptions.',
);

export default function RefundPolicyPage() {
  return (
    <LegalPageTemplate title="Refund Policy" lastUpdated="July 27, 2026">
      <h2>1. Overview</h2>
      <p>
        This Refund Policy applies to paid subscriptions on ClaimRadar India. The Platform itself is
        a free information service; paid subscriptions unlock additional features such as unlimited
        watchlists, real-time alerts, and detailed source breakdowns.
      </p>

      <h2>2. Monthly Subscriptions</h2>
      <p>
        For monthly subscriptions, you may cancel at any time before your next billing date. Upon
        cancellation, you retain access to paid features until the end of your current billing
        period. No partial refunds are issued for unused portions of a monthly billing cycle.
      </p>

      <h2>3. Annual Subscriptions</h2>
      <p>
        For annual subscriptions, you may request a prorated refund within the first 30 days of the
        subscription term if you are not satisfied with the service. After the 30-day window, no
        refunds are issued, but you retain access until the end of the annual term.
      </p>

      <h2>4. How to Request a Refund</h2>
      <p>
        To request a refund, email support@claimradar.example with your account email, subscription
        plan, and reason for the refund request. Our team will process your request within 5
        business days.
      </p>

      <h2>5. Refund Processing</h2>
      <p>
        Approved refunds are processed back to the original payment method. Depending on your bank
        or payment provider, it may take 5–10 business days for the refund to appear in your
        account.
      </p>

      <h2>6. Exceptions</h2>
      <p>Refunds are not available for:</p>
      <ul>
        <li>Usage-based charges or one-time purchases (if any are introduced)</li>
        <li>Subscriptions cancelled after the applicable refund window</li>
        <li>Accounts that have violated our Acceptable Use Policy</li>
      </ul>

      <h2>7. Billing Errors</h2>
      <p>
        If you notice an incorrect charge, contact us within 30 days of the charge date. We will
        investigate and issue a correction or refund as appropriate.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Refund Policy from time to time. Changes take effect upon publication on
        this page. We encourage you to review this policy periodically.
      </p>
    </LegalPageTemplate>
  );
}
