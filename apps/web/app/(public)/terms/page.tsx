import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Terms and Conditions',
  'Terms and conditions for using ClaimKhoj India.',
);

export default function TermsPage() {
  return (
    <LegalPageTemplate title="Terms and Conditions" lastUpdated="July 27, 2026">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using ClaimKhoj India (&quot;the Platform&quot;), you agree to be bound by
        these Terms and Conditions. If you do not agree, do not use the Platform.
      </p>

      <h2>2. Scope of Service</h2>
      <p>
        ClaimKhoj is an independent information platform that aggregates publicly available
        information about refund opportunities, compensation schemes, consumer complaints and
        related claim processes in India. The Platform provides informational content only and does
        not constitute legal, financial or regulatory advice.
      </p>

      <h2>3. No Legal Advice</h2>
      <p>
        Nothing on the Platform constitutes legal advice, a solicitation, or an attorney-client
        relationship. If you require legal advice, consult a qualified legal professional. The
        Platform does not replace the need for independent legal counsel for your specific
        circumstances.
      </p>

      <h2>4. No Government Affiliation</h2>
      <p>
        ClaimKhoj is not affiliated with, endorsed by, or connected to the Government of India, any
        state government, any court, tribunal, regulatory body, or any listed or private company
        unless expressly stated in writing.
      </p>

      <h2>5. No Guarantee of Outcomes</h2>
      <p>
        The Platform surfaces potential opportunities based on publicly available information. We do
        not guarantee that you will qualify for, receive, or be eligible for any refund,
        compensation, or claim outcome. All outcomes are determined by the relevant official
        authority or company.
      </p>

      <h2>6. Billing and Subscriptions</h2>
      <p>
        Certain features may require a paid subscription. Billing terms are described in our
        Subscription Policy. You are responsible for ensuring accurate payment information.
        Subscriptions auto-renew unless cancelled before the renewal date.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on the Platform, including text, graphics, logos, and software, is the property
        of ClaimKhoj or its licensors and is protected by applicable intellectual property laws. You
        may not reproduce, distribute, or create derivative works without prior written permission.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, ClaimKhoj and its officers, directors, employees,
        and agents shall not be liable for any indirect, incidental, special, consequential, or
        punitive damages arising out of or related to your use of the Platform, even if advised of
        the possibility of such damages.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms shall be governed by the laws of India. Any disputes arising from these Terms or
        your use of the Platform shall be subject to the exclusive jurisdiction of the courts
        located in the jurisdiction to be determined at the time of commercial launch.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be communicated via the
        Platform or by email. Continued use after changes constitutes acceptance of the updated
        Terms.
      </p>
    </LegalPageTemplate>
  );
}
