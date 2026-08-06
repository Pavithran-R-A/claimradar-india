'use client';

import { useActionState, useId, useState } from 'react';
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

/**
 * Inline impact-confirmation panel. Destructive and publication actions must
 * pass through this second step: the operator reads the impact message and
 * explicitly confirms before the server action runs. Deliberately calm — no
 * modal focus trap, no animation beyond colour transitions.
 */
function ConfirmationPanel({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  pending,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const messageId = useId();
  return (
    <div
      className="mt-2 rounded-md border border-deadline/30 bg-deadline-background p-3"
      aria-describedby={messageId}
    >
      <p id={messageId} className="text-xs leading-relaxed text-text-secondary" role="alert">
        <span className="font-semibold text-deadline">Confirm before continuing. </span>
        {message}
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`${buttonBase} bg-danger text-white hover:opacity-90`}
        >
          {pending ? `${confirmLabel}…` : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className={`${buttonBase} ${buttonVariants.outline}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Fire-and-forget server action bound to a single button. */
export function ActionButton({
  action,
  label,
  pendingLabel,
  variant = 'default',
  className,
  confirmMessage,
  confirmLabel = 'Confirm',
}: {
  action: () => Promise<ActionResult>;
  label: string;
  pendingLabel?: string;
  variant?: 'default' | 'outline' | 'danger';
  className?: string;
  /**
   * When set, the first click opens an inline confirmation showing this
   * impact message; the action only runs after explicit confirmation.
   * Required for destructive and publication-affecting actions.
   */
  confirmMessage?: string;
  confirmLabel?: string;
}) {
  const [state, dispatch, pending] = useActionState<ActionResult, undefined>(
    async () => await action(),
    {},
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => (confirmMessage ? setConfirming(true) : dispatch(undefined))}
        disabled={pending || confirming}
        className={`${buttonBase} ${buttonVariants[variant]}`}
      >
        {pending ? (pendingLabel ?? `${label}…`) : label}
      </button>
      {confirmMessage && confirming && (
        <ConfirmationPanel
          message={confirmMessage}
          confirmLabel={confirmLabel}
          pending={pending}
          onConfirm={() => dispatch(undefined)}
          onCancel={() => setConfirming(false)}
        />
      )}
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
