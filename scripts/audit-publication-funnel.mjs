/**
 * ClaimRadar Publication Funnel Audit
 *
 * Reads staging DB using service-role credentials and maps each stage
 * of the publication pipeline:
 *   source_documents → candidates → validation → publication
 *
 * Also audits crawler configuration to explain why candidate_documents = 0.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    env[t.slice(0, eq).trim()] = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

// Try .env.local first (has service key), then .env.staging
const localEnv = loadEnv(path.resolve(__dirname, '../.env.local'));
const stagingEnv = loadEnv(path.resolve(__dirname, '../.env.staging'));
const merged = { ...stagingEnv, ...localEnv };

const SUPABASE_URL = merged['SUPABASE_URL'] || merged['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY =
  merged['SUPABASE_SECRET_KEY'] ||
  merged['SUPABASE_SERVICE_ROLE_KEY'] ||
  merged['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or service key');
  process.exit(1);
}

const isServiceRole =
  SUPABASE_KEY.includes('"role":"service_role"') ||
  Buffer.from(SUPABASE_KEY.split('.')[1] || '', 'base64')
    .toString()
    .includes('service_role');

console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Key type: ${isServiceRole ? 'service_role' : 'anon (limited RLS access)'}`);
console.log('');

async function query(table, params = '') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'count=exact',
      'Range-Unit': 'items',
      Range: '0-0',
    },
  });
  const cr = r.headers.get('content-range');
  if (!cr) {
    const body = await r.text();
    return { count: null, status: r.status, body: body.substring(0, 200) };
  }
  const total = cr.includes('/') ? parseInt(cr.split('/')[1], 10) : null;
  return { count: total, status: r.status };
}

async function queryRows(table, params = '', limit = 5) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${params}&limit=${limit}&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
    },
  );
  if (!r.ok) return [];
  return r.json();
}

console.log('=== PUBLICATION FUNNEL AUDIT ===\n');

// Stage 1: Crawl runs
const crawlRunsTotal = await query('crawl_runs');
const crawlRunsSuccess = await query('crawl_runs', '?status=eq.success');
const crawlRunsRecent = await queryRows(
  'crawl_runs',
  '?select=id,status,sources_attempted,sources_succeeded,documents_upserted,started_at',
);

console.log('STAGE 1: Crawl Runs');
console.log(`  Total crawl runs:     ${crawlRunsTotal.count ?? crawlRunsTotal.status}`);
console.log(`  Successful runs:      ${crawlRunsSuccess.count ?? crawlRunsSuccess.status}`);
if (crawlRunsRecent.length) {
  console.log('  Recent runs:');
  for (const r of crawlRunsRecent) {
    console.log(
      `    [${r.started_at?.substring(0, 16)}] status=${r.status} sources=${r.sources_succeeded}/${r.sources_attempted} docs_upserted=${r.documents_upserted ?? 'null'}`,
    );
  }
}

// Stage 2: Source documents
const sourceDocs = await query('source_documents');
const sourceDocsByStatus = await queryRows(
  'source_documents',
  '?select=status,source_key&limit=100',
  100,
);

// Count by status
const statusCounts = {};
for (const d of sourceDocsByStatus) {
  statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
}

console.log('\nSTAGE 2: Source Documents');
console.log(`  Total source_documents: ${sourceDocs.count ?? sourceDocs.status}`);
console.log('  By status:');
for (const [s, c] of Object.entries(statusCounts)) {
  console.log(`    ${s}: ${c}`);
}

// Stage 3: Source health
const sourceHealth = await queryRows(
  'source_health_events',
  '?select=source_key,status,http_status,error_code,created_at',
  10,
);

console.log('\nSTAGE 3: Source Health');
for (const e of sourceHealth) {
  console.log(
    `  [${e.created_at?.substring(0, 16)}] ${e.source_key}: status=${e.status} http=${e.http_status} err=${e.error_code ?? 'none'}`,
  );
}

// Stage 4: Claimables (published)
const claimablesAll = await query('claimables');
const claimablesPublished = await query('claimables', '?status=eq.published');
const claimablesReview = await query('claimables', '?status=eq.under_review');
const claimablesDraft = await query('claimables', '?status=eq.draft');

console.log('\nSTAGE 4: Claimables');
console.log(`  Total claimables:     ${claimablesAll.count ?? claimablesAll.status}`);
console.log(`  Published:            ${claimablesPublished.count ?? claimablesPublished.status}`);
console.log(`  Under review:         ${claimablesReview.count ?? claimablesReview.status}`);
console.log(`  Draft:                ${claimablesDraft.count ?? claimablesDraft.status}`);

// Stage 5: Crawler config analysis
console.log('\nSTAGE 5: Crawler Configuration Analysis');

// Read source registry
const sourceRegistryPath = path.resolve(__dirname, '../packages/source-registry/src/index.ts');
const crawlerEnvPath = path.resolve(__dirname, '../apps/crawler/src/env.ts');

if (existsSync(sourceRegistryPath)) {
  const src = readFileSync(sourceRegistryPath, 'utf-8');
  const sourceMatches = [...src.matchAll(/key:\s*['"]([^'"]+)['"]/g)];
  console.log(`  Registered sources: ${sourceMatches.length}`);
  for (const m of sourceMatches) console.log(`    - ${m[1]}`);
}

if (existsSync(crawlerEnvPath)) {
  const env = readFileSync(crawlerEnvPath, 'utf-8');
  const aiEnabled = !env.includes('AI_EXTRACTION_ENABLED.*false') && env.includes('AI_EXTRACTION');
  const autoVerify = env.includes('AUTO_VERIFY_CLAIMABLES');
  console.log(`  AI extraction env var present: ${env.includes('AI_EXTRACTION')}`);
  console.log(`  AUTO_VERIFY_CLAIMABLES env var present: ${autoVerify}`);
}

// Read actual staging env for AI config
const aiKey = merged['OPENAI_API_KEY'] || merged['ANTHROPIC_API_KEY'] || merged['GEMINI_API_KEY'];
const aiEnabled = merged['AI_EXTRACTION_ENABLED'];
const autoVerify = merged['AUTO_VERIFY_CLAIMABLES'];

console.log(`  AI extraction enabled (env): ${aiEnabled ?? 'not set'}`);
console.log(`  AI API key present: ${!!aiKey}`);
console.log(`  AUTO_VERIFY_CLAIMABLES: ${autoVerify ?? 'not set'}`);

console.log('\n=== FUNNEL SUMMARY ===');
console.log(`  Crawl runs (total/success): ${crawlRunsTotal.count} / ${crawlRunsSuccess.count}`);
console.log(`  Source documents fetched: ${sourceDocs.count}`);
console.log(`  Published claimables: ${claimablesPublished.count}`);

// Determine bottleneck
if (sourceDocs.count === 0) {
  console.log('  BOTTLENECK: No source documents fetched (crawler not persisting to DB)');
} else if (
  claimablesPublished.count === 0 &&
  (claimablesReview.count > 0 || claimablesDraft.count > 0)
) {
  console.log(
    '  BOTTLENECK: Claimables exist but await editorial review (AUTO_VERIFY_CLAIMABLES=false)',
  );
} else if (claimablesAll.count === 0 && sourceDocs.count > 0) {
  console.log(
    '  BOTTLENECK: Source docs fetched but no claimables created (extraction/validation step)',
  );
} else if (claimablesPublished.count === 0) {
  console.log('  BOTTLENECK: 0 published — check extraction, validation, or editorial gate');
}
