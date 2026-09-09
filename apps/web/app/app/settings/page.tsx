import Link from 'next/link';
import { Alert, Card } from '@claimradar/design-system';
import { BellRing } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { getNotificationPreferences } from '@/lib/user-data';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireAppAuth();
  const preferences = await getNotificationPreferences(user.id);

  const defaults = {
    emailEnabled: preferences?.email_enabled ?? true,
    browserEnabled: preferences?.browser_enabled ?? true,
    whatsappEnabled: preferences?.whatsapp_enabled ?? false,
    digestFrequency: preferences?.digest_frequency ?? 'weekly',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text-primary">
          <BellRing className="h-6 w-6 text-trust-primary" aria-hidden />
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose how and when we contact you. Changes apply immediately and can be reversed at any
          time.
        </p>
      </div>

      {preferences?.unavailable && (
        <Alert variant="warning" title="Preferences temporarily unavailable">
          Showing defaults because we could not reach the database. Saving will try to persist your
          choices.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Notification preferences
          </h2>
          <SettingsForm {...defaults} />
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-2 text-base font-semibold text-text-primary">Privacy first</h2>
            <p className="text-sm text-text-muted">
              Contact details are used only for the channels you enable. Review everything we hold
              about you in the{' '}
              <Link href="/app/privacy" className="text-trust-primary underline hover:no-underline">
                privacy center
              </Link>
              .
            </p>
          </Card>
          <Card>
            <h2 className="mb-2 text-base font-semibold text-text-primary">Matching answers</h2>
            <p className="text-sm text-text-muted">
              Your companies, sectors and purchase period power match accuracy. Update them in{' '}
              <Link href="/onboarding" className="text-trust-primary underline hover:no-underline">
                setup
              </Link>{' '}
              whenever your situation changes.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
