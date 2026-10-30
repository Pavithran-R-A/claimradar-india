import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';
import { contactConfig } from '@claimradar/config';
import Link from 'next/link';

export const metadata = generateLegalMetadata(
  'Contact Us',
  'Get in touch with the ClaimKhoj India team.',
);

export default function ContactPage() {
  return (
    <LegalPageTemplate title="Contact Us" lastUpdated="September 14, 2026">
      <p className="text-base">
        ClaimKhoj is a public discovery and verification service. For claim-specific eligibility,
        filing or deadline questions, always use the official authority linked from the relevant
        opportunity page.
      </p>

      <h2>General Enquiries</h2>
      <p>For general questions about ClaimKhoj, features, or your account:</p>
      {contactConfig.supportEmail ? (
        <p>
          <a
            href={`mailto:${contactConfig.supportEmail}`}
            className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
          >
            {contactConfig.supportEmail}
          </a>
        </p>
      ) : (
        <p className="text-text-secondary italic">
          Email support is not available. For problems with ClaimKhoj, sign in and use the{' '}
          <Link href="/app/privacy" className="text-trust-primary underline">Privacy Center</Link>
          {' '}to submit a grievance and track its status. For official claim filing questions,
          contact the responsible authority.
        </p>
      )}
      <p>
        We keep public guidance, source links and verification timestamps on each published record.
      </p>

      <h2>Corrections &amp; Error Reports</h2>
      <p>To report incorrect information on the Platform:</p>
      {contactConfig.correctionsEmail ? (
        <p>
          <a
            href={`mailto:${contactConfig.correctionsEmail}`}
            className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
          >
            {contactConfig.correctionsEmail}
          </a>
        </p>
      ) : (
        <p className="text-text-secondary italic">
          A corrections email inbox is not configured. Signed-in customers can submit a recorded
          correction request using the{' '}
          <Link href="/app/privacy" className="text-trust-primary underline">Privacy Center</Link>.
          An account is required; no automatic email reply is promised.
        </p>
      )}
      <p>
        Please include the listing URL and a link or citation to the official government source. See
        our{' '}
        <Link
          href="/corrections"
          className="text-trust-primary hover:text-trust-primary-hover underline"
        >
          Corrections page
        </Link>{' '}
        for the full verification and retraction process.
      </p>

      <h2>Grievance &amp; Escalations</h2>
      {contactConfig.grievanceEmail ? (
        <p>
          <a
            href={`mailto:${contactConfig.grievanceEmail}`}
            className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
          >
            {contactConfig.grievanceEmail}
          </a>
        </p>
      ) : (
        <p className="text-text-secondary italic">
          A grievance email inbox is not configured. Signed-in customers can submit a grievance in
          the{' '}<Link href="/app/privacy" className="text-trust-primary underline">Privacy Center</Link>
          {' '}and track its status there. For a filing dispute, contact the responsible official authority.
        </p>
      )}

      <h2>Press &amp; Media</h2>
      {contactConfig.pressEmail ? (
        <p>
          <a
            href={`mailto:${contactConfig.pressEmail}`}
            className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
          >
            {contactConfig.pressEmail}
          </a>
        </p>
      ) : (
        <p className="text-text-secondary italic">
          A dedicated press inbox is not currently configured.
        </p>
      )}

      <h2>What We Do Not Provide</h2>
      <ul>
        <li>We do not provide legal or financial advice via email or any other channel</li>
        <li>We do not file claims or complaints on behalf of users</li>
        <li>We do not collect government or regulatory filing fees</li>
        <li>We do not share individual claim outcomes or user data with third parties</li>
      </ul>
    </LegalPageTemplate>
  );
}
