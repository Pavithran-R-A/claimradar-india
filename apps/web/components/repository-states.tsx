/**
 * Honest-state notices for data-driven directory pages.
 *
 * These components make the difference between "no published records yet",
 * "the database is unavailable" and "this is labelled demo data" explicit in
 * the UI. Fictional content is never presented as real.
 */

export function DemoDataBanner() {
  return (
    <div
      role="note"
      className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="font-semibold">Demo data — not real claim information</p>
      <p className="mt-1 text-amber-800">
        The records shown below are clearly-labelled demonstration records served because demo mode
        is enabled in this environment. They do not describe real companies, regulators or refund
        schemes, and all links point to example.com placeholders.
      </p>
    </div>
  );
}

export function DataUnavailableNotice({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">
        Directory temporarily unavailable
      </h2>
      <p className="mx-auto max-w-xl text-sm text-slate-600">{message}</p>
      <p className="mx-auto mt-3 max-w-xl text-xs text-slate-500">
        We only show records that exist in the verified publication database — never placeholder or
        invented entries. Please check back later.
      </p>
    </div>
  );
}

export function EmptyDirectoryNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <h2 className="mb-2 text-lg font-semibold text-slate-700">{title}</h2>
      <p className="mx-auto max-w-xl text-sm text-slate-500">{body}</p>
    </div>
  );
}
