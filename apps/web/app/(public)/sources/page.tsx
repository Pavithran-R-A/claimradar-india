import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Sources',
  'Official sources monitored by ClaimRadar India.',
);

export default function SourcesPage() {
  return (
    <LegalPageTemplate title="Sources We Monitor" lastUpdated="July 27, 2026">
      <p className="text-base">
        ClaimRadar monitors 42+ official sources across five categories. Below is a representative
        list of the source types we track.
      </p>

      <h2>Consumer Authorities</h2>
      <ul>
        <li>National Consumer Disputes Redressal Commission (NCDRC)</li>
        <li>State Consumer Disputes Redressal Commissions</li>
        <li>District Consumer Disputes Redressal Forums</li>
        <li>National Consumer Helpline (NCH) — consumer grievance data</li>
        <li>Central Consumer Protection Authority (CCPA) — orders and notices</li>
      </ul>

      <h2>Courts and Tribunals</h2>
      <ul>
        <li>Supreme Court of India — judgments and orders on consumer matters</li>
        <li>High Courts — consumer protection and class-action filings</li>
        <li>National Company Law Tribunal (NCLT) — insolvency and consumer matters</li>
        <li>Telecom Disputes Settlement and Appellate Tribunal (TDSAT)</li>
        <li>Insurance Ombudsman — decisions and annual reports</li>
      </ul>

      <h2>Financial Regulators</h2>
      <ul>
        <li>Reserve Bank of India (RBI) — circulars, directives, penalty orders</li>
        <li>Securities and Exchange Board of India (SEBI) — orders, consent settlements</li>
        <li>Insurance Regulatory and Development Authority (IRDAI) — directives and notices</li>
        <li>Banking Ombudsman Scheme — annual reports and case summaries</li>
        <li>Pension Fund Regulatory and Development Authority (PFRDA)</li>
      </ul>

      <h2>Company Public Notices</h2>
      <ul>
        <li>Listed company announcements on BSE and NSE</li>
        <li>Company websites — refund policies, recall notices, settlement announcements</li>
        <li>Ministry of Corporate Affairs (MCA) — regulatory filings and notices</li>
        <li>Competition Commission of India (CCI) — orders affecting consumers</li>
      </ul>

      <h2>Government Press Releases</h2>
      <ul>
        <li>Press Information Bureau (PIB) — government scheme announcements</li>
        <li>Ministry of Consumer Affairs — notifications and circulars</li>
        <li>State government portals — state-specific consumer schemes</li>
        <li>Department of Consumer Affairs — price monitoring and grievance data</li>
        <li>Food Safety and Standards Authority of India (FSSAI) — recall notices</li>
      </ul>

      <h2>Source Coverage Notes</h2>
      <p>
        This list is representative and may be updated as new sources become available or existing
        sources change their publication practices. We do not display official logos or seals of any
        government body or court.
      </p>
      <p>
        If you know of an official source we should be monitoring, please let us know at
        support@claimradar.example.
      </p>
    </LegalPageTemplate>
  );
}
