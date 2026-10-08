import { spawnSync } from 'node:child_process';

const DEFAULT_CRAWL_TIMEOUT_MS = 15 * 60 * 1000;
const DEFAULT_SHORT_STEP_TIMEOUT_MS = 60 * 1000;

function readPositiveMs(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function run(label, args, timeoutMs) {
  console.log(`[railway-soak] starting ${label}`);
  const result = spawnSync(process.execPath, args, {
    env: process.env,
    stdio: 'inherit',
    timeout: timeoutMs,
    killSignal: 'SIGTERM',
  });

  if (result.error) {
    const code = result.error && typeof result.error === 'object' ? result.error.code : undefined;
    if (code === 'ETIMEDOUT') {
      console.error(`[railway-soak] ${label} exceeded ${timeoutMs}ms and was terminated`);
      process.exit(124);
    }

    console.error(`[railway-soak] ${label} failed to start:`, result.error);
    process.exit(1);
  }

  const status = result.status ?? 1;
  if (status !== 0) {
    console.error(`[railway-soak] ${label} failed with exit code ${status}`);
    process.exit(status);
  }

  console.log(`[railway-soak] ${label} passed`);
}

const shortStepTimeoutMs = readPositiveMs(
  'RAILWAY_SOAK_SHORT_STEP_TIMEOUT_MS',
  DEFAULT_SHORT_STEP_TIMEOUT_MS,
);
const crawlTimeoutMs = readPositiveMs(
  'RAILWAY_SOAK_CRAWL_TIMEOUT_MS',
  DEFAULT_CRAWL_TIMEOUT_MS,
);

run(
  'staging preflight',
  ['apps/crawler/dist/index.js', 'preflight', '--environment=staging'],
  shortStepTimeoutMs,
);

run('live staging crawl', ['apps/crawler/dist/index.js', 'daily'], crawlTimeoutMs);

run(
  'soak acceptance gate',
  [
    'scripts/validate-soak-summary.mjs',
    process.env.CRAWLER_SUMMARY_FILE || '/tmp/railway-crawl-summary.json',
  ],
  shortStepTimeoutMs,
);

console.log('[railway-soak] all gates passed');

// Railway Cron considers a job active until the root process exits. Be explicit
// so any incidental handles retained by Node/runtime libraries cannot keep a
// completed cron execution alive and block the next scheduled tick.
process.exit(0);
