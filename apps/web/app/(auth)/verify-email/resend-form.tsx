'use client';

import { useState } from 'react';
import { Button } from '@claimradar/design-system';
import { resendVerification } from '../actions';

export function ResendVerificationForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus('loading');
    setError(null);
    const result = await resendVerification(formData);
    if (result?.error) {
      setError(result.error);
      setStatus('idle');
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-md border border-success/20 bg-verified-background p-3 text-sm text-success">
        Verification email requested. Check your inbox (and spam folder) for the new link.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="resend-email"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          Account email
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
          placeholder="you@example.com"
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" variant="outline" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Resend Verification Email'}
      </Button>
    </form>
  );
}
