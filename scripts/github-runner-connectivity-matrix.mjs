import { promises as dns } from 'node:dns';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import net from 'node:net';
import tls from 'node:tls';
import https from 'node:https';

const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'ClaimRadar India/1.0 connectivity-matrix';
const ENDPOINTS = [
  { id: 'trai-rss-www', family: 'trai', url: 'https://www.trai.gov.in/rss.xml' },
  { id: 'trai-rss-apex', family: 'trai', url: 'https://trai.gov.in/rss.xml' },
  { id: 'sebi-rss-www', family: 'sebi', url: 'https://www.sebi.gov.in/sebirss.xml' },
  { id: 'sebi-rss-apex', family: 'sebi', url: 'https://sebi.gov.in/sebirss.xml' },
  {
    id: 'sebi-public-notices-www',
    family: 'sebi',
    url: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
  },
  {
    id: 'sebi-public-notices-apex',
    family: 'sebi',
    url: 'https://sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=25',
  },
];

function durationSince(started) {
  return Date.now() - started;
}

function errorDetails(error) {
  if (!error || typeof error !== 'object') return { message: String(error) };
  return {
    code: typeof error.code === 'string' ? error.code : undefined,
    name: typeof error.name === 'string' ? error.name : undefined,
    message: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
  };
}

function sanitizedUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`.slice(0, 400);
  } catch {
    return String(value).split('#', 1)[0].slice(0, 400);
  }
}

function familyForHost(hostname) {
  if (hostname === 'trai.gov.in' || hostname === 'www.trai.gov.in') return 'trai';
  if (hostname === 'sebi.gov.in' || hostname === 'www.sebi.gov.in') return 'sebi';
  return undefined;
}

async function resolveHost(hostname) {
  const started = Date.now();
  const [lookup, ipv4, ipv6] = await Promise.all([
    dns
      .lookup(hostname, { all: true, verbatim: true })
      .catch((error) => ({ error: errorDetails(error) })),
    dns.resolve4(hostname).catch((error) => ({ error: errorDetails(error) })),
    dns.resolve6(hostname).catch((error) => ({ error: errorDetails(error) })),
  ]);
  const addresses = Array.isArray(lookup)
    ? lookup.map(({ address, family }) => ({ address, family }))
    : [];
  return {
    durationMs: durationSince(started),
    lookup: Array.isArray(lookup) ? { addresses } : lookup,
    resolve4: Array.isArray(ipv4) ? { addresses: ipv4 } : ipv4,
    resolve6: Array.isArray(ipv6) ? { addresses: ipv6 } : ipv6,
    addresses,
  };
}

function probeTcp(address, family) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = net.createConnection({ host: address, port: 443, family });
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ address, family, durationMs: durationSince(started), ...result });
    };
    socket.setTimeout(TIMEOUT_MS, () => finish({ ok: false, error: { code: 'ETIMEDOUT' } }));
    socket.once('connect', () => finish({ ok: true }));
    socket.once('error', (error) => finish({ ok: false, error: errorDetails(error) }));
  });
}

function probeTls(hostname, address, family) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = tls.connect({
      host: address,
      port: 443,
      family,
      servername: hostname,
      rejectUnauthorized: true,
    });
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ address, family, durationMs: durationSince(started), ...result });
    };
    socket.setTimeout(TIMEOUT_MS, () => finish({ ok: false, error: { code: 'ETIMEDOUT' } }));
    socket.once('secureConnect', () =>
      finish({
        ok: socket.authorized,
        authorized: socket.authorized,
        authorizationError: socket.authorizationError ?? undefined,
        protocol: socket.getProtocol() ?? undefined,
      }),
    );
    socket.once('error', (error) => finish({ ok: false, error: errorDetails(error) }));
  });
}

function requestOnce(urlString, method) {
  return new Promise((resolve) => {
    const url = new URL(urlString);
    const started = Date.now();
    let connectDurationMs;
    let tlsHandshakeDurationMs;
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve({
        method,
        durationMs: durationSince(started),
        connectDurationMs,
        tlsHandshakeDurationMs,
        ...result,
      });
    };
    const request = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
        rejectUnauthorized: true,
        agent: false,
      },
      (response) => {
        let bytesRead = 0;
        response.on('data', (chunk) => {
          bytesRead += chunk.length;
          if (bytesRead >= 8192) response.destroy();
        });
        response.on('end', () =>
          finish({
            ok: true,
            statusCode: response.statusCode,
            location: response.headers.location
              ? sanitizedUrl(response.headers.location)
              : undefined,
            bytesRead: Math.min(bytesRead, 8192),
          }),
        );
        response.on('close', () =>
          finish({
            ok: true,
            statusCode: response.statusCode,
            location: response.headers.location
              ? sanitizedUrl(response.headers.location)
              : undefined,
            bytesRead: Math.min(bytesRead, 8192),
          }),
        );
      },
    );
    request.setTimeout(TIMEOUT_MS, () =>
      request.destroy(Object.assign(new Error('HTTP request timeout'), { code: 'ETIMEDOUT' })),
    );
    request.on('socket', (socket) => {
      socket.once('connect', () => {
        connectDurationMs = durationSince(started);
      });
      socket.once('secureConnect', () => {
        tlsHandshakeDurationMs = durationSince(started);
      });
    });
    request.once('error', (error) => finish({ ok: false, error: errorDetails(error) }));
    request.end();
  });
}

async function traceRedirects(endpoint, method) {
  const hops = [];
  let current = endpoint.url;
  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    const result = await requestOnce(current, method);
    hops.push({ url: sanitizedUrl(current), ...result });
    if (!result.ok || result.statusCode < 300 || result.statusCode >= 400 || !result.location) {
      return { hops, finalUrl: sanitizedUrl(current), finalHostname: new URL(current).hostname };
    }
    let next;
    try {
      next = new URL(result.location, current);
    } catch {
      return { hops, redirectError: 'invalid_location' };
    }
    if (
      next.protocol !== 'https:' ||
      familyForHost(next.hostname) !== familyForHost(new URL(current).hostname)
    ) {
      return { hops, redirectError: 'external_or_non_https_redirect' };
    }
    current = next.href;
  }
  return { hops, redirectError: 'redirect_limit_exceeded' };
}

function finalResponsePassed(trace) {
  const finalHop = trace.hops.at(-1);
  return Boolean(finalHop?.ok && finalHop.statusCode >= 200 && finalHop.statusCode < 300);
}

async function probeEndpoint(endpoint) {
  const url = new URL(endpoint.url);
  const dnsResult = await resolveHost(url.hostname);
  const tcp = await Promise.all(
    dnsResult.addresses.map(({ address, family }) => probeTcp(address, family)),
  );
  const tlsResults = await Promise.all(
    dnsResult.addresses.map(({ address, family }) => probeTls(url.hostname, address, family)),
  );
  const head = await traceRedirects(endpoint, 'HEAD');
  const get = await traceRedirects(endpoint, 'GET');
  return {
    id: endpoint.id,
    family: endpoint.family,
    sourceUrl: sanitizedUrl(endpoint.url),
    hostname: url.hostname,
    dns: dnsResult,
    tcp,
    tls: tlsResults,
    head,
    get,
    connectivityPassed:
      tcp.some((result) => result.ok) &&
      tlsResults.some((result) => result.ok) &&
      finalResponsePassed(get),
  };
}

const results = [];
for (const endpoint of ENDPOINTS) results.push(await probeEndpoint(endpoint));

const report = {
  generatedAt: new Date().toISOString(),
  workflowRunId: process.env.GITHUB_RUN_ID ?? undefined,
  runner: {
    os: process.env.RUNNER_OS ?? os.platform(),
    architecture: process.env.RUNNER_ARCH ?? os.arch(),
    node: process.version,
  },
  endpoints: results,
  acceptance: {
    trai: results
      .filter((result) => result.family === 'trai')
      .every((result) => result.connectivityPassed),
    sebiRss: results
      .filter((result) => result.id.startsWith('sebi-rss'))
      .every((result) => result.connectivityPassed),
    sebiPublicNotices: results
      .filter((result) => result.id.startsWith('sebi-public-notices'))
      .every((result) => result.connectivityPassed),
  },
};

const outputPath = process.env.PROBE_OUTPUT ?? 'runner-connectivity.json';
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
