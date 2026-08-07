import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

/**
 * Creates a Supabase admin client with service-role key.
 * BYPASSES RLS — must only be used in server-side code.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
