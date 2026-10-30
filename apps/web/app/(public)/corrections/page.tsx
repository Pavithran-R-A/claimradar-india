import { LegalPageTemplate, generateLegalMetadata } from '@/components/legal-page';
import { contactConfig } from '@claimradar/config';
import Link from 'next/link';

export const metadata = generateLegalMetadata(
  'Corrections',
  'Report errors and view our correction workflow on ClaimKhoj India.',
);

export default function CorrectionsPage() {
  return (
    <LegalPageTemplate title="Corrections" lastUpdated="August 30, 2026">
      <p className="text-base">
        We strive for accuracy, but errors can occur. Our correction process is transparent and
        publicly documented.
      </p>

      <h2>How to Report an Error</h2>
      <p>If you find incorrect or outdated information on ClaimKhoj, please report it with:</p>
      <ul>
        <li>The URL or title of the listing in question</li>
        <li>A description of the error</li>
        <li>A link or citation to the authentic official source supporting the correction</li>
        <li>Your name or contact details (optional — used for acknowledgment only)</li>
      </ul>

      {contactConfig.correctionsEmail ? (
        <p>
          Send your report to{' '}
          <a
            href={`mailto:${contactConfig.correctionsEmail}`}
            className="text-trust-primary hover:text-trust-primary-hover underline font-semibold"
          >
            {contactConfig.correctionsEmail}
          </a>
          .
        </p>
      ) : (
        <p className="text-text-secondary italic">
          A corrections email inbox is not yet configured. You can{' '}
          <Link href="/app/privacy" className="text-trust-primary underline">
            submit a correction while signed in
          </Link>
          . If you do not have an account,{' '}
          <Link href="/register" className="text-trust-primary underline">
            register first
          </Link>
          . Anonymous correction intake is not currently available.
        </p>
      )}

      <h2>Correction Workflow</h2>
      <p>Once a correction report is received:</p>
      <ul>
        <li>
          <strong>Acknowledgment</strong> — We log and acknowledge received reports as soon as
          practicable.
        </li>
        <li>
          <strong>Investigation</strong> — Our editorial team verifies the reported error against
          the original official order or regulatory publication.
        </li>
        <li>
          <strong>Decision</strong> — We determine whether a factual correction, deadline update, or
          full retraction is needed.
        </li>
        <li>
          <strong>Action</strong> — The correction is applied and a note is added to the listing.
        </li>
        <li>
          <strong>Request status</strong> — Signed-in reporters can see their request status and
          recorded resolution in the Privacy Center. Outbound email replies are not enabled.
        </li>
      </ul>

      <h2>Types of Corrections</h2>
      <ul>
        <li>
          <strong>Correction</strong> — Factual error in the listing is fixed (e.g., wrong
          eligibility criteria, incorrect deadline).
        </li>
        <li>
          <strong>Update</strong> — Listing is updated with new information (e.g., deadline
          extended, additional eligibility groups identified).
        </li>
        <li>
          <strong>Retraction</strong> — Listing is removed because the underlying information was
          found to be inaccurate or the source was not legitimate.
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
          Submit a correction through your{' '}
          <Link href="/app/privacy" className="text-trust-primary underline">
            signed-in Privacy Center
          </Link>
          . Include the official source link and avoid sensitive identity documents.
        </p>
      </div>
    </LegalPageTemplate>
  );
}
