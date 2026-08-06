'use client';

import { useState, useTransition } from 'react';
import { toggleSource } from '../actions';

/**
 * Enable/disable switch for a crawl source. Disabling is operationally
 * significant (the daily crawl stops ingesting this source), so it goes
 * through a two-step inline confirmation. Enabling is low-risk and direct.
 */
export function ToggleSourceButton({ sourceId, enabled }: { sourceId: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  function runToggle() {
    setConfirmingDisable(false);
    startTransition(async () => {
      await toggleSource(sourceId);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => (enabled ? setConfirmingDisable(true) : runToggle())}
        disabled={isPending}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-trust-primary focus:ring-offset-2 focus:ring-offset-background ${
          enabled ? 'bg-trust-primary' : 'bg-surface-strong'
        } ${isPending ? 'opacity-50' : ''}`}
        aria-label={enabled ? `Disable source` : `Enable source`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className={`text-xs ${enabled ? 'text-success' : 'text-text-muted'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
      {confirmingDisable && (
        <div
          className="rounded-md border border-deadline/30 bg-deadline-background p-2"
          role="alert"
        >
          <p className="max-w-[220px] text-xs leading-relaxed text-text-secondary">
            Disabling stops the daily crawl from ingesting this source until it is re-enabled.
          </p>
          <div className="mt-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={runToggle}
              disabled={isPending}
              className="rounded-md bg-danger px-2 py-1 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary disabled:opacity-50"
            >
              {isPending ? 'Disabling…' : 'Disable'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDisable(false)}
              disabled={isPending}
              className="rounded-md border border-border px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
