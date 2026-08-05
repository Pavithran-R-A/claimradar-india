import { Card, Badge } from '@claimradar/design-system';
import { requireRoles } from '@/lib/auth';
import { ADMINS_ONLY } from '../_lib/roles';
import { PageHeader } from '../_lib/ui';

/**
 * Admin settings — read-only visibility of feature flags and source defaults.
 * Flags are deployment-time configuration; changing them requires an env
 * change + redeploy, never a runtime toggle in the admin UI.
 */
export default async function SettingsPage() {
  await requireRoles(ADMINS_ONLY);

  const enableBilling = process.env.NEXT_PUBLIC_ENABLE_BILLING === 'true';
  const autoVerifyClaimables = process.env.AUTO_VERIFY_CLAIMABLES === 'true';

  return (
    <div>
      <PageHeader title="Settings" subtitle="Read-only deployment configuration" />

      {/* Feature flags */}
      <h2 className="mt-6 text-lg font-semibold text-text-primary">Feature Flags</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-text-primary">ENABLE_BILLING</p>
            <Badge variant={enableBilling ? 'success' : 'neutral'}>
              {enableBilling ? 'enabled' : 'disabled'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Gates paid subscription features (Razorpay). Read from{' '}
            <code>NEXT_PUBLIC_ENABLE_BILLING</code> at build time.
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-text-primary">AUTO_VERIFY_CLAIMABLES</p>
            <Badge variant={autoVerifyClaimables ? 'danger' : 'success'}>
              {autoVerifyClaimables ? 'enabled — review policy' : 'disabled (required)'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Policy: must remain <strong>false</strong>. When disabled, no claimable can reach{' '}
            <code>verified_claimable</code> or be published without explicit human review and
            editorial approval. Candidate promotion always creates a draft claimable.
          </p>
        </Card>
      </div>

      {/* Source defaults */}
      <h2 className="mt-8 text-lg font-semibold text-text-primary">Source Defaults</h2>
      <Card className="mt-3">
        <p className="text-sm text-text-secondary">
          Schema defaults applied to new sources (per migration 001); individual values are editable
          per source on the Sources pages.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-muted">Fetch frequency</dt>
          <dd className="text-text-primary">Every 24 hours</dd>
          <dt className="text-text-muted">Rate limit</dt>
          <dd className="text-text-primary">10 requests/minute</dd>
          <dt className="text-text-muted">Trust level</dt>
          <dd className="text-text-primary">official</dd>
          <dt className="text-text-muted">Enabled on creation</dt>
          <dd className="text-text-primary">true</dd>
        </dl>
      </Card>

      {/* Operational notes */}
      <h2 className="mt-8 text-lg font-semibold text-text-primary">Operational Notes</h2>
      <Card className="mt-3">
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>
            <strong className="text-text-primary">Crawls</strong> run from the CLI only:{' '}
            <code>pnpm crawler:daily</code>. Web-triggered crawling with a run-lock is future work —
            the admin panel deliberately never executes long crawl jobs in a request path.
          </li>
          <li>
            <strong className="text-text-primary">AI retries</strong>:{' '}
            <code>pnpm --filter @claimradar/crawler dev -- retry-queued</code>
          </li>
          <li>
            <strong className="text-text-primary">Audit trail</strong>: every privileged action
            (candidate decisions, publication approvals, edits, role changes, source toggles) is
            recorded in <code>audit_logs</code> and viewable on the Audit Log page.
          </li>
          <li>
            <strong className="text-text-primary">Service-role key</strong> stays server-only (
            <code>lib/admin-db.ts</code>) and is never exposed to client bundles.
          </li>
        </ul>
      </Card>
    </div>
  );
}
