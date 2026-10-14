import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Subscription Policy',
  'Billing terms and subscription details for ClaimKhoj India.',
);

export default function SubscriptionPolicyPage() {
  return (
    <LegalPageTemplate title="Subscription Policy" lastUpdated="October 14, 2026">
      <h2>1. Current Service</h2>
      <p>
        ClaimKhoj currently offers free access to official recovery routes and publicly available
        information. No paid subscriptions, paid checkout, auto-renewals, or subscription charges are
        available through ClaimKhoj at this time.
      </p>

      <h2>2. Future Paid Features</h2>
      <p>
        Any optional paid plan introduced later will have its features, full INR price, billing
        frequency, payment methods, renewal and cancellation rules, and refund terms disclosed before
        a payment is accepted. This page is not an offer to subscribe.
      </p>

      <h2>3. Claim Filing Fees</h2>
      <p>
        ClaimKhoj does not file claims, collect statutory filing fees, or take any percentage of a
        refund. Follow only the official authority links for claim processes.
      </p>
    </LegalPageTemplate>
  );
}
