/**
 * ClaimRadar Preview Application Load Test
 * Uses Vercel Protection Bypass for Automation (x-vercel-protection-bypass header)
 * to bypass Deployment Protection and hit the actual ClaimRadar Next.js application.
 *
 * IMPORTANT: VERCEL_AUTOMATION_BYPASS_SECRET must be set in .env.automation (gitignored).
 * This script reads it via dotenv-style parsing — never commits or logs the secret.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------- Load bypass secret from .env.automation ----------
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

const automationEnv = loadEnvFile(resolve('.env.automation'));
const BYPASS_SECRET =
  automationEnv['VERCEL_AUTOMATION_BYPASS_SECRET'] || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const BASE_URL =
  automationEnv['PREVIEW_URL'] ||
  process.env.PREVIEW_URL ||
  'https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app';

if (!BYPASS_SECRET) {
  console.error('ERROR: VERCEL_AUTOMATION_BYPASS_SECRET not found in .env.automation');
  console.error('Set it in .env.automation (gitignored). Never commit this value.');
  process.exit(1);
}

// Sanity-check: never print the secret
console.log('Bypass secret loaded:', '*'.repeat(BYPASS_SECRET.length));
console.log('Target URL:', BASE_URL);
console.log('');

// ---------- Test configuration ----------
const CONCURRENCY = 5;
const REQUESTS_PER_ROUTE = 5;

// ClaimRadar application marker — content that proves Next.js rendered ClaimRadar, not Vercel auth page
const CLAIMRADAR_MARKERS = ['__NEXT_DATA__', 'ClaimRadar', 'claimradar'];
const VERCEL_AUTH_MARKERS = [
  'sso.vercel.com',
  'vercel-sso',
  'Vercel Authentication',
  'Log in to Vercel',
];

// Routes to test: public static + database-backed
const ROUTES = [
  { path: '/', type: 'STATIC', expectedStatus: 200, description: 'Homepage' },
  {
    path: '/claimables',
    type: 'DB_BACKED',
    expectedStatus: 200,
    description: 'Claimables directory (Supabase query)',
  },
  {
    path: '/companies',
    type: 'DB_BACKED',
    expectedStatus: 200,
    description: 'Companies directory (Supabase query)',
  },
  {
    path: '/closing-soon',
    type: 'DB_BACKED',
    expectedStatus: 200,
    description: 'Closing soon (Supabase query)',
  },
  { path: '/sectors', type: 'STATIC', expectedStatus: [200, 404], description: 'Sectors page' },
  { path: '/pricing', type: 'STATIC', expectedStatus: 200, description: 'Pricing page' },
  { path: '/login', type: 'STATIC', expectedStatus: 200, description: 'Login page' },
  { path: '/register', type: 'STATIC', expectedStatus: 200, description: 'Register page' },
];

// ---------- Helpers ----------
function isExpectedStatus(actual, expected) {
  if (Array.isArray(expected)) return expected.includes(actual);
  return actual === expected;
}

function detectContent(body) {
  if (!body) return 'EMPTY';
  if (VERCEL_AUTH_MARKERS.some((m) => body.includes(m))) return 'VERCEL_AUTH_PAGE';
  if (CLAIMRADAR_MARKERS.some((m) => body.includes(m))) return 'CLAIMRADAR_APP';
  return 'UNKNOWN_CONTENT';
}

async function timedRequest(route) {
  const url = `${BASE_URL}${route.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects — we want to see the raw response
      signal: AbortSignal.timeout(20000),
      headers: {
        'x-vercel-protection-bypass': BYPASS_SECRET,
        'User-Agent': 'ClaimRadar-LoadTest/1.0',
        Accept: 'text/html,application/json',
      },
    });
    const durationMs = Math.round(performance.now() - start);
    const contentType = res.headers.get('content-type') || '';
    const body = await res.text();
    const contentClass = detectContent(body);
    const statusOk = isExpectedStatus(res.status, route.expectedStatus);
    const isAppResponse = statusOk && contentClass === 'CLAIMRADAR_APP';

    return {
      route: route.path,
      type: route.type,
      status: res.status,
      durationMs,
      contentType,
      bodySizeBytes: body.length,
      contentClass,
      isAppResponse,
      pass: isAppResponse,
      failReason: !statusOk
        ? `Unexpected status ${res.status}`
        : contentClass !== 'CLAIMRADAR_APP'
          ? `Content: ${contentClass}`
          : null,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    return {
      route: route.path,
      type: route.type,
      status: 0,
      durationMs,
      contentType: '',
      bodySizeBytes: 0,
      contentClass: 'REQUEST_ERROR',
      isAppResponse: false,
      pass: false,
      failReason: err.message,
    };
  }
}

// Run batch with limited concurrency
async function runBatch(tasks, concurrency) {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((t) => t()));
    results.push(...chunkResults);
  }
  return results;
}

// ---------- Phase 1: Baseline — 5 requests per route ----------
console.log('=== Phase 1: Baseline Application Load Test ===');
console.log(
  `Routes: ${ROUTES.length}, Requests per route: ${REQUESTS_PER_ROUTE}, Concurrency: ${CONCURRENCY}`,
);
console.log('');

const baselineTasks = [];
for (const route of ROUTES) {
  for (let i = 0; i < REQUESTS_PER_ROUTE; i++) {
    baselineTasks.push(() => timedRequest(route));
  }
}

const phaseStart = performance.now();
const baselineResults = await runBatch(baselineTasks, CONCURRENCY);
const phaseWallMs = Math.round(performance.now() - phaseStart);

// Print per-request summary
for (const r of baselineResults) {
  const mark = r.pass ? '✓' : '✗';
  const extra = r.pass ? `${r.bodySizeBytes}b ${r.contentType.split(';')[0]}` : r.failReason;
  console.log(
    `${mark} ${String(r.durationMs).padStart(5)}ms  HTTP ${r.status}  ${r.contentClass.padEnd(18)}  ${r.route}  (${extra})`,
  );
}

// ---------- Phase 2: Concurrent burst on /claimables ----------
console.log('\n=== Phase 2: Concurrent Burst — /claimables ===');
console.log('10 simultaneous requests × 2 rounds');

const burstRoute = ROUTES.find((r) => r.path === '/claimables') || ROUTES[0];
const burstRound1 = await Promise.all(Array.from({ length: 10 }, () => timedRequest(burstRoute)));
console.log('Round 1 done.');
// Small pause between rounds to avoid hammering
await new Promise((r) => setTimeout(r, 500));
const burstRound2 = await Promise.all(Array.from({ length: 10 }, () => timedRequest(burstRoute)));
console.log('Round 2 done.');
const burstResults = [...burstRound1, ...burstRound2];

// ---------- Stats ----------
function computeStats(results) {
  const all = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const appResponses = results.filter((r) => r.pass);
  const failures = results.filter((r) => !r.pass);
  const fivexx = results.filter((r) => r.status >= 500 && r.status < 600);
  const ratelimited = results.filter((r) => r.status === 429);
  const timedOut = results.filter((r) => r.failReason && r.failReason.includes('timeout'));
  return {
    total: results.length,
    passed: appResponses.length,
    failed: failures.length,
    fivexx: fivexx.length,
    ratelimited: ratelimited.length,
    timedOut: timedOut.length,
    errorRate: ((failures.length / results.length) * 100).toFixed(1) + '%',
    latency: all.length
      ? {
          min: all[0],
          max: all[all.length - 1],
          avg: Math.round(all.reduce((a, b) => a + b, 0) / all.length),
          p50: all[Math.floor(all.length * 0.5)],
          p95: all[Math.floor(all.length * 0.95)] ?? all[all.length - 1],
          p99: all[Math.floor(all.length * 0.99)] ?? all[all.length - 1],
        }
      : null,
  };
}

const baselineStats = computeStats(baselineResults);
const burstStats = computeStats(burstResults);

// Breakdown by type
const staticResults = baselineResults.filter(
  (r) => ROUTES.find((rt) => rt.path === r.route)?.type === 'STATIC',
);
const dbResults = baselineResults.filter(
  (r) => ROUTES.find((rt) => rt.path === r.route)?.type === 'DB_BACKED',
);
const staticStats = computeStats(staticResults);
const dbStats = computeStats(dbResults);

// Per-route summary
const routeSummary = ROUTES.map((route) => {
  const routeResults = baselineResults.filter((r) => r.route === route.path);
  const passed = routeResults.filter((r) => r.pass).length;
  const statuses = [...new Set(routeResults.map((r) => r.status))];
  const avgMs = Math.round(
    routeResults.reduce((a, b) => a + b.durationMs, 0) / routeResults.length,
  );
  const contentClasses = [...new Set(routeResults.map((r) => r.contentClass))];
  return {
    route: route.path,
    type: route.type,
    passed,
    total: REQUESTS_PER_ROUTE,
    avgMs,
    statuses,
    contentClasses,
  };
});

console.log('\n=== RESULTS SUMMARY ===');
console.log('\nPhase 1 — Baseline:');
console.log(
  `  Total: ${baselineStats.total} | Passed (app): ${baselineStats.passed} | Failed: ${baselineStats.failed}`,
);
console.log(
  `  5xx: ${baselineStats.fivexx} | 429: ${baselineStats.ratelimited} | Timeout: ${baselineStats.timedOut}`,
);
if (baselineStats.latency) {
  const L = baselineStats.latency;
  console.log(
    `  Latency: min=${L.min}ms avg=${L.avg}ms p50=${L.p50}ms p95=${L.p95}ms p99=${L.p99}ms max=${L.max}ms`,
  );
}

console.log('\nStatic pages:');
if (staticStats.latency)
  console.log(
    `  Passed: ${staticStats.passed}/${staticStats.total} | p50=${staticStats.latency.p50}ms p95=${staticStats.latency.p95}ms`,
  );
console.log('DB-backed pages:');
if (dbStats.latency)
  console.log(
    `  Passed: ${dbStats.passed}/${dbStats.total} | p50=${dbStats.latency.p50}ms p95=${dbStats.latency.p95}ms`,
  );

console.log('\nPhase 2 — Burst (/claimables, 20 requests):');
console.log(
  `  Total: ${burstStats.total} | Passed (app): ${burstStats.passed} | Failed: ${burstStats.failed}`,
);
if (burstStats.latency) {
  const L = burstStats.latency;
  console.log(`  Latency: min=${L.min}ms avg=${L.avg}ms p50=${L.p50}ms p95=${L.p95}ms`);
}

const output = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  bypassMethod: 'x-vercel-protection-bypass header (Protection Bypass for Automation)',
  classification: 'APPLICATION_LOAD_TEST',
  phases: {
    baseline: {
      description: `${ROUTES.length} routes × ${REQUESTS_PER_ROUTE} requests (concurrency ${CONCURRENCY})`,
      wallClockMs: phaseWallMs,
      stats: baselineStats,
      staticPageStats: staticStats,
      databaseBackedPageStats: dbStats,
      routeBreakdown: routeSummary,
    },
    burst: {
      description: '10 simultaneous requests × 2 rounds on /claimables',
      stats: burstStats,
    },
  },
  rawBaseline: baselineResults,
  rawBurst: burstResults,
};

writeFileSync('scripts/preview-load-test-results.json', JSON.stringify(output, null, 2));
console.log('\nResults written to scripts/preview-load-test-results.json');
