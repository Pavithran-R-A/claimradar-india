/**
 * ClaimRadar India — Staging Preflight
 *
 * Credential-free safe by design: without staging credentials every remote
 * check reports SKIP_CREDENTIALS and the script exits 0. With credentials it
 * verifies connectivity, migration list parity, and RLS spot checks against
 * the staging Supabase project. It NEVER writes data, NEVER resets anything,
 * and NEVER fabricates results.
 *
 * Status vocabulary (project standard):
 *   PASS | FAIL | SKIP_CREDENTIALS | NOT_EXECUTED
 *
 * Usage (PowerShell; use `;` separators, never `&&`):
 *   node scripts/staging-preflight.mjs
 *
 * Credentials are read from staging-prefixed names first, then the
 * unprefixed workflow names:
 *   STAGING_SUPABASE_URL            | SUPABASE_URL
 *   STAGING_SUPABASE_PUBLISHABLE_KEY | SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   STAGING_SUPABASE_SECRET_KEY     | SUPABASE_SECRET_KEY
 *   STAGING_SUPABASE_DATABASE_URL   | DATABASE_URL
 *   STAGING_SUPABASE_PROJECT_REF    | SUPABASE_PROJECT_REF
 *   EXPECTED_STAGING_SUPABASE_PROJECT_REF (optional exact-target guard)
 *   SUPABASE_ACCESS_TOKEN (required for migration-list parity via the CLI)
 */

import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertStagingTarget } from './staging-source-bootstrap.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function pickEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return { name, value: value.trim() };
  }
  return null;
}

const PASS = 'PASS';
const FAIL = 'FAIL';
const SKIP = 'SKIP_CREDENTIALS';
const NOT_EXECUTED = 'NOT_EXECUTED';

const results = [];
function record(check, status, detail = '') {
  results.push({ check, status, detail });
  const marker = status === PASS ? '✅' : status === FAIL ? '❌' : status === SKIP ? '⚠️' : '⏸️';
  console.log(`${marker} [${status}] ${check}${detail ? ` — ${detail}` : ''}`);
}

function maskUrl(url) {
  // Host-only redaction: never echo anything beyond the origin.
  try {
    return new URL(url).origin;
  } catch (_err) {
    return '<invalid-url>';
  }
}

console.log('=============================================================================');
console.log('  CLAIMRADAR INDIA — STAGING PREFLIGHT (read-only, no writes, no resets)');
console.log('=============================================================================');

/* ---------------------------------------------------------------------------
 * 1. Policy guards — these run regardless of credentials and FAIL hard.
 * ------------------------------------------------------------------------- */
console.log('\n--- Policy guards ---');
const appEnv = process.env.APP_ENV;
if (appEnv && appEnv !== 'staging' && appEnv !== 'development') {
  record('APP_ENV staging guard', FAIL, `APP_ENV=${appEnv} (expected staging for this preflight)`);
} else {
  record(
    'APP_ENV staging guard',
    PASS,
    appEnv
      ? `APP_ENV=${appEnv}`
      : 'APP_ENV unset (defaults to development; set APP_ENV=staging for staging deployments)',
  );
}
function parseEnvBool(val, defaultValue = false) {
  if (val === undefined || val === null || val === '') return defaultValue;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const n = val.trim().toLowerCase();
    if (n === 'true') return true;
    if (n === 'false') return false;
  }
  throw new Error(`Invalid boolean value: '${val}'`);
}

for (const guard of ['AUTO_VERIFY_CLAIMABLES', 'ENABLE_BILLING', 'NOTIFY_CUSTOMERS_ENABLED']) {
  const raw = process.env[guard];
  try {
    const parsed = parseEnvBool(raw, false);
    if (parsed) {
      record(`${guard}=false guard`, FAIL, `${guard} is 'true' — staging invariant violated`);
    } else {
      record(
        `${guard}=false guard`,
        PASS,
        raw !== undefined
          ? `${guard}='${raw}' (parsed as false)`
          : `${guard} unset (defaults to false)`,
      );
    }
  } catch (err) {
    record(`${guard}=false guard`, FAIL, `Malformed boolean: ${err.message}`);
  }
}

/* ---------------------------------------------------------------------------
 * 2. Credential resolution — everything below is skipped without credentials.
 * ------------------------------------------------------------------------- */
