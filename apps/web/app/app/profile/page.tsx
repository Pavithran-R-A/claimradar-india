import Link from 'next/link';
import { Alert, Badge, Card } from '@claimradar/design-system';
import { ShieldCheck, UserRound } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { getOnboarding, getProfile } from '@/lib/user-data';
import { ActionForm } from '@/components/app/action-form';
import { updateProfile } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireAppAuth();

  const [profile, onboarding] = await Promise.all([getProfile(user.id), getOnboarding(user.id)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your account details and the matching profile you shared with us.
        </p>
      </div>

      {profile.unavailable && (
        <Alert variant="warning" title="Profile temporarily unavailable">
          We could not reach the database. Try again shortly.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        {/* Account */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
            <UserRound className="h-4 w-4 text-trust-primary" aria-hidden />
            Account
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Email</dt>
              <dd className="min-w-0 break-all text-right font-medium text-text-primary">
                {user.email ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Display name</dt>
              <dd className="min-w-0 break-words text-right font-medium text-text-primary">
                {profile.display_name ?? 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Email verified</dt>
              <dd>
                <Badge variant={user.email_confirmed_at ? 'success' : 'deadline'}>
                  {user.email_confirmed_at ? 'Verified' : 'Not verified'}
                </Badge>
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-5">
            <ActionForm action={updateProfile} submitLabel="Save profile">
              <div>
                <label
                  htmlFor="display-name"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Display name
                </label>
                <input
                  id="display-name"
                  name="displayName"
                  defaultValue={profile.display_name ?? ''}
                  maxLength={80}
                  placeholder="How you want to be addressed"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Never shown publicly. Your email stays private.
                </p>
              </div>
            </ActionForm>
          </div>
        </Card>

        {/* Matching profile summary */}
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-primary">
            <ShieldCheck className="h-4 w-4 text-trust-primary" aria-hidden />
            Matching profile
          </h2>
          {!onboarding ? (
            <p className="text-sm text-text-muted">Onboarding answers unavailable right now.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-muted">Companies you use</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {onboarding.companies_used.length > 0
                    ? onboarding.companies_used.join(', ')
                    : 'None provided'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Sectors</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {onboarding.sectors_used.length > 0
                    ? onboarding.sectors_used.join(', ')
                    : 'None provided'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Purchase period</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {onboarding.purchase_period_start || onboarding.purchase_period_end
                    ? `${onboarding.purchase_period_start ?? 'any'} – ${onboarding.purchase_period_end ?? 'now'}`
                    : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">State</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {onboarding.state ?? 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Receipts / references</dt>
                <dd className="mt-1 font-medium text-text-primary">
                  {onboarding.receipt_availability} / {onboarding.reference_availability}
                </dd>
              </div>
            </dl>
          )}
          <p className="mt-5 border-t border-border pt-4 text-xs text-text-muted">
            These answers were captured during account setup and drive your deterministic matches.
            To correct them, use the correction request in the{' '}
            <Link href="/app/privacy" className="text-trust-primary underline hover:no-underline">
              Privacy center
            </Link>
            , or withdraw consent there to stop matching entirely.
          </p>
        </Card>
      </div>
    </div>
  );
}
