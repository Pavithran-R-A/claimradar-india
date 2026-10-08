import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const migrations = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const expectedVersions = Array.from({ length: 17 }, (_, index) =>
  String(index + 1).padStart(3, '0'),
);
// The original 17 numbered migrations are immutable. Subsequent production
// migrations use Supabase timestamps and must not break the legacy contract.
const legacyMigrations = migrations.filter((file) => /^\d{3}_/.test(file));
const subsequentMigrations = migrations.filter((file) => !/^\d{3}_/.test(file));
const actualVersions = legacyMigrations.map((file) => file.slice(0, 3));
const failures = [];

if (legacyMigrations.length !== expectedVersions.length) {
  failures.push(
    `expected ${expectedVersions.length} immutable legacy migrations, found ${legacyMigrations.length}`,
  );
}
for (const file of subsequentMigrations) {
  if (!/^\d{14}_[a-z0-9_-]+\.sql$/.test(file)) {
    failures.push(`unrecognized timestamped migration filename: ${file}`);
  }
}

expectedVersions.forEach((version, index) => {
  if (actualVersions[index] !== version) {
    failures.push(`migration sequence mismatch at ${version}`);
  }
});

const requiredContracts = [
  ['001_initial_schema.sql', /create\s+table\s+sectors/i, 'initial sectors table'],
  ['002_ingestion_tables.sql', /create\s+table\s+crawl_runs/i, 'crawl run table'],
  ['003_user_tables.sql', /create\s+table\s+profiles/i, 'profiles table'],
  ['006_rls_policies.sql', /enable\s+row\s+level\s+security/i, 'base RLS policies'],
  ['009_freshness_and_deduplication.sql', /content_cluster_members/i, 'deduplication tables'],
  ['011_notifications.sql', /notification_delivery_log/i, 'notification delivery table'],
  ['012_security_advisor_hardening.sql', /private\.is_staff/i, 'staff helper hardening'],
  [
    '016_security_profile_update_hardening.sql',
    /grant\s+update\s+\(display_name\)/i,
    'profile update hardening',
  ],
  [
    '017_notification_delivery_log_rls_hardening.sql',
    /notification_delivery_log_service_role_access/i,
    'delivery-log RLS hardening',
  ],
];

for (const [file, pattern, description] of requiredContracts) {
  const contents = readFileSync(join(migrationsDir, file), 'utf8');
  if (!pattern.test(contents)) failures.push(`missing ${description} in ${file}`);
}

if (failures.length > 0) {
  console.error('Migration contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Migration contract passed: ${migrations.length} ordered migrations.`);
