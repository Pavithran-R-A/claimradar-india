import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Methodology',
  'How ClaimRadar discovers, verifies and classifies claimable opportunities.',
);

export default function MethodologyPage() {
  return (
    <LegalPageTemplate title="Methodology" lastUpdated="July 27, 2026">
      <p className="text-base">
        Our methodology combines automated source monitoring with human editorial review to ensure
        accuracy, timeliness and transparency.
      </p>

      <h2>Source Tiers</h2>
      <p>Sources are classified into tiers based on reliability and authority:</p>
      <ul>
        <li>
          <strong>Tier 1 (Authoritative)</strong> — Court orders, regulatory directives, government
          gazette notifications. These carry the highest confidence.
        </li>
        <li>
          <strong>Tier 2 (Official)</strong> — Government press releases, regulatory circulars,
          company public notices published on official channels.
        </li>
        <li>
          <strong>Tier 3 (Supplementary)</strong> — News reports from established publications,
          consumer forum summaries, industry analyses referencing primary sources.
        </li>
      </ul>

      <h2>Discovery Phase</h2>
      <p>
        Automated crawlers scan Tier 1 and Tier 2 sources continuously. Our systems monitor 42+
        official websites, databases and feeds. New documents are flagged for extraction when they
        match claim-related keywords, entity patterns, or regulatory schema.
      </p>

      <h2>AI Extraction</h2>
      <p>
        Natural language processing models extract structured fields from unstructured official
        documents:
      </p>
      <ul>
        <li>Entity identification — company names, product names, service categories</li>
        <li>Eligibility criteria — who qualifies, geographic scope, time periods</li>
        <li>Deadlines — filing deadlines, claim windows, expiry dates</li>
        <li>
          Process links — URLs to official claim forms, complaint portals, contact information
        </li>
        <li>Amount references — only when explicitly stated in the source document</li>
      </ul>

      <h2>Deterministic Checks</h2>
      <p>After AI extraction, deterministic validation rules verify:</p>
      <ul>
        <li>Source URL is still live and accessible</li>
        <li>Extracted dates are in the future (for deadlines)</li>
        <li>Company entities match our known entity database</li>
        <li>No duplicate entries exist for the same claim event</li>
        <li>Cross-reference with other sources for corroboration where available</li>
      </ul>

      <h2>Status Definitions</h2>
      <p>Every listing on ClaimRadar carries one of four statuses:</p>
      <ul>
        <li>
          <strong>Verified</strong> — Confirmed from Tier 1 sources. The claim opportunity is
          documented in an official court order, regulatory directive, or government notification.
        </li>
        <li>
          <strong>Open</strong> — Sourced from Tier 2 official channels (company notices, press
          releases). The opportunity appears legitimate but has not been independently verified
          through Tier 1 sources.
        </li>
        <li>
          <strong>Under Review</strong> — Initial extraction complete but awaiting editorial review
          or additional source corroboration before full publication.
        </li>
        <li>
          <strong>Closed</strong> — The claim window has expired, the scheme has concluded, or the
          opportunity has been withdrawn by the issuing authority.
        </li>
      </ul>

      <h2>Claimability Score</h2>
      <p>Each opportunity is assigned a Claimability Score (1–100) based on:</p>
      <ul>
        <li>Source tier and reliability (30%)</li>
        <li>Clarity of eligibility criteria (25%)</li>
        <li>Time remaining before deadline (20%)</li>
        <li>Availability of official process documentation (15%)</li>
        <li>Corroboration from multiple sources (10%)</li>
      </ul>
      <p>
        The score helps users prioritise which opportunities to explore first. A higher score
        indicates clearer eligibility, stronger sources, and more time to act.
      </p>
    </LegalPageTemplate>
  );
}
