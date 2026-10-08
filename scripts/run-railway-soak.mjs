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
const crawlTimeoutMs = readPositiveMs('RAILWAY_SOAK_CRAWL_TIMEOUT_MS', DEFAULT_CRAWL_TIMEOUT_MS);

// Four six-hour cron ticks per UTC day. Reserve headroom against OpenRouter's
// 50/day free-account allowance. No paid provider may ever be used.
const freeBacklogLimitRaw = Number(process.env.FREE_AI_BACKLOG_LIMIT ?? '0');
if (!Number.isInteger(freeBacklogLimitRaw) || freeBacklogLimitRaw < 0 || freeBacklogLimitRaw > 2) {
  throw new Error('FREE_AI_BACKLOG_LIMIT must be an integer from 0 to 2');
}
const freeBacklogLimit = freeBacklogLimitRaw;
if (freeBacklogLimit > 0) {
  if (
    process.env.AI_PROVIDER !== 'openrouter' ||
    process.env.OPENROUTER_MODEL !== 'openrouter/free' ||
    !process.env.OPENROUTER_API_KEY
  ) {
    throw new Error('FREE_ONLY_GUARD: background AI requires active OpenRouter free routing');
  }
  const aiPerInvocation = Number(process.env.AI_DAILY_REQUEST_BUDGET);
  if (!Number.isInteger(aiPerInvocation) || aiPerInvocation < 3 || aiPerInvocation > 8) {
    throw new Error('FREE_ONLY_GUARD: per-cron AI budget must be between 3 and 8');
  }
}

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

// The crawl and its acceptance gate remain authoritative. A bounded,
// best-effort AI backlog sweep is optional and never auto-publishes a claim.
if (freeBacklogLimit > 0) {
  console.log(`[railway-soak] free AI backlog: trying up to ${freeBacklogLimit} candidate(s)`);
  const retry = spawnSync(
    process.execPath,
    ['apps/crawler/dist/index.js', 'retry-queued', `--limit=${freeBacklogLimit}`],
    {
      env: process.env,
      stdio: 'inherit',
      timeout: readPositiveMs('FREE_AI_BACKLOG_TIMEOUT_MS', 4 * 60 * 1000),
      killSignal: 'SIGTERM',
    },
  );
  if (retry.error || retry.status !== 0) {
    // The CLI uses exit 1 when any individual extraction fails; failures are
    // persisted for editorial triage. Preserve the successful crawl gate and
    // leave retries to a later scheduled run.
    console.warn(
      '[railway-soak] free AI backlog incomplete; crawl acceptance is unaffected',
      retry.error?.message ?? `exit=${retry.status ?? 'unknown'}`,
    );
  } else {
    console.log('[railway-soak] free AI backlog batch completed');
  }
}

console.log('[railway-soak] all gates passed');

// Railway Cron considers a job active until the root process exits. Be explicit
// so any incidental handles retained by Node/runtime libraries cannot keep a
// completed cron execution alive and block the next scheduled tick.
process.exit(0);