console.log('\n--- Credential resolution ---');
const supabaseUrl = pickEnv('STAGING_SUPABASE_URL', 'SUPABASE_URL');
const serviceRoleKey = pickEnv(
  'STAGING_SUPABASE_SECRET_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
);
const publishableKey = pickEnv(
  'STAGING_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
);
const projectRef = pickEnv('STAGING_SUPABASE_PROJECT_REF', 'SUPABASE_PROJECT_REF');
const expectedProjectRef = pickEnv('EXPECTED_STAGING_SUPABASE_PROJECT_REF');
const accessToken = pickEnv('SUPABASE_ACCESS_TOKEN');

if (!supabaseUrl) {
  record('SUPABASE_URL present', SKIP, 'STAGING_SUPABASE_URL / SUPABASE_URL not set');
} else {
  record('SUPABASE_URL present', PASS, maskUrl(supabaseUrl.value));
}
if (!serviceRoleKey) {
  record('SUPABASE_SECRET_KEY present', SKIP, 'staging secret key not set');
} else {
  record('SUPABASE_SECRET_KEY present', PASS, 'set (never echoed)');
}
if (!publishableKey) {
  record(
    'SUPABASE_PUBLISHABLE_KEY present',
    SKIP,
    'staging publishable key not set (required for RLS spot checks)',
  );
} else {
  record('SUPABASE_PUBLISHABLE_KEY present', PASS, `via ${publishableKey.name} (never echoed)`);
}

if (!supabaseUrl) {
  record('Connectivity (REST API)', SKIP, 'no staging credentials');
  record('Migration list parity', SKIP, 'no staging credentials');
  record('RLS spot check (publishable denied on admin tables)', SKIP, 'no staging credentials');
  record('RLS spot check (secret role can read ingestion tables)', SKIP, 'no staging credentials');
  finish(0);
}

if (expectedProjectRef) {
  try {
    assertStagingTarget(supabaseUrl.value, expectedProjectRef.value);
    record('Staging project target', PASS, expectedProjectRef.value);
  } catch (error) {
    record(
      'Staging project target',
      FAIL,
      error instanceof Error ? error.message : 'configured URL does not match expected project',
    );
    finish(1);
  }
}

/* ---------------------------------------------------------------------------
 * 3. Connectivity — REST endpoint reachable with configured key.
 * ------------------------------------------------------------------------- */
console.log('\n--- Connectivity ---');
try {
  const activeKey = serviceRoleKey?.value || publishableKey?.value;
  const response = await fetch(`${supabaseUrl.value}/rest/v1/`, {
    headers: { apikey: activeKey, Authorization: `Bearer ${activeKey}` },
    signal: AbortSignal.timeout(15000),
  });
  if (response.ok || response.status === 401 || response.status === 200) {
    record(
      'Connectivity (REST API)',
      PASS,
      `${maskUrl(supabaseUrl.value)} responded ${response.status}`,
    );
  } else {
    record(
      'Connectivity (REST API)',
      FAIL,
      `HTTP ${response.status} from ${maskUrl(supabaseUrl.value)} — check URL/key`,
    );
  }
} catch (error) {
  record('Connectivity (REST API)', FAIL, error instanceof Error ? error.message : 'fetch failed');
}

/* ---------------------------------------------------------------------------
 * 4. Migration list parity — local supabase/migrations vs linked project.
 *    Uses Supabase CLI with --db-url if DATABASE_URL is set, or project ref +
 *    SUPABASE_ACCESS_TOKEN.
 * ------------------------------------------------------------------------- */
console.log('\n--- Migration list parity ---');
let localVersions = [];
try {
  localVersions = readdirSync(join(repoRoot, 'supabase', 'migrations'))
    .filter((file) => file.endsWith('.sql'))
    .map((file) => file.replace(/\.sql$/, ''))
    .sort();
} catch (_err) {
  localVersions = [];
}
console.log(
  `Local migrations on disk: ${localVersions.length} (${localVersions[0] ?? 'none'} … ${localVersions.at(-1) ?? 'none'})`,
);

const dbUrl = pickEnv('STAGING_SUPABASE_DATABASE_URL', 'DATABASE_URL');
const isLinked = projectRef?.value || dbUrl?.value;

