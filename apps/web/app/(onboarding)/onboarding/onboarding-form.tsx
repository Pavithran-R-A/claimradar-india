'use client';

import { useState, useTransition } from 'react';
import { Button } from '@claimradar/design-system';
import { X } from 'lucide-react';
import {
  AVAILABILITY_OPTIONS,
  INDIAN_STATES,
  NOTIFICATION_CHANNEL_OPTIONS,
  PURCHASE_YEAR_MIN,
  SECTOR_OPTIONS,
  type NotificationChannelPreference,
  type ReceiptAvailability,
} from '@/lib/constants';
import { completeOnboarding } from '../actions';

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - PURCHASE_YEAR_MIN + 1 },
  (_, i) => currentYear - i,
);

export function OnboardingForm() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyDraft, setCompanyDraft] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [receipt, setReceipt] = useState<ReceiptAvailability>('unsure');
  const [reference, setReference] = useState<ReceiptAvailability>('unsure');
  const [channel, setChannel] = useState<NotificationChannelPreference>('email');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function addCompany() {
    const value = companyDraft.trim();
    if (!value) return;
    if (companies.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setCompanyDraft('');
      return;
    }
    setCompanies((prev) => [...prev, value]);
    setCompanyDraft('');
  }

  function toggleSector(sector: string) {
    setSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const payload = {
      companiesUsed: companies,
      sectorsUsed: sectors,
      purchasePeriodStart: periodStart ? Number(periodStart) : null,
      purchasePeriodEnd: periodEnd ? Number(periodEnd) : null,
      state: state || null,
      receiptAvailability: receipt,
      referenceAvailability: reference,
      notificationPreference: channel,
    };
    formData.set('payload', JSON.stringify(payload));
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.');
      }
    });
  }

  const labelClass = 'mb-1.5 block text-sm font-medium text-text-secondary';
  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Companies used */}
      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          Which companies have you bought from or used?
        </legend>
        <p className="mb-3 text-sm text-text-muted">
          Names only — no account numbers or documents. Add up to 20.
        </p>
        <div className="flex gap-2">
          <input
            value={companyDraft}
            onChange={(event) => setCompanyDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCompany();
              }
            }}
            placeholder="e.g. Flipkart, Airtel, SBI"
            className={inputClass}
            aria-label="Company name"
          />
          <Button type="button" variant="outline" onClick={addCompany}>
            Add
          </Button>
        </div>
        {companies.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {companies.map((company) => (
              <li
                key={company}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-primary"
              >
                {company}
                <button
                  type="button"
                  aria-label={`Remove ${company}`}
                  onClick={() => setCompanies((prev) => prev.filter((c) => c !== company))}
                  className="text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {/* Sectors used */}
      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          Which sectors do you use most?
        </legend>
        <p className="mb-3 text-sm text-text-muted">Pick any that apply.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SECTOR_OPTIONS.map((sector) => {
            const selected = sectors.includes(sector);
            return (
              <button
                key={sector}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSector(sector)}
                className={
                  selected
                    ? 'rounded-md border border-trust-primary bg-trust-primary/10 px-3 py-2 text-sm font-medium text-trust-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary'
                    : 'rounded-md border border-border bg-background px-3 py-2 text-sm text-text-secondary hover:border-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary'
                }
              >
                {sector}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Purchase period */}
      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          Roughly when did you make these purchases?
        </legend>
        <p className="mb-3 text-sm text-text-muted">Approximate is fine — year precision only.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="period-start" className={labelClass}>
              From year
            </label>
            <select
              id="period-start"
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              className={inputClass}
            >
              <option value="">Any time</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period-end" className={labelClass}>
              To year
            </label>
            <select
              id="period-end"
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              className={inputClass}
            >
              <option value="">Until now</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* State */}
      <div>
        <label htmlFor="state" className="text-base font-semibold text-text-primary">
          Which state were you mostly based in?
        </label>
        <p className="mb-3 mt-1 text-sm text-text-muted">
          Helps match region-specific claimables. Optional.
        </p>
        <select
          id="state"
          value={state}
          onChange={(event) => setState(event.target.value)}
          className={inputClass}
        >
          <option value="">Prefer not to say</option>
          {INDIAN_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Proof availability */}
      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          Do you usually keep purchase receipts?
        </legend>
        <p className="mb-3 text-sm text-text-muted">
          We only ask yes/no — never upload documents here.
        </p>
        <div className="flex flex-wrap gap-3">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="radio"
                name="receipt-availability"
                value={option.value}
                checked={receipt === option.value}
                onChange={() => setReceipt(option.value)}
                className="accent-trust-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          Do you have transaction references (order IDs, UTRs, statement entries)?
        </legend>
        <div className="flex flex-wrap gap-3">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="radio"
                name="reference-availability"
                value={option.value}
                checked={reference === option.value}
                onChange={() => setReference(option.value)}
                className="accent-trust-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Notification preference */}
      <fieldset>
        <legend className="mb-1 text-base font-semibold text-text-primary">
          How should we tell you about matches?
        </legend>
        <div className="flex flex-col gap-3">
          {NOTIFICATION_CHANNEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <input
                type="radio"
                name="notification-preference"
                value={option.value}
                checked={channel === option.value}
                onChange={() => setChannel(option.value)}
                className="accent-trust-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-md border border-border bg-background-elevated p-4 text-xs text-text-muted">
        <p className="font-medium text-text-secondary">Privacy first</p>
        <p className="mt-1">
          We only collect the low-risk answers above. We never ask for receipts, IDs, bank details
          or other sensitive documents during setup. You can review, correct, export or delete this
          data any time in the Privacy center.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Setting things up…' : 'Finish setup & find my matches'}
      </Button>
    </form>
  );
}
