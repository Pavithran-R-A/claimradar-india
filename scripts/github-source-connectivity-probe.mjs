import { promises as dns } from 'node:dns';
import { writeFile } from 'node:fs/promises';
import net from 'node:net';
import tls from 'node:tls';
import https from 'node:https';

const PROBE_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'ClaimRadar India/1.0 connectivity-probe';
const HOSTS = [
  { host: 'www.trai.gov.in', paths: ['/', '/rss.xml'], family: 'trai' },
  { host: 'trai.gov.in', paths: ['/', '/rss.xml'], family: 'trai' },
  { host: 'www.sebi.gov.in', paths: ['/', '/sebirss.xml'], family: 'sebi' },
  { host: 'sebi.gov.in', paths: ['/', '/sebirss.xml'], family: 'sebi' },
];

function durationSince(start) {
  return Date.now() - start;
}

function errorDetails(error) {
  if (!error || typeof error !== 'object') return { message: String(error) };
  const candidate = error;
  return {
    code: typeof candidate.code === 'string' ? candidate.code : undefined,
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
    message: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
  };
}

function publicLocation(location) {
  if (!location) return undefined;
  try {
    const parsed = new URL(location);
    return `${parsed.origin}${parsed.pathname}`.slice(0, 300);
  } catch {
    return location.split(/[?#]/, 1)[0].slice(0, 300);
  }
}

function officialFamily(host) {
  if (host === 'trai.gov.in' || host === 'www.trai.gov.in') return 'trai';
  if (host === 'sebi.gov.in' || host === 'www.sebi.gov.in') return 'sebi';
  return undefined;
}

async function resolveHost(host) {
  const started = Date.now();
  const [lookupResult, ipv4Result, ipv6Result] = await Promise.all([
    dns
      .lookup(host, { all: true, verbatim: true })
      .catch((error) => ({ error: errorDetails(error) })),
    dns.resolve4(host).catch((error) => ({ error: errorDetails(error) })),
    dns.resolve6(host).catch((error) => ({ error: errorDetails(error) })),
  ]);

  const addresses = Array.isArray(lookupResult)
    ? lookupResult.map(({ address, family }) => ({ address, family }))
    : [];
  return {
    durationMs: durationSince(started),
    lookup: Array.isArray(lookupResult) ? { addresses } : lookupResult,
    resolve4: Array.isArray(ipv4Result) ? { addresses: ipv4Result } : ipv4Result,
    resolve6: Array.isArray(ipv6Result) ? { addresses: ipv6Result } : ipv6Result,
    addresses,
  };
}

function connectTcp(address, family) {
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
    socket.setTimeout(PROBE_TIMEOUT_MS, () => finish({ ok: false, error: { code: 'ETIMEDOUT' } }));
    socket.once('connect', () => finish({ ok: true }));
    socket.once('error', (error) => finish({ ok: false, error: errorDetails(error) }));
  });
}

function handshakeTls(host, address, family) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = tls.connect({
      host: address,
      port: 443,
      family,
      servername: host,
      rejectUnauthorized: true,
    });
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ address, family, durationMs: durationSince(started), ...result });
    };
    socket.setTimeout(PROBE_TIMEOUT_MS, () => finish({ ok: false, error: { code: 'ETIMEDOUT' } }));
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
    const request = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
        rejectUnauthorized: true,
      },
      (response) => {
        let bytes = 0;
        response.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > 8192) response.destroy();
        });
        response.on('close', () =>
          resolve({
            ok: true,
            method,
            statusCode: response.statusCode,
            location: publicLocation(response.headers.location),
            bytesRead: Math.min(bytes, 8192),
            durationMs: durationSince(started),
          }),
        );
      },
    );
    request.setTimeout(PROBE_TIMEOUT_MS, () =>
      request.destroy(Object.assign(new Error('HTTP request timeout'), { code: 'ETIMEDOUT' })),
    );
    request.once('error', (error) =>
      resolve({
        ok: false,
        method,
        durationMs: durationSince(started),
        error: errorDetails(error),
      }),
    );
    request.end();
  });
}

async function traceRedirects(urlString, method) {
  const hops = [];
  let current = urlString;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const result = await requestOnce(current, method);
    hops.push({ url: new URL(current).origin + new URL(current).pathname, ...result });
    if (!result.ok || result.statusCode < 300 || result.statusCode >= 400 || !result.location) {
      return { hops, finalUrl: hops.at(-1)?.url };
    }
    let next;
    try {
      next = new URL(result.location, current);
    } catch {
      return { hops, finalUrl: undefined, redirectError: 'invalid_location' };
    }
    if (
      next.protocol !== 'https:' ||
      officialFamily(next.hostname) !== officialFamily(new URL(current).hostname)
    ) {
      return { hops, finalUrl: undefined, redirectError: 'external_or_non_https_redirect' };
    }
    current = next.href;
  }
  return { hops, finalUrl: undefined, redirectError: 'redirect_limit_exceeded' };
}

async function probeHost(entry) {
  const dnsResult = await resolveHost(entry.host);
  const tcp = await Promise.all(
    dnsResult.addresses.map(({ address, family }) => connectTcp(address, family)),
  );
  const tlsResults = await Promise.all(
    dnsResult.addresses.map(({ address, family }) => handshakeTls(entry.host, address, family)),
  );
  const endpoints = {};
  for (const path of entry.paths) {
    const base = `https://${entry.host}${path}`;
    endpoints[path] = {
      head: await traceRedirects(base, 'HEAD'),
      get: await traceRedirects(base, 'GET'),
    };
  }
  return {
    host: entry.host,
    family: entry.family,
    dns: dnsResult,
    tcp,
    tls: tlsResults,
    endpoints,
  };
}

const outputPath = process.env.PROBE_OUTPUT ?? 'github-source-connectivity.json';
const hosts = [];
for (const entry of HOSTS) hosts.push(await probeHost(entry));

const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  runner: process.env.GITHUB_ACTIONS === 'true' ? 'github-hosted' : 'local',
  hosts,
};
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
