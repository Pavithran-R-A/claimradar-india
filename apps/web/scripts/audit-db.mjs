import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../../.env.staging');
const envContent = readFileSync(envPath, 'utf8');

const matchUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const matchAnon = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/);

const supabase = createClient(matchUrl[1], matchAnon[1]);

async function check() {
  console.log('=== Staging Database Verification ===');

  const { data: claimables, error: cErr } = await supabase
    .from('claimables')
    .select('id, status')
    .limit(5);

  if (cErr) console.error('  Error:', cErr.message);
  else console.log(`  Success! Returned ${claimables.length} published rows.`);
}

check().catch((err) => console.error(err));
