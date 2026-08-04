import Link from 'next/link';
import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'How It Works',
  'Learn how ClaimRadar discovers and surfaces claimable opportunities for you.',
);

export default function HowItWorksPage() {
  return (
    <LegalPageTemplate title="How It Works" lastUpdated="July 27, 2026">
      <p className="text-base">
        ClaimRadar monitors official sources across India to surface refund, compensation and claim
        opportunities — then matches them to companies and services you use.
      </p>

      <h2>Step 1: Build Your Watchlist</h2>
      <p>
        Start by adding companies, products, or services you use to your watchlist. This could be
        your bank, telecom provider, e-commerce platform, travel service, or any company whose
        products you have purchased.
      </p>
      <p>
        Your watchlist is the foundation of your personalised alerts. The more companies you add,
        the more opportunities we can match you to.
      </p>

      <h2>Step 2: Automated Source Monitoring</h2>
      <p>Our systems continuously scan five categories of official sources:</p>
      <ul>
        <li>
          <strong>Consumer authorities</strong> — Central and state consumer commission orders,
          National Consumer Helpline data
        </li>
        <li>
          <strong>Courts and tribunals</strong> — High court and Supreme Court judgments,
          class-action filings, tribunal orders
        </li>
        <li>
          <strong>Financial regulators</strong> — RBI circulars, SEBI orders, IRDAI directives,
          banking ombudsman decisions
        </li>
        <li>
          <strong>Company public notices</strong> — Refund announcements, recall notices, settlement
          schemes, warranty extensions
        </li>
        <li>
          <strong>Government press releases</strong> — PIB releases, ministry notifications, state
          government schemes
        </li>
      </ul>
      <p>
        When our systems detect a new opportunity or update to an existing one, it enters our
        editorial pipeline.
      </p>

      <h2>Step 3: AI Extraction &amp; Editorial Review</h2>
      <p>
        Automated extraction identifies key data points: who qualifies, deadlines, official process
        links, required documentation. Our editorial team then reviews each extraction against our
        publication criteria before anything goes live.
      </p>
      <p>
        This two-layer approach — AI discovery plus human review — ensures accuracy while
        maintaining coverage breadth.
      </p>

      <h2>Step 4: Matching &amp; Alerts</h2>
      <p>
        Published opportunities are matched against your watchlist. When a match is found, you
        receive an email or push notification with:
      </p>
      <ul>
        <li>The company or service name</li>
        <li>What the opportunity is (refund, compensation, claim)</li>
        <li>Who may qualify</li>
        <li>Deadline (if applicable)</li>
        <li>Link to the official source</li>
        <li>Status classification (Verified, Under Review, Open)</li>
      </ul>

      <h2>Step 5: You Take Action</h2>
      <p>
        Each listing includes the official process for filing a claim or complaint. You file
        directly with the relevant authority — ClaimRadar does not file on your behalf.
      </p>
      <p>
        Our guides section provides educational content about consumer rights, complaint procedures,
        and regulatory processes to help you navigate the official channels.
      </p>

      <h2>What ClaimRadar Does Not Do</h2>
      <ul>
        <li>We do not file claims or complaints on your behalf</li>
        <li>We do not guarantee that you will receive any refund or compensation</li>
        <li>We do not provide legal advice</li>
        <li>We do not act as a law firm, claims manager, or financial advisor</li>
        <li>We do not collect Aadhaar numbers, bank details, or other sensitive personal data</li>
      </ul>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
        <h3 className="text-lg font-semibold text-text-primary">Ready to get started?</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Create a free account and build your watchlist today.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-trust-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
        >
          Create Free Account
        </Link>
      </div>
    </LegalPageTemplate>
  );
}
