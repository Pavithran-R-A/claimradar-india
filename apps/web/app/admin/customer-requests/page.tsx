import { requireRoles } from '@/lib/auth';
import { getAdminDb } from '@/lib/admin-db';
import { ADMINS_ONLY } from '../_lib/roles';
import { ErrorBanner, PageHeader, formatDateTime } from '../_lib/ui';
import { updateCustomerRequest } from './actions';

export const dynamic = 'force-dynamic';

type CorrectionItem = {
  id: string;
  target: string;
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
};

type GrievanceItem = {
  id: string;
  subject: string;
  message: string;
  contact_email: string;
  status: string;
  resolution: string | null;
  created_at: string;
};

/** Only administrators can view raw support submissions containing personal details. */
export default async function CustomerRequestsPage() {
  await requireRoles(ADMINS_ONLY);
  const db = getAdminDb();
  const [corrections, grievances] = await Promise.all([
    db
      .from('user_correction_requests')
      .select('id, target, description, status, resolution, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    db
      .from('grievance_contacts')
      .select('id, subject, message, contact_email, status, resolution, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);
  const correctionItems = (corrections.data ?? []) as CorrectionItem[];
  const grievanceItems = (grievances.data ?? []) as GrievanceItem[];
  const inputClass = 'w-full rounded border border-border bg-surface p-2 text-text-primary';

  return (
    <div>
      <PageHeader
        title="Customer requests"
        subtitle="Admin-only request triage. No outbound messages are sent."
      />
      {(corrections.error || grievances.error) && (
        <div className="mt-4">
          <ErrorBanner message="Could not load the support inbox. Retry; a failed query must not appear as an empty queue." />
        </div>
      )}
      {!corrections.error && !grievances.error && (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Account corrections</h2>
            {correctionItems.length === 0 && (
              <p className="mt-2 text-text-muted">No account correction requests.</p>
            )}
            {correctionItems.map((item) => (
              <article key={item.id} className="mt-3 rounded-lg border border-border p-4">
                <p className="font-semibold text-text-primary">{item.target}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">
                  {item.description}
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  {formatDateTime(item.created_at)} · {item.status}
                </p>
                {item.resolution && (
                  <p className="mt-2 text-sm text-text-secondary">Resolution: {item.resolution}</p>
                )}
                <form
                  action={updateCustomerRequest.bind(null, 'correction', item.id)}
                  className="mt-3 space-y-2"
                >
                  <label
                    htmlFor={`correction-status-${item.id}`}
                    className="block text-sm text-text-secondary"
                  >
                    Status
                  </label>
                  <select
                    id={`correction-status-${item.id}`}
                    name="status"
                    required
                    defaultValue={item.status}
                    className={inputClass}
                  >
                    <option value="new">New</option>
                    <option value="in_review">In review</option>
                    <option value="resolved">Resolved</option>
                    <option value="declined">Declined</option>
                  </select>
                  <label
                    htmlFor={`correction-note-${item.id}`}
                    className="block text-sm text-text-secondary"
                  >
                    Resolution note visible to customer
                  </label>
                  <textarea
                    id={`correction-note-${item.id}`}
                    name="resolution"
                    required
                    minLength={3}
                    maxLength={2000}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    className="rounded bg-trust-primary px-4 py-2 text-sm text-white"
                  >
                    Save decision
                  </button>
                </form>
              </article>
            ))}
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Grievances</h2>
            {grievanceItems.length === 0 && <p className="mt-2 text-text-muted">No grievances.</p>}
            {grievanceItems.map((item) => (
              <article key={item.id} className="mt-3 rounded-lg border border-border p-4">
                <p className="font-semibold text-text-primary">{item.subject}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">
                  {item.message}
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  Contact supplied: {item.contact_email} · {formatDateTime(item.created_at)} ·{' '}
                  {item.status}
                </p>
                {item.resolution && (
                  <p className="mt-2 text-sm text-text-secondary">Resolution: {item.resolution}</p>
                )}
                <form
                  action={updateCustomerRequest.bind(null, 'grievance', item.id)}
                  className="mt-3 space-y-2"
                >
                  <label
                    htmlFor={`grievance-status-${item.id}`}
                    className="block text-sm text-text-secondary"
                  >
                    Status
                  </label>
                  <select
                    id={`grievance-status-${item.id}`}
                    name="status"
                    required
                    defaultValue={item.status}
                    className={inputClass}
                  >
                    <option value="new">New</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <label
                    htmlFor={`grievance-note-${item.id}`}
                    className="block text-sm text-text-secondary"
                  >
                    Resolution note visible to customer
                  </label>
                  <textarea
                    id={`grievance-note-${item.id}`}
                    name="resolution"
                    required
                    minLength={3}
                    maxLength={2000}
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    className="rounded bg-trust-primary px-4 py-2 text-sm text-white"
                  >
                    Save decision
                  </button>
                </form>
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
