/**
 * Honest-state notices for data-driven directory pages.
 *
 * These components make the difference between "no published records yet",
 * "the database is unavailable" and "this is labelled demo data" explicit in
 * the UI. Fictional content is never presented as real.
 */

import { Inbox, TriangleAlert } from 'lucide-react';

export function DemoDataBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-card border border-deadline/40 bg-deadline-background p-4 text-sm text-text-primary"
    >
      <p className="flex items-center gap-2 font-semibold">
        <TriangleAlert aria-hidden className="h-4 w-4 text-deadline" />
        Demo data — not real claim information
      </p>
      <p className="mt-1 text-text-secondary">
        The records shown below are clearly-labelled demonstration records served because demo mode
        is enabled in this environment. They do not describe real companies, regulators or refund
        schemes, and all links point to example.com placeholders.
      </p>
    </div>
  );
}

export function DataUnavailableNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-card border border-border bg-surface p-8 text-center shadow-card sm:p-12"
    >
      <TriangleAlert aria-hidden className="mx-auto h-6 w-6 text-deadline" />
      <h2 className="mb-2 mt-3 text-lg font-semibold text-text-primary">
        Directory temporarily unavailable
      </h2>
      <p className="mx-auto max-w-xl text-sm text-text-secondary">{message}</p>
      <p className="mx-auto mt-3 max-w-xl text-xs text-text-muted">
        We only show records that exist in the verified publication database — never placeholder or
        invented entries. Please check back later.
      </p>
    </div>
  );
}

export function EmptyDirectoryNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface p-10 text-center sm:p-14">
      <Inbox aria-hidden className="mx-auto h-6 w-6 text-text-muted" />
      <h2 className="mb-2 mt-3 text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mx-auto max-w-xl text-sm text-text-secondary">{body}</p>
    </div>
  );
}
