/**
 * ClaimRadar Preview Public Route QA — uses x-vercel-protection-bypass header
 * to verify actual application responses (not Vercel auth redirects).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

const automationEnv = loadEnvFile(resolve('.env.automation'));
const BYPASS_SECRET =
  automationEnv['VERCEL_AUTOMATION_BYPASS_SECRET'] || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const BASE_URL =
  automationEnv['PREVIEW_URL'] ||
  'https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app';

if (!BYPASS_SECRET) {
  console.error('VERCEL_AUTOMATION_BYPASS_SECRET missing');
  process.exit(1);
}

const CLAIMRADAR_MARKERS = ['__NEXT_DATA__', 'ClaimRadar', 'claimradar'];
const VERCEL_AUTH_MARKERS = ['sso.vercel.com', 'Vercel Authentication', 'Log in to Vercel'];

const ROUTES = [
  { path: '/', expectedStatus: 200, description: 'Homepage' },
  { path: '/claimables', expectedStatus: 200, description: 'Claimables (DB-backed)' },
  { path: '/companies', expectedStatus: 200, description: 'Companies (DB-backed)' },
  { path: '/closing-soon', expectedStatus: 200, description: 'Closing Soon (DB-backed)' },
  { path: '/sectors', expectedStatus: [200, 404], description: 'Sectors' },
  { path: '/pricing', expectedStatus: 200, description: 'Pricing' },
  { path: '/faq', expectedStatus: 200, description: 'FAQ' },
  { path: '/terms', expectedStatus: 200, description: 'Terms' },
  { path: '/privacy', expectedStatus: 200, description: 'Privacy' },
  { path: '/login', expectedStatus: 200, description: 'Login' },
  { path: '/register', expectedStatus: 200, description: 'Register' },
  {
    path: '/app',
    expectedStatus: [307, 302],
    description: 'App (auth-protected, expect redirect)',
  },
  {
    path: '/admin',
    expectedStatus: [307, 302],
    description: 'Admin (auth-protected, expect redirect)',
  },
];

async function testRoute(route) {
  const url = `${BASE_URL}${route.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
      headers: {
        'x-vercel-protection-bypass': BYPASS_SECRET,
        'User-Agent': 'ClaimRadar-QA/1.0',
        Accept: 'text/html',
      },
    });
    const durationMs = Math.round(performance.now() - start);
    const body = await res.text();
    const expected = Array.isArray(route.expectedStatus)
      ? route.expectedStatus
      : [route.expectedStatus];
    const statusOk = expected.includes(res.status);
    const isAuthRedirect =
      expected.some((s) => s >= 300 && s < 400) && res.status >= 300 && res.status < 400;
    const hasVercelAuth = VERCEL_AUTH_MARKERS.some((m) => body.includes(m));
    const hasApp = CLAIMRADAR_MARKERS.some((m) => body.includes(m));
    const pass = statusOk && (isAuthRedirect ? true : hasApp && !hasVercelAuth);
    const location = res.headers.get('location') || '';

    return {
      route: route.path,
      description: route.description,
      status: res.status,
      durationMs,
      bodySizeBytes: body.length,
      hasClaimRadarMarker: hasApp,
      hasVercelAuthMarker: hasVercelAuth,
      location: isAuthRedirect ? location : undefined,
      pass,
      failReason: !pass
        ? !statusOk
          ? `HTTP ${res.status}`
          : hasVercelAuth
            ? 'Vercel auth page leaked'
            : 'Missing ClaimRadar marker'
        : null,
    };
  } catch (err) {
    return {
      route: route.path,
      description: route.description,
      status: 0,
      durationMs: Math.round(performance.now() - start),
      bodySizeBytes: 0,
      hasClaimRadarMarker: false,
      hasVercelAuthMarker: false,
      pass: false,
      failReason: err.message,
    };
  }
}

console.log('ClaimRadar Preview Public Route QA (with bypass header)\n');

const results = [];
for (const route of ROUTES) {
  const r = await testRoute(route);
  results.push(r);
  const mark = r.pass ? '✅ PASS' : '❌ FAIL';
  const extra = r.location ? `→ ${r.location.substring(0, 60)}` : `${r.bodySizeBytes}b`;
  console.log(
    `${mark}  HTTP ${r.status}  ${String(r.durationMs).padStart(5)}ms  ${route.path.padEnd(20)} ${extra}`,
  );
  if (!r.pass) console.log(`        Reason: ${r.failReason}`);
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass).length;
console.log(`\nSummary: ${passed}/${results.length} PASS, ${failed} FAIL`);

writeFileSync(
  'scripts/preview-qa-results.json',
  JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
);
console.log('Results written to scripts/preview-qa-results.json');
