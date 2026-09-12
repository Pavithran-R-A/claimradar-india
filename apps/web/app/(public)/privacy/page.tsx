import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Privacy Policy',
  'How ClaimKhoj India collects, uses, and protects your personal data.',
);

export default function PrivacyPage() {
  return (
    <LegalPageTemplate title="Privacy Policy" lastUpdated="July 27, 2026">
      <h2>1. Introduction</h2>
      <p>
        ClaimKhoj India (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting
        your privacy. This policy explains what personal data we collect, how we use it, and your
        rights regarding that data.
      </p>

      <h2>2. Data We Collect</h2>
      <h3>2.1 Account Data</h3>
      <p>
        When you create an account, we collect your email address, name (optional), and password
        (stored as a secure hash). We do not collect Aadhaar numbers, PAN numbers, or other
        government-issued identifiers.
      </p>
      <h3>2.2 Usage Data</h3>
      <p>
        We collect anonymised usage data including pages visited, features used, and search queries.
        This data helps us improve the Platform.
      </p>
      <h3>2.3 Technical Data</h3>
      <p>
        We collect your IP address (anonymised after 30 days), browser type, device type, and
        operating system for security and performance monitoring.
      </p>
      <h3>2.4 Payment Data</h3>
      <p>
        If you subscribe to a paid plan, payment processing is handled by a third-party payment
        provider. We do not store your full card numbers or bank account details.
      </p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To provide and maintain the Platform</li>
        <li>To send you alerts about opportunities matching your watchlist</li>
        <li>To process subscription payments</li>
        <li>To improve Platform features and user experience</li>
        <li>To detect and prevent abuse or security issues</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your account data for as long as your account is active. Usage data is retained in
        anonymised form for up to 24 months. Payment records are retained for 7 years as required by
        Indian tax law.
      </p>

      <h2>5. Security</h2>
      <p>
        We implement industry-standard security measures including encryption at rest and in
        transit, regular security audits, and access controls. No system is perfectly secure, and we
        cannot guarantee absolute security of your data.
      </p>

      <h2>6. Your Rights</h2>
      <ul>
        <li>Access: You can request a copy of your personal data</li>
        <li>Correction: You can request correction of inaccurate data</li>
        <li>Deletion: You can request deletion of your account and associated data</li>
        <li>Portability: You can request your data in a portable format</li>
        <li>Objection: You can object to certain processing activities</li>
      </ul>
      <p>
        To exercise any of these rights, reach out to us through our{' '}
        <a
          href="/contact"
          className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
        >
          Contact page
        </a>
        .
      </p>

      <h2>7. Children</h2>
      <p>
        The Platform is not intended for children under 18. We do not knowingly collect personal
        data from children. If we learn we have collected data from a child, we will delete it
        promptly.
      </p>

      <h2>8. Third-Party Sharing</h2>
      <p>
        We do not sell your personal data. We share data only with service providers who help us
        operate the Platform (hosting, email delivery, payment processing) under strict data
        processing agreements.
      </p>

      <h2>9. Contact</h2>
      <p>
        For privacy-related inquiries, reach out through our{' '}
        <a
          href="/contact"
          className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
        >
          Contact page
        </a>
        .
      </p>
    </LegalPageTemplate>
  );
}
