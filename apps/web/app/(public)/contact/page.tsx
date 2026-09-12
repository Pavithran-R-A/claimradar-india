import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';
import { contactConfig } from '@claimradar/config';
import Link from 'next/link';

export const metadata = generateLegalMetadata(
  'Contact Us',
  'Get in touch with the ClaimKhoj India team.',
);

export default function ContactPage() {
  return (
    <LegalPageTemplate title="Contact Us" lastUpdated="August 30, 2026">
      <p className="text-base">We are here to help. Reach out to us through the channels below.</p>

      <h2>General Enquiries</h2>
      <p>For general questions about the Platform, features, or your account:</p>
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
          Direct support email will be enabled before public launch.
        </p>
      )}
      <p>We review incoming enquiries as soon as practicable during normal editorial operations.</p>

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
          Dedicated corrections email will be enabled before public launch.
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
      <p>
        Formal grievance contact channels and designated officer details will be published prior to
        unrestricted public release as part of our governance pre-launch requirements.
      </p>
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
          Grievance officer contact channel will be published prior to unrestricted public release.
        </p>
      )}

      <h2>Press &amp; Media</h2>
      <p>For press enquiries or official communications:</p>
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
          Press inquiries channel will be published prior to unrestricted public launch.
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
