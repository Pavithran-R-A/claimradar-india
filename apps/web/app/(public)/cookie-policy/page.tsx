import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Cookie Policy',
  'How ClaimKhoj India uses cookies and similar technologies.',
);

export default function CookiePolicyPage() {
  return (
    <LegalPageTemplate title="Cookie Policy" lastUpdated="July 27, 2026">
      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help
        websites remember your preferences and understand how you use the site.
      </p>

      <h2>2. How We Use Cookies</h2>
      <p>ClaimKhoj uses cookies for the following purposes:</p>
      <h3>2.1 Essential Cookies</h3>
      <p>
        Required for the Platform to function. These include session cookies for authentication and
        security tokens for form submissions. These cannot be disabled.
      </p>
      <h3>2.2 Preference Cookies</h3>
      <p>
        Remember your settings such as theme preference, language, and notification preferences.
      </p>
      <h3>2.3 Analytics Cookies</h3>
      <p>
        Help us understand how visitors interact with the Platform by collecting anonymised usage
        data. This information helps us improve features and performance.
      </p>

      <h2>3. Third-Party Cookies</h2>
      <p>
        We may use third-party services (such as analytics providers) that set their own cookies.
        These services are bound by their own privacy policies. We do not use advertising or
        tracking cookies from ad networks.
      </p>

      <h2>4. Managing Cookies</h2>
      <p>
        You can control cookies through your browser settings. Most browsers allow you to block,
        delete, or manage cookies. Note that disabling essential cookies may prevent the Platform
        from functioning correctly.
      </p>

      <h2>5. Cookie Duration</h2>
      <p>
        Session cookies expire when you close your browser. Persistent cookies remain on your device
        for a set period (typically 30 days to 1 year) or until you delete them.
      </p>

      <h2>6. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy to reflect changes in our practices or for legal
        compliance. Check this page periodically for the latest version.
      </p>
    </LegalPageTemplate>
  );
}
