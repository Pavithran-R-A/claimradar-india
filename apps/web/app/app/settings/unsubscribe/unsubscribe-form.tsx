'use client';

import { useState, useTransition } from 'react';
import { Button } from '@claimradar/design-system';
import { unsubscribeFromEmail } from './actions';

interface UnsubscribeFormProps {
  uid: string;
  token: string;
}

export function UnsubscribeForm({ uid, token }: UnsubscribeFormProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    formData.set('uid', uid);
    formData.set('token', token);
    startTransition(async () => {
      setFeedback(await unsubscribeFromEmail(formData));
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
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
          {feedback.message}
        </p>
      )}
      {!feedback?.ok && (
        <Button type="submit" disabled={pending}>
          {pending ? 'Unsubscribing…' : 'Unsubscribe from email'}
        </Button>
      )}
    </form>
  );
}
