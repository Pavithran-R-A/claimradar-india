import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Security',
  'How ClaimRadar India protects your data and platform integrity.',
);

export default function SecurityPage() {
  return (
    <LegalPageTemplate title="Security" lastUpdated="July 27, 2026">
      <p className="text-base">
        We take security seriously. Here is an overview of how we protect your data and the
        Platform.
      </p>

      <h2>Encryption</h2>
      <p>
        All data transmitted between your browser and our servers is encrypted using TLS 1.3. Data
        at rest is encrypted using AES-256 encryption. Passwords are stored as bcrypt hashes and
        never in plaintext.
      </p>

      <h2>Infrastructure</h2>
      <p>
        The Platform is hosted on infrastructure providers with SOC 2 Type II certification. We use
        managed databases with automated backups, network isolation, and intrusion detection.
      </p>

      <h2>Access Controls</h2>
      <p>
        Internal access to user data is restricted to authorised personnel on a need-to-know basis.
        All access is logged and audited. Multi-factor authentication is required for all
        administrative access.
      </p>

      <h2>Vulnerability Management</h2>
      <p>
        We conduct regular security reviews and dependency audits. Critical vulnerabilities are
        patched promptly. We welcome responsible disclosure of security issues via our{' '}
        <a
          href="/contact"
          className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
        >
          Contact page
        </a>
        .
      </p>

      <h2>Data Minimisation</h2>
      <p>
        We collect the minimum data necessary to operate the Platform. We do not store Aadhaar
        numbers, PAN numbers, bank account details, or other sensitive government-issued
        identifiers. Payment processing is handled entirely by our PCI-DSS compliant payment
        provider.
      </p>

      <h2>Monitoring</h2>
      <p>
        Automated monitoring detects and alerts on suspicious activity, unauthorised access
        attempts, and system anomalies. Our team reviews security alerts and responds according to
        our incident response procedures.
      </p>

      <h2>Reporting a Vulnerability</h2>
      <p>
        If you discover a security vulnerability, please report it through our{' '}
        <a
          href="/contact"
          className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
        >
          Contact page
        </a>
        . Include a description of the vulnerability, steps to reproduce, and any potential impact.
        We will review and investigate all valid reports.
      </p>
    </LegalPageTemplate>
  );
}
