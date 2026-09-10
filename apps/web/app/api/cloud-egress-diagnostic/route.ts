import dns from 'node:dns/promises';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

type Target = {
  id: string;
  url: string;
  family: 'trai' | 'sebi';
};

type TimedResult = {
  ok: boolean;
  durationMs: number | null;
  error: string | null;
};

const TIMEOUT_MS = 3_500;
const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 64 * 1024;

const TARGETS: Target[] = [
  { id: 'trai-www-rss', url: 'https://www.trai.gov.in/rss.xml', family: 'trai' },
  { id: 'trai-apex-rss', url: 'https://trai.gov.in/rss.xml', family: 'trai' },
  { id: 'sebi-www-rss', url: 'https://www.sebi.gov.in/sebirss.xml', family: 'sebi' },
  { id: 'sebi-apex-rss', url: 'https://sebi.gov.in/sebirss.xml', family: 'sebi' },
  {
    id: 'sebi-www-notices',
    url: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
    family: 'sebi',
  },
  {
    id: 'sebi-apex-notices',
    url: 'https://sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
    family: 'sebi',
  },
];

function now(): number {
  return Number(process.hrtime.bigint() / 1_000_000n);
}

function timeoutError(): Error {
  return new Error('ETIMEDOUT');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(timeoutError()), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 120) : 'UNKNOWN_ERROR';
}

async function timed<T>(work: () => Promise<T>): Promise<TimedResult & { value?: T }> {
  const started = now();
  try {
    const value = await withTimeout(work());
    return { ok: true, durationMs: now() - started, error: null, value };
  } catch (error) {
    return { ok: false, durationMs: now() - started, error: errorText(error) };
  }
}

async function resolveHost(hostname: string) {
  const result = await timed(() => dns.lookup(hostname, { all: true, verbatim: true }));
  const addresses = result.value?.map((entry) => entry.address) ?? [];
  return {
    success: result.ok,
    durationMs: result.durationMs,
    addresses,
    ipv4: addresses.filter((address) => net.isIPv4(address)),
    ipv6: addresses.filter((address) => net.isIPv6(address)),
    error: result.error,
  };
}

async function tcpProbe(address: string): Promise<TimedResult> {
  return timed(
    () =>
      new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({
          host: address,
          port: 443,
          family: net.isIPv6(address) ? 6 : 4,
        });
        socket.once('connect', () => {
          socket.destroy();
          resolve();
        });
        socket.once('error', reject);
        socket.once('timeout', () => reject(timeoutError()));
        socket.setTimeout(TIMEOUT_MS);
      }),
  );
}

async function tlsProbe(hostname: string, address: string): Promise<TimedResult> {
  return timed(
    () =>
      new Promise<void>((resolve, reject) => {
        const socket = tls.connect({
          host: address,
          port: 443,
          servername: hostname,
          rejectUnauthorized: true,
        });
        socket.once('secureConnect', () => {
          socket.destroy();
          resolve();
        });
        socket.once('error', reject);
        socket.once('timeout', () => reject(timeoutError()));
        socket.setTimeout(TIMEOUT_MS);
      }),
  );
}

function allowedHost(family: Target['family'], hostname: string): boolean {
  return family === 'trai'
    ? hostname === 'trai.gov.in' || hostname === 'www.trai.gov.in'
    : hostname === 'sebi.gov.in' || hostname === 'www.sebi.gov.in';
}

