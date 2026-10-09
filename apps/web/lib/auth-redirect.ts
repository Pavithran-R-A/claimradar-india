import { brandConfig } from '@claimradar/config';

/** Return a first-party callback URL; hosted builds never fall back to localhost. */
export function buildAuthCallbackUrl(
  next: '/onboarding' | '/reset-password',
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? brandConfig.url,
): string {
  const url = new URL('/auth/callback', siteUrl);
  url.searchParams.set('next', next);
  return url.toString();
}
