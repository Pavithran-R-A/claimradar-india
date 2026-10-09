import { afterEach, describe, expect, it, vi } from 'vitest';
import { notificationConfigFromEnv } from '@/lib/notifications/config';
import { isRealAlertDeliveryConfigured } from '@/lib/notifications/dispatch-matches';
import { ResendEmailProvider, selectEmailProvider } from '@/lib/notifications/providers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ClaimKhoj real-email production gates', () => {
  const baseEnv = {
    NODE_ENV: 'test' as const,
    APP_ENV: 'production',
    NOTIFY_CUSTOMERS_ENABLED: 'true',
    EMAIL_PROVIDER: 'resend',
    RESEND_API_KEY: 're_test_not_real',
    UNSUBSCRIBE_SECRET: 'test-secret',
    NEXT_PUBLIC_SITE_URL: 'https://claimkhoj.app',
  };

  it('fails closed for staging, disabled delivery, missing key and missing opt-out signing', () => {
    expect(isRealAlertDeliveryConfigured({ ...baseEnv, APP_ENV: 'staging' })).toBe(false);
    expect(isRealAlertDeliveryConfigured({ ...baseEnv, NOTIFY_CUSTOMERS_ENABLED: 'false' })).toBe(
      false,
    );
    expect(isRealAlertDeliveryConfigured({ ...baseEnv, RESEND_API_KEY: '' })).toBe(false);
    expect(isRealAlertDeliveryConfigured({ ...baseEnv, UNSUBSCRIBE_SECRET: '' })).toBe(false);
    expect(
      isRealAlertDeliveryConfigured({
        ...baseEnv,
        NEXT_PUBLIC_SITE_URL: 'https://claimradar-staging.vercel.app',
      }),
    ).toBe(false);
    expect(isRealAlertDeliveryConfigured(baseEnv)).toBe(true);
  });

  it('never chooses external Resend while the customer notification switch is off', () => {
    const config = notificationConfigFromEnv({
      ...baseEnv,
      NOTIFY_CUSTOMERS_ENABLED: 'false',
    });
    expect(config.emailFrom).toContain('claimkhoj.app');
    expect(selectEmailProvider(config).sendsExternally).toBe(false);
  });

  it('uses the published ClaimKhoj Resend template with a stable idempotency key', async () => {
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    });
    vi.stubGlobal('fetch', mockedFetch);
    const provider = new ResendEmailProvider({
      apiKey: 're_test_not_real',
      from: 'ClaimKhoj <alerts@claimkhoj.app>',
      siteUrl: 'https://claimkhoj.app',
    });
    const result = await provider.send({
      userId: 'customer-1',
      toEmail: 'example@example.com',
      type: 'new_match',
      subject: 'Potential match: Verified claim',
      body: 'Review official evidence.',
      link: '/claimables/verified-claim',
      unsubscribeUrl: 'https://claimkhoj.app/app/settings',
      dedupKey: 'match:customer-1:verified-claim',
    });
    expect(result.ok).toBe(true);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    const [url, request] = mockedFetch.mock.calls[0] as [
      string,
      { headers: Record<string, string>; body: string },
    ];
    expect(url).toBe('https://api.resend.com/emails');
    expect(request.headers['Idempotency-Key']).toMatch(/^[0-9a-f]{64}$/);
    const body = JSON.parse(request.body);
    expect(body.template.id).toBe('claimkhoj_verified_opportunity');
    expect(body.template.variables.CLAIM_URL).toBe(
      'https://claimkhoj.app/claimables/verified-claim',
    );
    expect(body.template.variables.PREFERENCES_URL).toBe('https://claimkhoj.app/app/settings');
    expect(body).not.toHaveProperty('html');
  });

  it('does not place a cross-origin link in an official claim email template', async () => {
    const mockedFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-124' }),
    });
    vi.stubGlobal('fetch', mockedFetch);
    const provider = new ResendEmailProvider({
      apiKey: 're_test_not_real',
      from: 'ClaimKhoj <alerts@claimkhoj.app>',
      siteUrl: 'https://claimkhoj.app',
    });
    const result = await provider.send({
      userId: 'customer-1',
      toEmail: 'example@example.com',
      type: 'new_match',
      subject: 'Potential match',
      body: 'Review the verified source.',
      link: '/\\\\evil.example/steal',
    });
    expect(result.ok).toBe(true);
    const [, request] = mockedFetch.mock.calls[0] as [string, { body: string }];
    const payload = JSON.parse(request.body);
    expect(payload).not.toHaveProperty('template');
    expect(payload.text).toBe('Review the verified source.');
  });

  it('rejects a network failure without fabricating delivery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('test network failure')));
    const provider = new ResendEmailProvider({
      apiKey: 're_test_not_real',
      from: 'ClaimKhoj <alerts@claimkhoj.app>',
    });
    const result = await provider.send({
      userId: 'customer-1',
      toEmail: 'example@example.com',
      type: 'new_match',
      subject: 'Claim found',
      body: 'Review',
    });
    expect(result.ok).toBe(false);
  });
});
