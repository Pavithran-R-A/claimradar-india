import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';

export const metadata = generateLegalMetadata(
  'Corrections',
  'Report errors and view our correction workflow on ClaimRadar India.',
);

export default function CorrectionsPage() {
  return (
    <LegalPageTemplate title="Corrections" lastUpdated="July 27, 2026">
      <p className="text-base">
        We strive for accuracy, but errors can occur. Our correction process is transparent and
        publicly documented.
      </p>

      <h2>How to Report an Error</h2>
      <p>
        If you find incorrect or outdated information on ClaimRadar, please report it by emailing
        corrections@claimradar.example with:
      </p>
      <ul>
        <li>The URL or title of the listing in question</li>
        <li>A description of the error</li>
        <li>A link to the official source (if available) supporting the correction</li>
        <li>Your name (optional — used for acknowledgment only)</li>
      </ul>

      <h2>Correction Workflow</h2>
      <p>Once a correction report is received:</p>
      <ul>
        <li>
          <strong>Acknowledgment</strong> — We acknowledge receipt within 4 business hours
        </li>
        <li>
          <strong>Investigation</strong> — Our editorial team verifies the reported error against
          the original source
        </li>
        <li>
          <strong>Decision</strong> — Within 48 hours, we determine whether a correction, update, or
          retraction is needed
        </li>
        <li>
          <strong>Action</strong> — The correction is applied and a note is added to the listing
        </li>
        <li>
          <strong>Notification</strong> — The reporter is notified of the outcome
        </li>
      </ul>

      <h2>Types of Corrections</h2>
      <ul>
        <li>
          <strong>Correction</strong> — Factual error in the listing is fixed (e.g., wrong
          eligibility criteria, incorrect deadline)
        </li>
        <li>
          <strong>Update</strong> — Listing is updated with new information (e.g., deadline
          extended, additional eligibility groups identified)
        </li>
        <li>
          <strong>Retraction</strong> — Listing is removed because the underlying information was
          found to be inaccurate or the source was not legitimate
        </li>
      </ul>

      <h2>Correction Log</h2>
      <p>All corrections and retractions are logged in a public register. The log includes:</p>
      <ul>
        <li>Date of correction</li>
        <li>Listing affected</li>
        <li>Type of correction (correction, update, or retraction)</li>
        <li>Summary of what was changed and why</li>
      </ul>
      <p className="text-text-muted text-xs mt-4">
        The correction log will be populated as corrections are processed. Currently, no corrections
        have been logged.
      </p>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
        <h3 className="text-lg font-semibold text-text-primary">Found an error?</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Email us at corrections@claimradar.example
        </p>
      </div>
    </LegalPageTemplate>
  );
}
