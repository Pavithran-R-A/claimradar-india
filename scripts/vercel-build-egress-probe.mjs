import dns from 'node:dns/promises';
import https from 'node:https';
import net from 'node:net';

const TIMEOUT_MS = 5000;
const TARGETS = [
  { id: 'trai-www-rss', url: 'https://www.trai.gov.in/rss.xml' },
  { id: 'trai-apex-rss', url: 'https://trai.gov.in/rss.xml' },
  { id: 'sebi-www-rss', url: 'https://www.sebi.gov.in/sebirss.xml' },
  { id: 'sebi-apex-rss', url: 'https://sebi.gov.in/sebirss.xml' },
  {
    id: 'sebi-www-notices',
    url: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
  },
  {
    id: 'sebi-apex-notices',
    url: 'https://sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
  },
];

const errorText = (error) =>
  error instanceof Error ? error.message.slice(0, 120) : 'UNKNOWN_ERROR';

function timed(work) {
  const started = performance.now();
  return Promise.race([
    work().then((value) => ({
      ok: true,
      value,
      durationMs: Math.round(performance.now() - started),
      error: null,
    })),
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: false,
            durationMs: Math.round(performance.now() - started),
            error: 'ETIMEDOUT',
          }),
        TIMEOUT_MS,
      ),
    ),
  ]).catch((error) => ({
    ok: false,
    durationMs: Math.round(performance.now() - started),
    error: errorText(error),
  }));
}

function request(url, method) {
  return timed(
    () =>
      new Promise((resolve, reject) => {
        const started = performance.now();
        let connectAt = null;
        let tlsAt = null;
        const req = https.request(
          url,
          { method, headers: { 'user-agent': 'ClaimRadar-vercel-egress-diagnostic/1.0' } },
          (res) => {
            res.resume();
            res.once('end', () =>
              resolve({
                status: res.statusCode ?? 0,
                location: res.headers.location ?? null,
                connectDurationMs: connectAt === null ? null : Math.round(connectAt - started),
                tlsDurationMs: tlsAt === null ? null : Math.round(tlsAt - started),
              }),
            );
          },
        );
        req.once('socket', (socket) => {
          socket.once('connect', () => {
            connectAt = performance.now();
          });
          socket.once('secureConnect', () => {
            tlsAt = performance.now();
          });
        });
        req.once('timeout', () => req.destroy(new Error('ETIMEDOUT')));
        req.once('error', reject);
        req.setTimeout(TIMEOUT_MS);
        req.end();
      }),
  );
}

async function probe(target) {
  const hostname = new URL(target.url).hostname;
  const dnsResult = await timed(() => dns.lookup(hostname, { all: true, verbatim: true }));
  const addresses = dnsResult.value?.map((entry) => entry.address) ?? [];
  const [head, get] = await Promise.all([request(target.url, 'HEAD'), request(target.url, 'GET')]);
  return {
    id: target.id,
    url: target.url,
    hostname,
    dns: {
      success: dnsResult.ok,
      addresses,
      ipv4: addresses.filter((address) => net.isIPv4(address)),
      ipv6: addresses.filter((address) => net.isIPv6(address)),
      durationMs: dnsResult.durationMs,
      error: dnsResult.error,
    },
    head: head.value ?? { durationMs: head.durationMs, error: head.error },
    get: get.value ?? { durationMs: get.durationMs, error: get.error },
  };
}

for (let round = 1; round <= 3; round += 1) {
  const targets = await Promise.all(TARGETS.map(probe));
  for (const target of targets) {
    console.log(
      JSON.stringify({
        diagnostic: 'vercel-build-fixed-official-target',
        platform: 'vercel-build-environment',
        node: process.version,
        round,
        id: target.id,
        url: target.url,
        dns: target.dns,
        head: target.head,
        get: target.get,
      }),
    );
  }
}
