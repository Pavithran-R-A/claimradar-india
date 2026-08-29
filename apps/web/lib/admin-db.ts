import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service-role key.
 * Uses `any` for the generic to avoid Database/GenericSchema type mismatches.
 * BYPASSES RLS — must only be used in server-side admin code.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAdminDb(): any {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable — required for admin DB access',
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
