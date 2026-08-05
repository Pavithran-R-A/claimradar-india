import Link from 'next/link';
import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'About ClaimRadar',
  'Our mission, how we work, and why ClaimRadar exists.',
);

export default function AboutPage() {
  return (
    <LegalPageTemplate title="About ClaimRadar" lastUpdated="July 27, 2026">
      <p className="text-base">
        ClaimRadar is an independent information platform that helps Indian consumers discover and
        track refund, compensation and claim opportunities from official sources.
      </p>

      <h2>Our Mission</h2>
      <p>
        Every year, crores of rupees in refunds, compensation payouts and consumer claim
        opportunities go unclaimed in India — not because people are ineligible, but because they
        never learn about them. Court orders are published in legal databases. Regulatory circulars
        appear on government portals. Company notices are buried in annual reports. ClaimRadar
        exists to change this.
      </p>

      <h2>Why ClaimRadar Exists</h2>
      <p>
        The information gap between official sources and consumers is real and significant. Most
        consumers do not regularly monitor consumer commission websites, regulatory circulars, or
        company public notices. By the time news about a refund scheme or compensation order reaches
        mainstream media, deadlines may have already passed.
      </p>
      <p>
        ClaimRadar bridges this gap by systematically monitoring official sources and surfacing
        opportunities in a format that is accessible, timely and actionable.
      </p>

      <h2>How Automation Works</h2>
      <p>
        Our technology stack continuously scans 42+ official sources across five categories:
        consumer authorities, courts and tribunals, financial regulators, company public notices,
        and government press releases. Natural language processing extracts structured data —
        company names, eligibility criteria, deadlines, official process links — from unstructured
        official documents.
      </p>

      <h2>Human Safeguards</h2>
      <p>
        Automation discovers and extracts; humans review and publish. Every piece of content on
        ClaimRadar passes through editorial review before going live. Our editorial team checks:
      </p>
      <ul>
        <li>Source authenticity — is the source legitimate and official?</li>
        <li>Accuracy — does the extraction match the original document?</li>
        <li>
          Eligibility clarity — is the &quot;who may qualify&quot; description clear and accurate?
        </li>
        <li>Deadline verification — are dates correct and current?</li>
        <li>Status classification — does the listing meet our publication criteria?</li>
      </ul>

      <h2>What We Don&apos;t Do</h2>
      <ul>
        <li>We do not file claims or complaints on your behalf</li>
        <li>We do not provide legal, financial or tax advice</li>
        <li>We do not guarantee any outcomes or payouts</li>
        <li>We do not invent estimated refund amounts</li>
        <li>We do not sell user data to third parties</li>
        <li>We are not affiliated with any government body, court or regulator</li>
      </ul>

      <h2>Revenue Model</h2>
      <p>
        ClaimRadar is funded through optional paid subscriptions (ClaimRadar Plus). The core
        platform — browsing all published claimables, searching, viewing sources and deadlines — is
        free for everyone. Plus subscribers get additional features like unlimited watchlists,
        real-time alerts and detailed source breakdowns.
      </p>
      <p>
        We do not accept advertising from companies featured on the Platform. We do not earn
        commissions or referral fees from any claims or legal services.
      </p>

      <h2>Independence</h2>
      <p>
        ClaimRadar is independently operated and privately funded. We maintain editorial
        independence from all companies, regulators and government bodies referenced on the
        Platform. Our editorial decisions are based solely on the accuracy and relevance of publicly
        available information.
      </p>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
        <h3 className="text-lg font-semibold text-text-primary">Join ClaimRadar today</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Start tracking opportunities that matter to you.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-trust-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
        >
          Create Free Account
        </Link>
      </div>
    </LegalPageTemplate>
  );
}
