'use client';

import { useRef, useState, useTransition } from 'react';
import { Button, cn } from '@claimradar/design-system';

interface ActionResultLike {
  ok: boolean;
  message?: string;
  error?: string;
}

interface ActionFormProps {
  action: (formData: FormData) => Promise<ActionResultLike>;
  submitLabel: string;
  children?: React.ReactNode;
  className?: string;
  submitVariant?: 'default' | 'outline' | 'ghost';
  clearOnSuccess?: boolean;
}

/**
 * Wraps a server-action form with pending state and inline result feedback.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
  className,
  submitVariant = 'default',
  clearOnSuccess = false,
}: ActionFormProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResultLike | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const response = await action(formData);
      setResult(response);
      if (response.ok && clearOnSuccess) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className={cn('space-y-4', className)}>
      {children}
      {result && !result.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
        >
          {result.error}
        </p>
      )}
      {result && result.ok && result.message && (
        <p
          role="status"
          className="rounded-md border border-success/20 bg-verified-background p-3 text-sm text-success"
        >
          {result.message}
        </p>
      )}
      <Button type="submit" variant={submitVariant} disabled={pending}>
        {pending ? 'Working…' : submitLabel}
      </Button>
    </form>
  );
}
