'use client';

import { useTransition } from 'react';
import { toggleSource } from '../actions';

export function ToggleSourceButton({ sourceId, enabled }: { sourceId: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleSource(sourceId);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-trust-primary focus:ring-offset-2 ${
        enabled ? 'bg-trust-primary' : 'bg-surface-strong'
      } ${isPending ? 'opacity-50' : ''}`}
      aria-label={enabled ? 'Disable source' : 'Enable source'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
