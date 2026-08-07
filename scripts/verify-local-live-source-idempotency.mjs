/**
 * Local live-source idempotency verification (Phase 4B, brief section 25).
 *
 * Runs ONE controlled live-source window (generic-rss -> W3C News RSS) against
 * the LOCAL Supabase stack, records database row counts, re-runs the identical
 * window, and asserts that the second run creates ZERO duplicate content rows
 * across documents / clusters / memberships / candidates / claimables /
 * evidence / validation / AI cache / publication / notifications.
 *
 * Safety guardrails:
 *   - Refuses to run unless the target Supabase URL is the local stack.
 *   - Refuses to run if AUTO_VERIFY_CLAIMABLES or ENABLE_BILLING is truthy.
 *   - Never disables TLS verification; the live window uses the crawler's
 *     strict-TLS HTTP client.
 *   - Dry-run semantics are NOT used here by design: this verifies real
 *     database writes on the disposable local stack only.
 */
import { execSync, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdminClient } from '../packages/database/dist/index.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CRAWLER_DIR = resolve(REPO_ROOT, 'apps', 'crawler');
const SOURCE_ID = 'c0000000-0000-0000-0000-000000000004'; // stable local row id for generic-rss

// ---------------------------------------------------------------------------
// 1. Safety preconditions
// ---------------------------------------------------------------------------
const localUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
if (!/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(localUrl)) {
  console.error(
    `REFUSED: SUPABASE_URL must be the local stack (http://127.0.0.1:54321), got "${localUrl}".`,
  );
  process.exit(2);
}
process.env.SUPABASE_URL = localUrl;
process.env.NEXT_PUBLIC_SUPABASE_URL = localUrl;

