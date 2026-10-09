import { describe, expect, it } from 'vitest';
import { buildAuthCallbackUrl } from '@/lib/auth-redirect';

describe('ClaimKhoj auth callback URLs', () => {
  it('sends verification to the hosted first-party onboarding route', () => {
    expect(
      buildAuthCallbackUrl('/onboarding', 'https://claimradar-staging.vercel.app'),
    ).toBe('https://claimradar-staging.vercel.app/auth/callback?next=%2Fonboarding');
  });

  it('routes password recovery to the reset page', () => {
    expect(
      buildAuthCallbackUrl('/reset-password', 'https://claimradar-staging.vercel.app'),
    ).toContain('next=%2Freset-password');
  });
});
