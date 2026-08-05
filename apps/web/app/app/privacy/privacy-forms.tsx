'use client';

import { ActionForm } from '@/components/app/action-form';
import {
  requestAccountDeletion,
  requestAccountExport,
  submitCorrectionRequest,
  submitGrievance,
  withdrawConsent,
} from '../privacy-actions';

const inputClass =
  'h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';
const textareaClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';
const labelClass = 'mb-1.5 block text-sm font-medium text-text-secondary';

export function CorrectionForm() {
  return (
    <ActionForm action={submitCorrectionRequest} submitLabel="Submit correction" clearOnSuccess>
      <div>
        <label htmlFor="correction-target" className={labelClass}>
          What needs correcting?
        </label>
        <input
          id="correction-target"
          name="target"
          required
          minLength={3}
          maxLength={200}
          placeholder="e.g. My onboarding state, a match reason, my display name"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="correction-description" className={labelClass}>
          Describe the correction
        </label>
        <textarea
          id="correction-description"
          name="description"
          required
          minLength={10}
          maxLength={4000}
          rows={3}
          placeholder="Tell us what is wrong and what it should be. Do not include documents or sensitive numbers."
          className={textareaClass}
        />
      </div>
    </ActionForm>
  );
}

const WITHDRAWABLE_CONSENTS = [
  { value: 'onboarding_data_processing', label: 'Processing of my onboarding answers' },
  { value: 'notification_processing', label: 'Notifications (email and in-app)' },
  { value: 'marketing_emails', label: 'Marketing emails' },
];

export function WithdrawConsentForm() {
  return (
    <ActionForm action={withdrawConsent} submitLabel="Withdraw consent" clearOnSuccess>
      <div>
        <label htmlFor="withdraw-consent-type" className={labelClass}>
          Consent to withdraw
        </label>
        <select id="withdraw-consent-type" name="consentType" required className={inputClass}>
          <option value="">Choose a consent type…</option>
          {WITHDRAWABLE_CONSENTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="withdraw-reason" className={labelClass}>
          Reason (optional)
        </label>
        <textarea
          id="withdraw-reason"
          name="reason"
          maxLength={2000}
          rows={2}
          className={textareaClass}
        />
      </div>
      <p className="text-xs text-text-muted">
        Withdrawing consent stops future processing. It does not erase data we are legally required
        to keep.
      </p>
    </ActionForm>
  );
}

export function ExportButton() {
  return (
    <ActionForm action={() => requestAccountExport()} submitLabel="Request account export">
      <p className="text-xs text-text-muted">
        We will assemble everything we hold about your account and notify you when it is ready. One
        export request at a time.
      </p>
    </ActionForm>
  );
}

export function DeletionForm() {
  return (
    <ActionForm
      action={requestAccountDeletion}
      submitLabel="Request account deletion"
      clearOnSuccess
    >
      <div className="rounded-md border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
        This schedules your account and personal data for permanent deletion in 30 days. This action
        cannot be undone after the grace period.
      </div>
      <div>
        <label htmlFor="deletion-reason" className={labelClass}>
          Reason (optional)
        </label>
        <textarea
          id="deletion-reason"
          name="reason"
          maxLength={2000}
          rows={2}
          className={textareaClass}
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="confirmed"
          value="true"
          required
          className="mt-0.5 accent-[#EF4444]"
        />
        I understand my account will be permanently deleted after the 30-day grace period.
      </label>
    </ActionForm>
  );
}

export function GrievanceForm() {
  return (
    <ActionForm action={submitGrievance} submitLabel="Submit grievance" clearOnSuccess>
      <div>
        <label htmlFor="grievance-subject" className={labelClass}>
          Subject
        </label>
        <input
          id="grievance-subject"
          name="subject"
          required
          minLength={3}
          maxLength={200}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="grievance-message" className={labelClass}>
          What happened?
        </label>
        <textarea
          id="grievance-message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={4}
          placeholder="Describe your concern. Do not share passwords, OTPs or payment details."
          className={textareaClass}
        />
      </div>
      <div>
        <label htmlFor="grievance-email" className={labelClass}>
          Contact email for our response
        </label>
        <input
          id="grievance-email"
          name="contactEmail"
          type="email"
          required
          maxLength={254}
          className={inputClass}
        />
      </div>
    </ActionForm>
  );
}