for (const flag of ['AUTO_VERIFY_CLAIMABLES', 'ENABLE_BILLING']) {
  if (/^(1|true|yes|on)$/i.test(String(process.env[flag] ?? '').trim())) {
    console.error(`REFUSED: ${flag} must be false for this verification.`);
    process.exit(2);
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const status = JSON.parse(
      execSync('npx supabase status --output json', { encoding: 'utf8', cwd: REPO_ROOT }),
    );
    if (status?.SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
  } catch {
    // fall through to the error below
  }
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('REFUSED: could not resolve a local service-role key (is `supabase start` up?).');
  process.exit(2);
}

const supabase = createAdminClient();

// ---------------------------------------------------------------------------
// 2. Count helpers
// ---------------------------------------------------------------------------
const CONTENT_TABLES = [
  'source_documents',
  'content_clusters',
  'content_cluster_members',
  'candidate_documents',
  'claimables',
  'claim_evidence',
  'claim_sources',
  'validation_results',
  'ai_runs',
  'publication_events',
  'notifications',
  'notification_delivery_log',
];
// Run bookkeeping tables are expected to grow by one row per run; reported only.
const BOOKKEEPING_TABLES = ['crawl_runs', 'crawl_run_sources', 'crawl_errors'];

async function count(table) {
  const { count: n, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`count(${table}) failed: ${error.message}`);
  return n ?? 0;
}

async function snapshot() {
  const counts = {};
  for (const table of [...CONTENT_TABLES, ...BOOKKEEPING_TABLES]) {
    counts[table] = await count(table);
  }
  return counts;
}

function diff(after, before) {
  const d = {};
  for (const key of Object.keys(after)) d[key] = after[key] - before[key];
  return d;
}

// ---------------------------------------------------------------------------
// 3. Ensure the live source row exists locally (controlled setup)
// ---------------------------------------------------------------------------
const { data: sourceExists } = await supabase
  .from('sources')
  .select('id')
  .eq('id', SOURCE_ID)
  .maybeSingle();
if (!sourceExists) {
  const { error } = await supabase.from('sources').insert({
    id: SOURCE_ID,
    name: 'W3C News RSS (Generic Adapter)',
    domain: 'www.w3.org',
    base_url: 'https://www.w3.org',
    source_type: 'rss',
    adapter_name: 'rss',
    trust_level: 'reputable',
    enabled: true,
    fetch_frequency_hours: 24,
    rate_limit_per_minute: 10,
    metadata: { feedUrl: 'https://www.w3.org/news/feed/' },
  });
  if (error) {
    console.error(`Failed to seed local generic-rss source row: ${error.message}`);
    process.exit(1);
  }
  console.log('Seeded local source row for generic-rss (W3C News RSS).');
}

// ---------------------------------------------------------------------------
// 4. Controlled live window runner
// ---------------------------------------------------------------------------
function runLiveWindow(label) {
  console.log(`\n--- Live-source window: ${label} ---`);
  const res = spawnSync(`pnpm exec tsx src/index.ts source --source ${SOURCE_ID} --live`, {
    shell: true,
    cwd: CRAWLER_DIR,
    encoding: 'utf8',
    timeout: 600_000,
    windowsHide: true,
    env: {
      ...process.env,
      SUPABASE_URL: localUrl,
      NEXT_PUBLIC_SUPABASE_URL: localUrl,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      AI_PROVIDER: 'none',
      AUTO_VERIFY_CLAIMABLES: 'false',
      LIVE_ADAPTERS_ENABLED: 'true',
      CI: 'true',
    },
  });
  const tail = String(res.stdout ?? '')
    .split(/\r?\n/)
    .filter(
      (l) =>
        l.includes('===') ||
        /^(Sources|Documents|Candidates|AI calls|Publications|Errors|Per-source|  generic)/.test(l),
    )
    .join('\n');
  console.log(tail);
  if (res.status !== 0) {
    console.error(`Live window "${label}" exited ${res.status}`);
    const errTail = String(res.stderr ?? '')
      .split(/\r?\n/)
      .slice(-10)
      .join('\n');
    if (errTail) console.error(errTail);
    process.exit(1);
  }
}

console.log('=============================================================================');
console.log('  LOCAL LIVE-SOURCE IDEMPOTENCY (controlled window: generic-rss / W3C)');
console.log(`  Target: ${localUrl} (local stack only)`);
console.log('=============================================================================');

const baseline = await snapshot();
runLiveWindow('Run 1 (initial ingestion)');
const afterRun1 = await snapshot();

runLiveWindow('Run 2 (identical window re-run)');
const afterRun2 = await snapshot();

const delta1 = diff(afterRun1, baseline);
const delta2 = diff(afterRun2, afterRun1);

console.log('\n--- Row-count deltas (content tables) ---');
console.log('table'.padEnd(28), 'run1 delta'.padEnd(12), 'run2 delta');
let run1IngestedDocs = false;
let run2Duplicates = 0;
for (const table of CONTENT_TABLES) {
  console.log(table.padEnd(28), String(delta1[table]).padEnd(12), String(delta2[table]));
  if (table === 'source_documents' && delta1[table] > 0) run1IngestedDocs = true;
  if (delta2[table] > 0) run2Duplicates += delta2[table];
}
console.log('\n--- Row-count deltas (run bookkeeping, informational) ---');
for (const table of BOOKKEEPING_TABLES) {
  console.log(table.padEnd(28), String(delta1[table]).padEnd(12), String(delta2[table]));
}

const ok = run1IngestedDocs && run2Duplicates === 0;
if (!run1IngestedDocs) {
  console.error(
    '\nFAIL: run 1 ingested 0 source_documents — the controlled window produced no evidence.',
  );
}
if (run2Duplicates > 0) {
  console.error(`\nFAIL: run 2 created ${run2Duplicates} duplicate content row(s).`);
}
if (ok) {
  console.log(
    `\nPASS: run 1 ingested ${delta1.source_documents} document(s); identical re-run created 0 duplicate content rows.`,
  );
}

// ---------------------------------------------------------------------------
// 5. Best-effort cleanup of the controlled window's rows
// ---------------------------------------------------------------------------
console.log('\nCleaning up controlled-window rows...');
const { data: windowDocs } = await supabase
  .from('source_documents')
  .select('id, content_hash')
  .eq('source_id', SOURCE_ID);
const docIds = (windowDocs ?? []).map((d) => d.id);
if (docIds.length > 0) {
  await supabase.from('candidate_documents').delete().in('source_document_id', docIds);
  await supabase.from('source_documents').delete().in('id', docIds);
}
const hashes = (windowDocs ?? []).map((d) => d.content_hash);
if (hashes.length > 0) {
  await supabase.from('content_clusters').delete().in('canonical_hash', hashes);
}
console.log('Cleanup complete.');

process.exit(ok ? 0 : 1);
