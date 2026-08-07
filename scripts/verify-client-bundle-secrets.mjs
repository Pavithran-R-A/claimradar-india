/**
 * Client Bundle Secret Verification Script (Task 18)
 * Scans client-side Next.js bundle files under apps/web/.next/static/
 * to verify 0 backend secrets leak to browser JS bundles.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const staticDir = resolve('apps/web/.next/static');

const SECRET_PATTERNS = [
  { name: 'Secret Key Pattern (sb_secret_)', pattern: /sb_secret_[a-zA-Z0-9_\-]+/g },
  { name: 'Service Role Key Reference', pattern: /service_role/g },
  { name: 'PostgreSQL Connection URL (postgresql://)', pattern: /postgresql:\/\/[^\s"'`]+/g },
  { name: 'SUPABASE_DB_PASSWORD', pattern: /SUPABASE_DB_PASSWORD/g },
  { name: 'DATABASE_URL', pattern: /DATABASE_URL/g },
  { name: 'SUPABASE_ACCESS_TOKEN', pattern: /SUPABASE_ACCESS_TOKEN/g },
];

function getAllFiles(dir, files = []) {
  if (!readdirSync) return files;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

console.log('=============================================================================');
console.log('  CLIENT BUNDLE SECRET AUDIT (apps/web/.next/static)');
console.log('=============================================================================');

const jsFiles = getAllFiles(staticDir);
console.log(`Scanned ${jsFiles.length} client JavaScript bundle files.`);

let failed = false;

for (const { name, pattern } of SECRET_PATTERNS) {
  let matchCount = 0;
  for (const file of jsFiles) {
    const content = readFileSync(file, 'utf8');
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      matchCount += matches.length;
      console.error(
        `❌ Leak detected! Pattern [${name}] found in file: ${file.replace(resolve('.'), '')}`,
      );
      failed = true;
    }
  }
  if (matchCount === 0) {
    console.log(`✅ [PASS] ${name}: 0 matches in client bundles.`);
  }
}

console.log('=============================================================================');
if (failed) {
  console.error('❌ CLIENT BUNDLE SECRET AUDIT FAILED: Backend secrets found in browser bundle!');
  process.exit(1);
} else {
  console.log(
    '🎉 CLIENT BUNDLE SECRET AUDIT PASSED: 0 backend secrets in browser bundle output.\n',
  );
  process.exit(0);
}
