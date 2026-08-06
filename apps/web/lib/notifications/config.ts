/**
 * Notification runtime configuration.
 *
 * Reads process.env directly (no t3-env dependency) so the engine and its
 * unit tests stay environment-agnostic. EMAIL_PROVIDER selects the email
 * provider; 'console' is the safe default. Real email (Resend) is only ever
 * activated in APP_ENV=production with RESEND_API_KEY set.
 */

export type EmailProviderKind = 'console' | 'resend';

export interface NotificationConfig {
  /** APP_ENV — real email only leaves in 'production'. Default: development. */
  appEnv: string;
  emailProvider: EmailProviderKind;
  resendApiKey: string | null;
  emailFrom: string;
  siteUrl: string | null;
  unsubscribeSecret: string | null;
}

export const DEFAULT_EMAIL_FROM = 'notifications@claimradar.in';

/** Unknown EMAIL_PROVIDER values fall back to the safe console provider. */
function parseEmailProviderKind(raw: string | undefined): EmailProviderKind {
  if (raw === 'resend') return 'resend';
  return 'console';
}

export function notificationConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): NotificationConfig {
  return {
    appEnv: env.APP_ENV ?? 'development',
    emailProvider: parseEmailProviderKind(env.EMAIL_PROVIDER),
    resendApiKey: env.RESEND_API_KEY ?? null,
    emailFrom: env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM,
    siteUrl: env.NEXT_PUBLIC_SITE_URL ?? null,
    unsubscribeSecret: env.UNSUBSCRIBE_SECRET ?? null,
  };
}
