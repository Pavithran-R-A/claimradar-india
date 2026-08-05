'use client';

import { useActionState } from 'react';
import type { ReactNode } from 'react';

/**
 * Client controls for admin server actions. They surface the action result
 * inline (error/success) so privileged operations degrade honestly instead
 * of failing silently.
 */

export interface ActionResult {
  error?: string;
  success?: boolean;
}

const buttonBase =
  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary disabled:pointer-events-none disabled:opacity-50';

const buttonVariants: Record<string, string> = {
  default: 'bg-trust-primary text-white hover:bg-trust-primary-hover',
  outline: 'border border-border text-text-secondary hover:bg-surface hover:text-text-primary',
  danger: 'bg-danger text-white hover:opacity-90',
};

function ResultMessage({ state }: { state: ActionResult | null }) {
  if (!state || (!state.error && !state.success)) return null;
  if (state.error) {
    return (
      <p className="mt-2 text-xs text-danger" role="alert">
        {state.error}
      </p>
    );
  }
  return <p className="mt-2 text-xs text-success">Done.</p>;
}

/** Fire-and-forget server action bound to a single button. */
export function ActionButton({
  action,
  label,
  pendingLabel,
  variant = 'default',
  className,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  variant?: 'default' | 'outline' | 'danger';
  className?: string;
}) {
  const [state, dispatch, pending] = useActionState<ActionResult, undefined>(
    async () => await action(),
    {},
  );

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => dispatch(undefined)}
        disabled={pending}
        className={`${buttonBase} ${buttonVariants[variant]}`}
      >
        {pending ? (pendingLabel ?? `${label}…`) : label}
      </button>
      <ResultMessage state={state} />
    </div>
  );
}

/** Form-backed server action with arbitrary inputs and a submit button. */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  variant = 'default',
  className,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: 'default' | 'outline' | 'danger';
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => await action(formData),
    {},
  );

  return (
    <form action={formAction} className={className}>
      {children}
      <button
        type="submit"
        disabled={pending}
        className={`${buttonBase} ${buttonVariants[variant]}`}
      >
        {pending ? (pendingLabel ?? `${submitLabel}…`) : submitLabel}
      </button>
      <ResultMessage state={state} />
    </form>
  );
}
