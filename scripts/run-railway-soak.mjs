import { spawnSync } from 'node:child_process';

function run(label, args) {
  console.log(`[railway-soak] starting ${label}`);
  const result = spawnSync(process.execPath, args, {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
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

run('staging preflight', [
  'apps/crawler/dist/index.js',
  'preflight',
  '--environment=staging',
]);

run('live staging crawl', [
  'apps/crawler/dist/index.js',
  'daily',
]);

run('soak acceptance gate', [
  'scripts/validate-soak-summary.mjs',
  process.env.CRAWLER_SUMMARY_FILE || '/tmp/railway-crawl-summary.json',
]);

console.log('[railway-soak] all gates passed');
