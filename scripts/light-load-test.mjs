/**
 * Light load test using Node built-in fetch (parallel requests, no auth needed for public routes).
 * Tests the Vercel Preview deployment's public-accessible static routes.
 */
import { writeFileSync } from 'node:fs';

const BASE_URL = 'https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app';
const ROUTES = ['/', '/pricing', '/faq', '/terms', '/privacy'];
const REQUESTS_PER_ROUTE = 5;
const TOTAL = ROUTES.length * REQUESTS_PER_ROUTE;

console.log(`Light Load Test — ${TOTAL} parallel requests across ${ROUTES.length} public routes\n`);

const results = [];

async function timedFetch(url) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
    const durationMs = Math.round(performance.now() - start);
    return { url, status: res.status, durationMs, ok: res.status >= 200 && res.status < 400 };
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    return { url, status: 0, durationMs, ok: false, error: err.message };
  }
}

// Launch all requests in parallel
const tasks = [];
for (const route of ROUTES) {
  for (let i = 0; i < REQUESTS_PER_ROUTE; i++) {
    tasks.push(timedFetch(`${BASE_URL}${route}`));
  }
}

const start = performance.now();
const rawResults = await Promise.all(tasks);
const totalWallMs = Math.round(performance.now() - start);

// Compute stats
const allOk = rawResults.filter(r => r.ok);
const allFailed = rawResults.filter(r => !r.ok);
const durations = rawResults.map(r => r.durationMs).sort((a, b) => a - b);
const p50 = durations[Math.floor(durations.length * 0.5)];
const p95 = durations[Math.floor(durations.length * 0.95)];
const p99 = durations[Math.floor(durations.length * 0.99)] ?? durations[durations.length - 1];
const min = durations[0];
const max = durations[durations.length - 1];
const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

const summary = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  totalRequests: TOTAL,
  concurrency: TOTAL,
  passedRequests: allOk.length,
  failedRequests: allFailed.length,
  errorRate: `${((allFailed.length / TOTAL) * 100).toFixed(1)}%`,
  wallClockMs: totalWallMs,
  latencyMs: { min, avg, p50, p95, p99, max },
  routeBreakdown: ROUTES.map(route => {
    const routeResults = rawResults.filter(r => r.url.endsWith(route));
    const passed = routeResults.filter(r => r.ok).length;
    const avgMs = Math.round(routeResults.reduce((a, b) => a + b.durationMs, 0) / routeResults.length);
    const statuses = [...new Set(routeResults.map(r => r.status))];
    return { route, passed, total: REQUESTS_PER_ROUTE, avgMs, statuses };
  }),
};

console.log('\n=== LOAD TEST RESULTS ===');
console.log(`Total Requests:   ${summary.totalRequests}`);
console.log(`Passed:           ${summary.passedRequests}`);
console.log(`Failed:           ${summary.failedRequests} (${summary.errorRate})`);
console.log(`Wall Clock:       ${summary.wallClockMs}ms`);
console.log(`Latency (ms):     min=${min} avg=${avg} p50=${p50} p95=${p95} p99=${p99} max=${max}`);
console.log('\nRoute Breakdown:');
summary.routeBreakdown.forEach(r => {
  console.log(`  ${r.route.padEnd(20)} ${r.passed}/${r.total} passed  avg=${r.avgMs}ms  status=${r.statuses.join(',')}`);
});

writeFileSync('scripts/preview-load-test-results.json', JSON.stringify(summary, null, 2));
console.log('\nResults written to scripts/preview-load-test-results.json');
