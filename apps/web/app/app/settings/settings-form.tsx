'use client';

import { useState, useTransition } from 'react';
import { Button } from '@claimradar/design-system';
import { saveNotificationPreferences } from '../actions';

interface SettingsFormProps {
  emailEnabled: boolean;
  browserEnabled: boolean;
  whatsappEnabled: boolean;
  digestFrequency: string;
}

const DIGEST_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'never', label: 'Never' },
];

export function SettingsForm({
  emailEnabled,
  browserEnabled,
  whatsappEnabled,
  digestFrequency,
}: SettingsFormProps) {
  const [email, setEmail] = useState(emailEnabled);
  const [browser, setBrowser] = useState(browserEnabled);
  const [whatsapp, setWhatsapp] = useState(whatsappEnabled);
  const [digest, setDigest] = useState(digestFrequency);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    formData.set('emailEnabled', email ? 'on' : 'off');
    formData.set('browserEnabled', browser ? 'on' : 'off');
    formData.set('whatsappEnabled', whatsapp ? 'on' : 'off');
    formData.set('digestFrequency', digest);
    startTransition(async () => {
      setFeedback(await saveNotificationPreferences(formData));
    });
  }

  const checkboxClass =
    'flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm text-text-secondary hover:border-text-muted';

  return (
    <form action={handleSubmit} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-text-secondary">Channels</legend>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={email}
            onChange={(event) => setEmail(event.target.checked)}
            className="mt-0.5 accent-[#7387FF]"
          />
          <span>
            <span className="block font-medium text-text-primary">Email</span>
            Match alerts and deadline reminders to your account email.
          </span>
        </label>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={browser}
            onChange={(event) => setBrowser(event.target.checked)}
            className="mt-0.5 accent-[#7387FF]"
          />
          <span>
            <span className="block font-medium text-text-primary">In-app</span>
            Show updates in your notifications inbox.
          </span>
        </label>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={whatsapp}
            onChange={(event) => setWhatsapp(event.target.checked)}
            disabled
            className="mt-0.5 accent-[#7387FF]"
          />
          <span>
            <span className="block font-medium text-text-primary">WhatsApp (coming soon)</span>
            Not available yet on the free plan.
          </span>
        </label>
      </fieldset>

      <div>
        <label
          htmlFor="digest-frequency"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Digest frequency
        </label>
        <select
          id="digest-frequency"
          value={digest}
          onChange={(event) => setDigest(event.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
        >
          {DIGEST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text-muted">
          A summary of new matches and source changes, if you prefer fewer emails.
        </p>
      </div>

      {feedback && !feedback.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
        >
          {feedback.error}
        </p>
      )}
      {feedback && feedback.ok && (
        <p
          role="status"
          className="rounded-md border border-success/20 bg-verified-background p-3 text-sm text-success"
        >
          {feedback.message ?? 'Preferences saved.'}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save preferences'}
      </Button>
    </form>
  );
}
