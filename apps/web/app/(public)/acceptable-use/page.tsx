import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Acceptable Use Policy',
  'Acceptable use rules for ClaimKhoj India platform.',
);

export default function AcceptableUsePage() {
  return (
    <LegalPageTemplate title="Acceptable Use Policy" lastUpdated="July 27, 2026">
      <h2>1. Purpose</h2>
      <p>
        This Acceptable Use Policy defines the rules for using ClaimKhoj India. By using the
        Platform, you agree to comply with these rules. Violations may result in account suspension
        or termination.
      </p>

      <h2>2. Permitted Use</h2>
      <p>You may use the Platform to:</p>
      <ul>
        <li>Browse and search for publicly available claim and refund information</li>
        <li>Create watchlists and set up alerts for companies of interest</li>
        <li>Access educational guides and resources about consumer rights</li>
        <li>Share listings with others for personal, non-commercial purposes</li>
      </ul>

      <h2>3. Prohibited Use</h2>
      <p>You must not:</p>
      <ul>
        <li>Use the Platform for any unlawful purpose or to facilitate illegal activity</li>
        <li>
          Attempt to gain unauthorised access to any part of the Platform or its infrastructure
        </li>
        <li>
          Scrape, crawl, or use automated tools to extract data from the Platform without written
          permission
        </li>
        <li>Misrepresent yourself as being affiliated with ClaimKhoj or any government body</li>
        <li>Use the Platform to harass, defraud, or mislead other users or third parties</li>
        <li>Resell or redistribute Platform content as your own service or product</li>
        <li>Interfere with or disrupt the Platform, servers, or connected networks</li>
        <li>Create multiple accounts to circumvent usage limits or bans</li>
      </ul>

      <h2>4. Content You Submit</h2>
      <p>
        If you submit content (correction reports, feedback, etc.), you grant ClaimKhoj a
        non-exclusive licence to use, review, and act on that content. You must not submit content
        that is defamatory, abusive, or infringes on third-party rights.
      </p>

      <h2>5. Enforcement</h2>
      <p>
        ClaimKhoj reserves the right to investigate violations and take appropriate action,
        including:
      </p>
      <ul>
        <li>Issuing a warning</li>
        <li>Temporarily suspending your account</li>
        <li>Permanently terminating your account</li>
        <li>Reporting violations to law enforcement where required by law</li>
      </ul>

      <h2>6. Reporting Violations</h2>
      <p>
        If you believe someone is violating this policy, please report it via our{' '}
        <a
          href="/contact"
          className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
        >
          Contact page
        </a>{' '}
        with details of the suspected violation.
      </p>
    </LegalPageTemplate>
  );
}
