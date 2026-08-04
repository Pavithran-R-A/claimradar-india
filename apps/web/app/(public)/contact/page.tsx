import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Contact Us',
  'Get in touch with the ClaimRadar India team.',
);

export default function ContactPage() {
  return (
    <LegalPageTemplate title="Contact Us" lastUpdated="July 27, 2026">
      <p className="text-base">We are here to help. Reach out to us through the channels below.</p>

      <h2>General Enquiries</h2>
      <p>For general questions about the Platform, features, or your account:</p>
      <p>
        <a
          href="mailto:support@claimradar.example"
          className="text-trust-primary hover:text-trust-primary-hover"
        >
          support@claimradar.example
        </a>
      </p>
      <p>We aim to respond to all enquiries within 2 business days.</p>

      <h2>Corrections &amp; Error Reports</h2>
      <p>To report incorrect information on the Platform:</p>
      <p>
        <a
          href="mailto:corrections@claimradar.example"
          className="text-trust-primary hover:text-trust-primary-hover"
        >
          corrections@claimradar.example
        </a>
      </p>
      <p>
        Please include the listing URL and a description of the error. See our Corrections page for
        the full correction workflow.
      </p>

      <h2>Billing &amp; Subscriptions</h2>
      <p>For questions about your subscription, billing, or refund requests:</p>
      <p>
        <a
          href="mailto:billing@claimradar.example"
          className="text-trust-primary hover:text-trust-primary-hover"
        >
          billing@claimradar.example
        </a>
      </p>
      <p>Include your account email and subscription plan in your message for faster resolution.</p>

      <h2>Grievance Officer</h2>
      <p>As required under Indian law, our designated Grievance Officer can be contacted at:</p>
      <p>
        <a
          href="mailto:grievance@claimradar.example"
          className="text-trust-primary hover:text-trust-primary-hover"
        >
          grievance@claimradar.example
        </a>
      </p>
      <p>
        The Grievance Officer will acknowledge your complaint within 48 hours and resolve it within
        30 days of receipt.
      </p>

      <h2>Press &amp; Media</h2>
      <p>For press enquiries, interviews, or partnership discussions:</p>
      <p>
        <a
          href="mailto:press@claimradar.example"
          className="text-trust-primary hover:text-trust-primary-hover"
        >
          press@claimradar.example
        </a>
      </p>

      <h2>What We Do Not Provide</h2>
      <ul>
        <li>We do not provide legal advice via email or any other channel</li>
        <li>We do not file claims or complaints on behalf of users</li>
        <li>We do not share individual claim outcomes or user data with third parties</li>
      </ul>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-text-primary">Contact form</h3>
        <p className="mt-2 text-sm text-text-secondary">
          An interactive contact form will be available soon. In the meantime, please email us
          directly at the addresses listed above.
        </p>
      </div>
    </LegalPageTemplate>
  );
}
