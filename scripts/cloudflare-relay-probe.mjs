import { createHmac, randomBytes } from 'node:crypto';

const endpoint = process.env.TRAI_RELAY_URL;
const secret = process.env.TRAI_RELAY_SHARED_SECRET;
const target = '/rss.xml';
const attempts = 5;

if (!endpoint || !secret || secret.length < 32) {
  console.error('Relay probe requires configured staging credentials.');
  process.exit(1);
}

function signedUrl() {
  const url = new URL(endpoint);
  url.searchParams.set('target', target);
  return url;
}

function signature(timestamp, nonce) {
  return createHmac('sha256', secret)
    .update(`${timestamp}\n${nonce}\nGET\n${target}`)
    .digest('hex');
}

const results = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(18).toString('hex');
  const started = performance.now();
  try {
    const response = await fetch(signedUrl(), {
      headers: {
        'X-ClaimRadar-Timestamp': timestamp,
        'X-ClaimRadar-Nonce': nonce,
        'X-ClaimRadar-Signature': signature(timestamp, nonce),
      },
      signal: AbortSignal.timeout(20_000),
    });
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? '';
    const officialBytes =
      body.length > 0 && /<rss[\s>]/i.test(body.toString('utf8', 0, Math.min(body.length, 4096)));
    results.push({
      attempt,
      status: response.status,
      transport: response.headers.get('x-claimradar-transport'),
      contentType,
      bytes: body.length,
      readable: true,
      officialBytes,
      durationMs: Math.round(performance.now() - started),
      pass: response.status === 200 && officialBytes,
    });
  } catch {
    results.push({
      attempt,
      status: null,
      transport: null,
      contentType: null,
      bytes: 0,
      readable: false,
      officialBytes: false,
      durationMs: Math.round(performance.now() - started),
      pass: false,
    });
  }
}

console.log(
  JSON.stringify({
    diagnostic: 'cloudflare-trai-relay',
    attempts,
    passed: results.filter((result) => result.pass).length,
    results,
  }),
);

if (results.some((result) => !result.pass)) process.exit(1);