async function httpProbe(
  target: Target,
  inputUrl: string,
  method: 'HEAD' | 'GET',
  redirectCount = 0,
  redirectChain: string[] = [],
): Promise<{
  url: string;
  finalUrl: string | null;
  finalHostname: string | null;
  status: number | null;
  redirectChain: string[];
  connectDurationMs: number | null;
  tlsDurationMs: number | null;
  totalDurationMs: number;
  error: string | null;
}> {
  const started = now();
  if (redirectCount > MAX_REDIRECTS) {
    return {
      url: inputUrl,
      finalUrl: null,
      finalHostname: null,
      status: null,
      redirectChain,
      connectDurationMs: null,
      tlsDurationMs: null,
      totalDurationMs: now() - started,
      error: 'REDIRECT_LIMIT',
    };
  }

  const url = new URL(inputUrl);
  if (url.protocol !== 'https:' || !allowedHost(target.family, url.hostname)) {
    return {
      url: inputUrl,
      finalUrl: null,
      finalHostname: null,
      status: null,
      redirectChain,
      connectDurationMs: null,
      tlsDurationMs: null,
      totalDurationMs: now() - started,
      error: 'REDIRECT_OUTSIDE_ALLOWLIST',
    };
  }

  const response = await new Promise<{
    status: number;
    location: string | null;
    connectDurationMs: number | null;
    tlsDurationMs: number | null;
  }>((resolve, reject) => {
    let connectAt: number | null = null;
    let tlsAt: number | null = null;
    const request = https.request(
      url,
      { method, headers: { 'user-agent': 'ClaimRadar-cloud-egress-diagnostic/1.0' } },
      (res) => {
        let bodyBytes = 0;
        res.on('data', (chunk: Buffer) => {
          bodyBytes += chunk.byteLength;
          if (bodyBytes > MAX_BODY_BYTES) res.destroy();
        });
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            location: res.headers.location ?? null,
            connectDurationMs: connectAt === null ? null : connectAt - started,
            tlsDurationMs: tlsAt === null ? null : tlsAt - started,
          }),
        );
        res.on('error', reject);
      },
    );
    request.once('socket', (socket) => {
      socket.once('connect', () => {
        connectAt = now();
      });
      socket.once('secureConnect', () => {
        tlsAt = now();
      });
    });
    request.once('timeout', () => request.destroy(timeoutError()));
    request.once('error', reject);
    request.setTimeout(TIMEOUT_MS);
    request.end();
  }).catch((error: unknown) => {
    throw new Error(errorText(error));
  });

  if (response.status >= 300 && response.status < 400 && response.location) {
    const nextUrl = new URL(response.location, url).toString();
    return httpProbe(target, nextUrl, method, redirectCount + 1, [...redirectChain, inputUrl]);
  }

  return {
    url: inputUrl,
    finalUrl: url.toString(),
    finalHostname: url.hostname,
    status: response.status,
    redirectChain,
    connectDurationMs: response.connectDurationMs,
    tlsDurationMs: response.tlsDurationMs,
    totalDurationMs: now() - started,
    error: null,
  };
}

async function probeTarget(target: Target) {
  const parsed = new URL(target.url);
  const dnsResult = await resolveHost(parsed.hostname);
  const addresses = dnsResult.addresses;
  const [tcp, tlsResult, head, get] = await Promise.all([
    Promise.all(addresses.map((address) => tcpProbe(address))),
    Promise.all(addresses.map((address) => tlsProbe(parsed.hostname, address))),
    timed(() => httpProbe(target, target.url, 'HEAD')),
    timed(() => httpProbe(target, target.url, 'GET')),
  ]);

  return {
    id: target.id,
    family: target.family,
    requestedUrl: target.url,
    hostname: parsed.hostname,
    dns: dnsResult,
    tcp443: tcp,
    tls: tlsResult,
    head: head.value ?? { error: head.error, totalDurationMs: head.durationMs },
    get: get.value ?? { error: get.error, totalDurationMs: get.durationMs },
  };
}

export async function GET() {
  const startedAt = new Date().toISOString();
  const probes = await Promise.all(TARGETS.map(probeTarget));
  return Response.json(
    {
      diagnostic: 'cloud-egress-fixed-official-targets',
      startedAt,
      platform: 'vercel-node-serverless',
      node: process.version,
      targets: probes,
    },
    {
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    },
  );
}
