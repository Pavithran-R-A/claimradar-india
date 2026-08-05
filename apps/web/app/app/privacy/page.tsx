import { Alert, Badge, Card, EmptyState } from '@claimradar/design-system';
import { ShieldCheck } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { getPrivacyData } from '@/lib/user-data';
import { formatDate } from '../_components/badges';
import {
  CorrectionForm,
  DeletionForm,
  ExportButton,
  GrievanceForm,
  WithdrawConsentForm,
} from './privacy-forms';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'pending' || status === 'scheduled' ? 'deadline' : 'success';
  return <Badge variant={variant}>{status}</Badge>;
}

function RequestList({
  items,
  render,
  emptyLabel,
}: {
  items: { id: string; created_at: string; status: string }[];
  render?: (item: { id: string; created_at: string; status: string }) => string;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm text-text-primary">
              {render ? render(item) : 'Request'}
            </p>
            <p className="text-xs text-text-muted">{formatDate(item.created_at)}</p>
          </div>
          <StatusBadge status={item.status} />
        </li>
      ))}
    </ul>
  );
}

export default async function PrivacyPage() {
  const user = await requireAppAuth();
  const privacy = await getPrivacyData(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text-primary">
          <ShieldCheck className="h-6 w-6 text-trust-primary" aria-hidden />
          Privacy center
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Everything we hold about you, and every control you have over it. We only ever collect the
          low-risk answers you give us — never documents, IDs or payment details.
        </p>
      </div>

      {privacy.unavailable && (
        <Alert variant="warning" title="Privacy data temporarily unavailable">
          We could not reach the database. Your requests can still be submitted and will be recorded
          once it is back.
        </Alert>
      )}

      {/* Retention notice */}
      <Card>
        <h2 className="mb-2 text-base font-semibold text-text-primary">How long we keep data</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-text-muted">
          <li>Account and matching profile: kept while your account is active.</li>
          <li>
            Deletion requests: processed after a 30-day grace period, then personal data is
            permanently removed.
          </li>
          <li>
            Consent audit log: kept as an integrity record so your decisions can always be proven.
          </li>
          <li>
            Grievance records: kept only as long as needed to resolve and demonstrate handling.
          </li>
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Consent events */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-text-primary">Consent history</h2>
          {privacy.consentEvents.length === 0 ? (
            <p className="text-sm text-text-muted">
              No consent events recorded yet. Consents granted during setup will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {privacy.consentEvents.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary">
                      {event.consent_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(event.created_at)}</p>
                  </div>
                  <Badge variant={event.granted ? 'success' : 'danger'}>
                    {event.granted ? 'Granted' : 'Withdrawn'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Withdraw consent */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-text-primary">Withdraw consent</h2>
          <WithdrawConsentForm />
          {privacy.withdrawalRequests.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Withdrawal requests</h3>
              <RequestList
                items={privacy.withdrawalRequests.map((r) => ({
                  id: r.id,
                  created_at: r.created_at,
                  status: r.status,
                }))}
                emptyLabel="No withdrawal requests."
              />
            </div>
          )}
        </Card>

        {/* Corrections */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            Correct your information
          </h2>
          <CorrectionForm />
          {privacy.correctionRequests.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Correction requests</h3>
              <RequestList
                items={privacy.correctionRequests}
                render={(item) =>
                  privacy.correctionRequests.find((r) => r.id === item.id)?.target ?? 'Request'
                }
                emptyLabel="No correction requests."
              />
            </div>
          )}
        </Card>

        {/* Grievance */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            Contact the grievance officer
          </h2>
          <GrievanceForm />
          {privacy.grievances.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Your grievances</h3>
              <RequestList
                items={privacy.grievances.map((g) => ({
                  id: g.id,
                  created_at: g.created_at,
                  status: g.status,
                }))}
                emptyLabel="No grievances logged."
              />
            </div>
          )}
        </Card>

        {/* Export */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-text-primary">Export your data</h2>
          <ExportButton />
          {privacy.exportRequests.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Export requests</h3>
              <RequestList items={privacy.exportRequests} emptyLabel="No export requests." />
            </div>
          )}
        </Card>

        {/* Deletion */}
        <Card className="border-danger/30">
          <h2 className="mb-3 text-base font-semibold text-danger">Delete your account</h2>
          <DeletionForm />
          {privacy.deletionRequests.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Deletion requests</h3>
              <RequestList items={privacy.deletionRequests} emptyLabel="No deletion requests." />
            </div>
          )}
        </Card>
      </div>

      {privacy.unavailable && (
        <Card>
          <EmptyState
            className="py-8"
            title="History unavailable"
            description="Your past requests could not be loaded right now, but new submissions will still be accepted."
          />
        </Card>
      )}
    </div>
  );
}
