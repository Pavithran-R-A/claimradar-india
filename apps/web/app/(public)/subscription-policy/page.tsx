import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Subscription Policy',
  'Billing terms and subscription details for ClaimKhoj India.',
);

export default function SubscriptionPolicyPage() {
  return (
    <LegalPageTemplate title="Subscription Policy" lastUpdated="July 27, 2026">
      <h2>1. Plans and Pricing</h2>
      <p>
        ClaimKhoj offers two subscription tiers: Free (₹0) and Plus (₹149 per month or ₹999 per
        year). Pricing is in Indian Rupees and inclusive of applicable taxes unless otherwise
        stated.
      </p>

      <h2>2. Billing Cycle</h2>
      <p>
        Monthly subscriptions are billed on the same date each month based on your initial
        subscription date. Annual subscriptions are billed once per year on your subscription
        anniversary date.
      </p>

      <h2>3. Auto-Renewal</h2>
      <p>
        All paid subscriptions automatically renew at the end of each billing period unless
        cancelled before the renewal date. You will receive an email reminder before each renewal
        charge is applied.
      </p>

      <h2>4. Cancellation</h2>
      <p>
        You can cancel your subscription at any time from your account settings. Upon cancellation:
      </p>
      <ul>
        <li>Your paid features remain active until the end of the current billing period</li>
        <li>No further charges will be applied after the current period ends</li>
        <li>Your account will revert to the Free tier</li>
        <li>
          Your watchlist data is retained, but watchlist limits revert to the Free tier allowance
        </li>
      </ul>

      <h2>5. Payment Methods</h2>
      <p>
        We accept payments through UPI, credit/debit cards, net banking, and popular digital wallets
        via our secure payment processing partner. We do not store your full payment card details on
        our servers.
      </p>

      <h2>6. Failed Payments</h2>
      <p>
        If a renewal payment fails, we will attempt to retry the charge for up to 7 days. During
        this grace period, your paid features remain active. If payment cannot be processed after 7
        days, your subscription will be downgraded to the Free tier.
      </p>

      <h2>7. Plan Changes</h2>
      <p>
        You can upgrade or downgrade your plan at any time. When upgrading, you will be charged the
        prorated difference immediately. When downgrading, the change takes effect at the end of
        your current billing period.
      </p>

      <h2>8. Price Changes</h2>
      <p>
        We may adjust pricing with at least 30 days advance notice. If you do not agree to the new
        pricing, you can cancel before the change takes effect. Existing annual subscribers are
        grandfathered at their original rate for the duration of their current term.
      </p>
    </LegalPageTemplate>
  );
}
