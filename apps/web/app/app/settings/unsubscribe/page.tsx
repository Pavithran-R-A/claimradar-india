import Link from 'next/link';
import { Card } from '@claimradar/design-system';
import { BellOff } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { verifyUnsubscribeToken } from '@/lib/notifications/safety';
import { UnsubscribeForm } from './unsubscribe-form';

export const dynamic = 'force-dynamic';

interface UnsubscribePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const user = await requireAppAuth();
  const params = await searchParams;

  const uid = typeof params.uid === 'string' ? params.uid : '';
  const token = typeof params.token === 'string' ? params.token : '';
  const secret = process.env.UNSUBSCRIBE_SECRET;

  const tokenValid = Boolean(secret) && verifyUnsubscribeToken(uid, token, secret ?? '');
  const isOwnLink = tokenValid && uid === user.id;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-text-primary">
          <BellOff className="h-6 w-6 text-trust-primary" aria-hidden />
          Unsubscribe from email
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Stop email notifications while keeping your in-app inbox active. You can re-enable email
          at any time in{' '}
          <Link href="/app/settings" className="text-trust-primary hover:underline">
            Settings
          </Link>
          .
        </p>
      </div>

      <Card>
        {isOwnLink ? (
          <UnsubscribeForm uid={uid} token={token} />
        ) : (
          <p role="alert" className="text-sm text-text-secondary">
            {tokenValid
              ? 'This link belongs to a different account. Sign in with the account that received the email, or manage email preferences in Settings.'
              : 'This unsubscribe link is invalid or has expired. You can turn off email at any time in Settings.'}
          </p>
        )}
      </Card>
    </div>
  );
}
