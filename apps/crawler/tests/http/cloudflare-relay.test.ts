import { describe, expect, it } from 'vitest';
import { HttpClient } from '../../src/http/client.js';
import { FetchError } from '../../src/http/types.js';
import { crawlerEnvSchema } from '../../src/env.js';
import { getTraiRelayTarget } from '../../src/http/cloudflare-relay.js';

function response(
  statusCode: number,
  body: string,
  headers: Record<string, string> = { 'content-type': 'application/rss+xml' },
) {
  return {
    statusCode,
    headers,
    body: {
      async dump() {},
      async arrayBuffer() {
        return Buffer.from(body);
      },
    },
  };
}

describe('Cloudflare TRAI relay fallback', () => {
  it('allows only HTTPS official TRAI targets', () => {
    expect(getTraiRelayTarget('https://www.trai.gov.in/rss.xml')).toBe('/rss.xml');
    expect(getTraiRelayTarget('http://www.trai.gov.in/rss.xml')).toBeNull();
    expect(getTraiRelayTarget('https://www.trai.gov.in/private')).toBeNull();
  });

  it('treats empty workflow secrets as disabled relay configuration', () => {
    expect(
      crawlerEnvSchema.parse({
        APP_ENV: 'staging',
        SUPABASE_URL: 'https://example.supabase.co',
        TRAI_RELAY_URL: '',
        TRAI_RELAY_SHARED_SECRET: '',
      }).TRAI_RELAY_URL,
    ).toBeUndefined();
  });

  it('uses the signed relay after a bounded direct timeout', async () => {
    const calls: string[] = [];
    const relayHeaders: Record<string, string> = {};
    const client = new HttpClient({
      userAgent: 'ClaimRadar test',
      defaultTimeoutMs: 100,
      maxRetries: 0,
      relay: {
        endpoint: 'https://relay.example.test/fetch',
        sharedSecret: 'a'.repeat(32),
      },
      requestExecutor: async (url, options) => {
        calls.push(url);
        if (calls.length === 2) {
          Object.assign(relayHeaders, options.headers as Record<string, string>);
        }
        if (calls.length === 1) throw new Error('connect timed out');
        return response(200, '<rss><channel /></rss>');
      },
    });

    const result = await client.fetch({
      url: 'https://www.trai.gov.in/rss.xml',
      method: 'GET',
    });

    expect(result.transport).toBe('CLOUDFLARE_RELAY');
    expect(result.url).toBe('https://www.trai.gov.in/rss.xml');
    expect(result.statusCode).toBe(200);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toContain('target=%2Frss.xml');
    expect(new URL(calls[1]).searchParams.has('signature')).toBe(false);
    expect(relayHeaders['X-ClaimRadar-Signature']).toMatch(/^[a-f0-9]{64}$/);
  });

  it('does not relay an intentional HTTP denial', async () => {
    const calls: string[] = [];
    const client = new HttpClient({
      userAgent: 'ClaimRadar test',
      defaultTimeoutMs: 100,
      relay: {
        endpoint: 'https://relay.example.test/fetch',
        sharedSecret: 'a'.repeat(32),
      },
      requestExecutor: async (url) => {
        calls.push(url);
        return response(403, 'denied', { 'content-type': 'text/plain' });
      },
    });

    await expect(
      client.fetch({ url: 'https://www.trai.gov.in/rss.xml', method: 'GET' }),
    ).rejects.toMatchObject({ category: 'http_error', statusCode: 403 });
    expect(calls).toHaveLength(1);
  });

  it('preserves a timeout when both direct and relay budgets exhaust', async () => {
    const calls: string[] = [];
    const client = new HttpClient({
      userAgent: 'ClaimRadar test',
      defaultTimeoutMs: 100,
      maxRetries: 1,
      retryBaseDelayMs: 1,
      retryMaxDelayMs: 1,
      relay: {
        endpoint: 'https://relay.example.test/fetch',
        sharedSecret: 'a'.repeat(32),
      },
      requestExecutor: async (url) => {
        calls.push(url);
        throw new Error('ETIMEDOUT');
      },
    });

    await expect(
      client.fetch({ url: 'https://www.trai.gov.in/rss.xml', method: 'GET' }),
    ).rejects.toMatchObject({ category: 'timeout' });
    expect(calls).toHaveLength(4);
  });

  it('does not classify relay policy failures as HTTP failures', async () => {
    let calls = 0;
    const client = new HttpClient({
      userAgent: 'ClaimRadar test',
      defaultTimeoutMs: 100,
      maxRetries: 0,
      relay: {
        endpoint: 'https://relay.example.test/fetch',
        sharedSecret: 'a'.repeat(32),
      },
      requestExecutor: async () => {
        calls += 1;
        if (calls === 1) throw new Error('connect timed out');
        return response(502, 'blocked', {
          'content-type': 'application/json',
          'x-claimradar-relay-error': 'POLICY_BLOCKED',
        });
      },
    });

    await expect(
      client.fetch({ url: 'https://www.trai.gov.in/rss.xml', method: 'GET' }),
    ).rejects.toMatchObject({ category: 'network_error', statusCode: undefined });
    expect(calls).toBe(2);
  });

  it('keeps SSRF protection before any relay attempt', async () => {
    let calls = 0;
    const client = new HttpClient({
      userAgent: 'ClaimRadar test',
      defaultTimeoutMs: 100,
      relay: {
        endpoint: 'https://relay.example.test/fetch',
        sharedSecret: 'a'.repeat(32),
      },
      requestExecutor: async () => {
        calls += 1;
        return response(200, 'unexpected');
      },
    });

    await expect(
      client.fetch({ url: 'https://127.0.0.1/admin', method: 'GET' }),
    ).rejects.toBeInstanceOf(FetchError);
    expect(calls).toBe(0);
  });
});