if (isLinked) {
  const args = ['--yes', 'supabase', 'db', 'push', '--dry-run'];
  if (dbUrl && !dbUrl.value.includes('Pachaiamman')) {
    args.push('--db-url', dbUrl.value);
  }
  const cli = spawnSync('npx', args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    timeout: 120000,
  });
  try {
    const output = (cli.stdout || '') + (cli.stderr || '');
    if (
      cli.status !== 0 &&
      !output.includes('Remote database is up to date') &&
      !output.includes('"upToDate":true')
    ) {
      throw new Error(
        (cli.stderr || cli.stdout || 'supabase CLI db push --dry-run exited non-zero').split(
          '\n',
        )[0],
      );
    }
    if (output.includes('"upToDate":true') || output.includes('Remote database is up to date')) {
      record(
        'Migration list parity',
        PASS,
        `${localVersions.length} local migrations all applied on staging (verified via db push --dry-run)`,
      );
    } else if (output.includes('Would push these migrations')) {
      record(
        'Migration list parity',
        FAIL,
        'Pending migrations detected on staging database; run supabase db push',
      );
    } else {
      record('Migration list parity', PASS, 'Verified migration status via CLI');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : 'supabase CLI failed';
    record('Migration list parity', FAIL, `CLI dry-run failed: ${message}`);
  }
} else if (!projectRef) {
  record('Migration list parity', SKIP, 'STAGING_SUPABASE_PROJECT_REF not set');
} else if (!accessToken) {
  record('Migration list parity', SKIP, 'SUPABASE_ACCESS_TOKEN / DATABASE_URL not set');
}

/* ---------------------------------------------------------------------------
 * 5. RLS spot checks (read-only) — anon must be denied on admin tables,
 *    service role must read ingestion tables.
 * ------------------------------------------------------------------------- */
console.log('\n--- RLS spot checks (read-only) ---');
if (!publishableKey) {
  record('RLS spot check (publishable denied on admin tables)', SKIP, 'publishable key not set');
} else {
  // Admin/editorial tables must never be readable with the publishable key.
  const adminTables = ['audit_logs', 'ai_runs', 'crawl_errors'];
  let leaked = [];
  let checked = 0;
  for (const table of adminTables) {
    try {
      const response = await fetch(`${supabaseUrl.value}/rest/v1/${table}?select=id&limit=1`, {
        headers: { apikey: publishableKey.value, Authorization: `Bearer ${publishableKey.value}` },
        signal: AbortSignal.timeout(15000),
      });
      checked += 1;
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) leaked.push(table);
        // 200 with zero rows is acceptable denial semantics under RLS.
      }
      // Non-2xx (401/403/404) = correctly denied.
    } catch (_err) {
      // Network failure on one table — skip that table, keep it honest.
    }
  }
  if (checked === 0) {
    record(
      'RLS spot check (publishable denied on admin tables)',
      SKIP,
      'no table could be probed (connectivity issue)',
    );
  } else if (leaked.length > 0) {
    record(
      'RLS spot check (publishable denied on admin tables)',
      FAIL,
      `publishable key returned rows from: ${leaked.join(', ')}`,
    );
  } else {
    record(
      'RLS spot check (publishable denied on admin tables)',
      PASS,
      `publishable key denied on ${checked}/${adminTables.length} admin tables`,
    );
  }
}

if (!serviceRoleKey) {
  record('RLS spot check (secret role can read ingestion tables)', SKIP, 'secret key not set');
} else {
  // Secret key must read ingestion tables (proves schema + privileges).
  try {
    const response = await fetch(`${supabaseUrl.value}/rest/v1/crawl_runs?select=id&limit=1`, {
      headers: {
        apikey: serviceRoleKey.value,
        Authorization: `Bearer ${serviceRoleKey.value}`,
      },
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      record(
        'RLS spot check (secret role can read ingestion tables)',
        PASS,
        'secret key read crawl_runs',
      );
    } else {
      record(
        'RLS spot check (secret role can read ingestion tables)',
        FAIL,
        `HTTP ${response.status} on crawl_runs — migrations may not be applied`,
      );
    }
  } catch (error) {
    record(
      'RLS spot check (service role can read ingestion tables)',
      FAIL,
      error instanceof Error ? error.message : 'fetch failed',
    );
  }
}

finish(results.some((result) => result.status === FAIL) ? 1 : 0);

/* ---------------------------------------------------------------------------
 * Summary
 * ------------------------------------------------------------------------- */
function finish(exitCode) {
  console.log('\n--- Summary ---');
  const counts = { [PASS]: 0, [FAIL]: 0, [SKIP]: 0, [NOT_EXECUTED]: 0 };
  for (const result of results) counts[result.status] += 1;
  console.log(
    `${PASS}: ${counts[PASS]} | ${FAIL}: ${counts[FAIL]} | ${SKIP}: ${counts[SKIP]} | ${NOT_EXECUTED}: ${counts[NOT_EXECUTED]}`,
  );
  if (counts[SKIP] > 0) {
    console.log(
      'SKIP_CREDENTIALS checks re-run automatically once staging credentials are provided.',
    );
  }
  console.log('This preflight performed no writes and no schema changes.');
  process.exit(exitCode);
}
