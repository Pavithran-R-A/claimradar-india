import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Editorial Policy',
  'How ClaimKhoj India publishes, reviews and corrects content.',
);

export default function EditorialPolicyPage() {
  return (
    <LegalPageTemplate title="Editorial Policy" lastUpdated="July 27, 2026">
      <p className="text-base">
        This policy governs how content is published on ClaimKhoj India. Our editorial standards
        prioritise accuracy, source transparency and consumer protection.
      </p>

      <h2>Publication Rules</h2>
      <p>
        No content is auto-published without human review. Every listing passes through the
        following steps before going live:
      </p>
      <ul>
        <li>
          <strong>Automated discovery</strong> — AI crawlers extract data from official sources
        </li>
        <li>
          <strong>Deterministic validation</strong> — Automated checks verify dates, URLs and entity
          matches
        </li>
        <li>
          <strong>Editorial review</strong> — A human editor reviews the extraction against the
          original source document
        </li>
        <li>
          <strong>Publication</strong> — Only after editorial sign-off is the listing published
        </li>
      </ul>

      <h2>Auto-Publish Criteria</h2>
      <p>
        In limited cases, listings from Tier 1 sources (court orders, regulatory directives) may be
        published with expedited review when:
      </p>
      <ul>
        <li>The source document is from a verified Tier 1 URL</li>
        <li>All deterministic validation checks pass</li>
        <li>The Claimability Score exceeds 85</li>
        <li>A human editor reviews the listing within 24 hours of publication</li>
      </ul>

      <h2>Status Assignment</h2>
      <p>Editors assign one of four statuses based on source tier and verification level:</p>
      <ul>
        <li>
          <strong>Verified</strong> — Tier 1 source confirmed
        </li>
        <li>
          <strong>Open</strong> — Tier 2 source, appears legitimate
        </li>
        <li>
          <strong>Under Review</strong> — Pending editorial sign-off or additional corroboration
        </li>
        <li>
          <strong>Closed</strong> — Deadline passed, scheme concluded, or withdrawn
        </li>
      </ul>

      <h2>Re-Verification Schedule</h2>
      <p>Published listings are re-verified at regular intervals:</p>
      <ul>
        <li>Verified listings — re-verified every 7 days</li>
        <li>Open listings — re-verified every 14 days</li>
        <li>
          Listings approaching deadline — re-verified every 48 hours when within 7 days of deadline
        </li>
      </ul>

      <h2>Correction Policy</h2>
      <p>
        When errors are identified (through user reports, editorial review, or automated
        monitoring), corrections are processed as follows:
      </p>
      <ul>
        <li>
          <strong>Minor corrections</strong> (typos, formatting) — Applied immediately with a
          &quot;corrected&quot; timestamp
        </li>
        <li>
          <strong>Substantive corrections</strong> (eligibility, dates, amounts) — Applied within 24
          hours with a visible correction note
        </li>
        <li>
          <strong>Retractions</strong> (listing found to be inaccurate or misleading) — Listing
          removed immediately with a retraction notice published
        </li>
      </ul>
      <p>
        All corrections are logged in our correction register, which is publicly accessible on our
        Corrections page.
      </p>

      <h2>Editorial Independence</h2>
      <p>
        Editorial decisions are made independently of commercial considerations. We do not accept
        payment from companies to feature or suppress listings. Our editorial team operates
        independently of business operations.
      </p>
    </LegalPageTemplate>
  );
}
