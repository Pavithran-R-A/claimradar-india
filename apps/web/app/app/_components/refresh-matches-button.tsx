'use client';

import { useState, useTransition } from 'react';
import { Button } from '@claimradar/design-system';
import { RefreshCw } from 'lucide-react';
import { refreshMatches } from '../actions';

export function RefreshMatchesButton({ label = 'Check for new matches' }: { label?: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(
    null,
  );

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      setResult(await refreshMatches());
    });
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleClick} disabled={pending}>
        <RefreshCw className={pending ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
        {pending ? 'Checking…' : label}
      </Button>
      {result && !result.ok && (
        <p role="alert" className="text-sm text-danger">
          {result.error}
        </p>
      )}
      {result && result.ok && result.message && (
        <p role="status" className="text-sm text-success">
          {result.message}
        </p>
      )}
    </div>
  );
}
