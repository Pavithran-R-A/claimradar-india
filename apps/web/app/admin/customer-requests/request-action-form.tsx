"use client";

import { useActionState, type ReactNode } from "react";
import type { CustomerRequestActionState } from "./actions";

type BoundRequestAction = (
  state: CustomerRequestActionState,
  formData: FormData,
) => Promise<CustomerRequestActionState>;

export function RequestActionForm({
  action,
  className,
  children,
}: {
  action: BoundRequestAction;
  className: string;
  children: ReactNode;
}) {
  const initialState: CustomerRequestActionState = {
    kind: "idle",
    message: "",
  };
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.message && (
        <p
          role={state.kind === "error" ? "alert" : "status"}
          aria-live={state.kind === "error" ? "assertive" : "polite"}
          className={
            state.kind === "error"
              ? "text-sm text-danger"
              : "text-sm text-success"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
