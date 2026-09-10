import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { handleRequest } from '../../../../infra/cloudflare/trai-relay/src/index.js';

const secret = 's'.repeat(32);

function signedRequest(target: string, method = 'GET') {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = 'test-nonce-123456';
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}\n${nonce}\n${method}\n${target}`)
    .digest('hex');
  return new Request(`https://relay.example.test/fetch?target=${encodeURIComponent(target)}`, {
    method,
    headers: {
      'x-claimradar-timestamp': timestamp,
      'x-claimradar-nonce': nonce,
      'x-claimradar-signature': signature,
    },
  });
}

describe('Cloudflare TRAI relay security boundary', () => {
  it('rejects arbitrary targets before upstream fetch', async () => {
    let calls = 0;
    const response = await handleRequest(
      signedRequest('https://evil.example/steal'),
      { RELAY_SHARED_SECRET: secret },
      async () => {
        calls += 1;
        return new Response('unexpected');
      },
    );

    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it('rejects invalid signatures', async () => {
    const request = signedRequest('/rss.xml');
    const headers = new Headers(request.headers);
    headers.set('x-claimradar-signature', 'bad');
    const tampered = new Request(request, { headers });
    const response = await handleRequest(tampered, { RELAY_SHARED_SECRET: secret });
    expect(response.status).toBe(401);
  });

  it.each([
    [
      'missing signature',
      (request: Request) => {
        const headers = new Headers(request.headers);
        headers.delete('x-claimradar-signature');
        return new Request(request, { headers });
      },
    ],
    ['localhost target', () => signedRequest('http://localhost/admin')],
    ['loopback target', () => signedRequest('http://127.0.0.1/admin')],
    ['private IPv4 target', () => signedRequest('http://192.168.1.1/admin')],
    ['private IPv6 target', () => signedRequest('http://[fd00::1]/admin')],
    ['metadata target', () => signedRequest('http://169.254.169.254/latest/meta-data')],
    ['non-HTTPS target', () => signedRequest('http://www.trai.gov.in/rss.xml')],
  ])('rejects %s without upstream access', async (_label, makeRequest) => {
    let calls = 0;
    const response = await handleRequest(
      makeRequest(signedRequest('/rss.xml')),
      { RELAY_SHARED_SECRET: secret },
      async () => {
        calls += 1;
        return new Response('unexpected');
      },
    );

    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('rejects %s requests', async (method) => {
    const response = await handleRequest(signedRequest('/rss.xml', method), {
      RELAY_SHARED_SECRET: secret,
    });
    expect(response.status).toBe(405);
  });

  it('preserves official upstream HTTP errors', async () => {
    let upstreamUrl = '';
    const response = await handleRequest(
      signedRequest('/rss.xml'),
      { RELAY_SHARED_SECRET: secret },
      async (url) => {
        upstreamUrl = String(url);
        return new Response('denied', { status: 403, headers: { 'content-type': 'text/plain' } });
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get('x-claimradar-transport')).toBe('CLOUDFLARE_RELAY');
    expect(upstreamUrl).toBe('https://www.trai.gov.in/rss.xml');
  });

  it('streams successful official bytes with provenance', async () => {
    const response = await handleRequest(
      signedRequest('/rss.xml'),
      { RELAY_SHARED_SECRET: secret },
      async () =>
        new Response('<rss>official</rss>', {
          status: 200,
          headers: { 'content-type': 'application/rss+xml' },
        }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('x-claimradar-transport')).toBe('CLOUDFLARE_RELAY');
    expect(await response.text()).toBe('<rss>official</rss>');
  });

  it('blocks redirects outside the official hostname', async () => {
    const response = await handleRequest(
      signedRequest('/rss.xml'),
      { RELAY_SHARED_SECRET: secret },
      async () =>
        new Response(null, { status: 302, headers: { location: 'https://evil.example/' } }),
    );

    expect(response.status).toBe(502);
  });
});
