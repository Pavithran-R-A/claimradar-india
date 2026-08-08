/**
 * Honest-state notices for data-driven directory pages.
 *
 * These components make the difference between "no published records yet",
 * "the database is unavailable" and "this is labelled demo data" explicit in
 * the UI. Fictional content is never presented as real.
 */

import Link from 'next/link';
import { ShieldCheck, TriangleAlert, Bell, ArrowRight, Eye } from 'lucide-react';

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
      className="rounded-card border border-border bg-surface p-6 text-center shadow-card sm:p-8"
    >
      <TriangleAlert aria-hidden className="mx-auto h-5 w-5 text-deadline" />
      <h2 className="mb-1 mt-2 text-base font-semibold text-text-primary">
        Directory temporarily unavailable
      </h2>
      <p className="mx-auto max-w-lg text-xs leading-relaxed text-text-secondary">{message}</p>
      <p className="mx-auto mt-2 max-w-lg text-[11px] text-text-muted">
        We only show records that exist in the verified publication database — never placeholder or
        invented entries. Please check back later.
      </p>
    </div>
  );
}

export function EmptyDirectoryNotice({
  title = 'No published opportunities found',
  body = 'ClaimRadar is currently monitoring official Indian regulatory and court feeds. Opportunities are published only after human verification.',
  showActions = true,
}: {
  title?: string;
  body?: string;
  showActions?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface/70 p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-trust-primary/10 text-trust-primary">
        <ShieldCheck aria-hidden className="h-5 w-5" />
      </div>
      <h2 className="mt-3 text-base font-bold text-text-primary sm:text-lg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-text-secondary">{body}</p>

      {showActions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
          <Link
            href="/sources"
            className="inline-flex items-center gap-1.5 rounded-field border border-border bg-surface px-3.5 py-2 text-text-primary transition-colors hover:border-trust-primary hover:text-trust-primary"
          >
            <Eye className="h-3.5 w-3.5 text-trust-primary" />
            Monitored sources
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 rounded-field border border-border bg-surface px-3.5 py-2 text-text-primary transition-colors hover:border-trust-primary hover:text-trust-primary"
          >
            Verification process
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-field bg-trust-primary px-3.5 py-2 text-white transition-colors hover:bg-trust-primary-hover"
          >
            <Bell className="h-3.5 w-3.5" />
            Get alerts <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
