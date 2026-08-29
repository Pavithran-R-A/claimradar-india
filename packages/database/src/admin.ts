import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

/**
 * Creates a Supabase admin client with service-role key.
 * BYPASSES RLS — must only be used in server-side code.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable — required for admin DB access');
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY environment variable — required for admin DB access',
    );
  }

  return createClient<Database>(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
