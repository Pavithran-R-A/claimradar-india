import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { CookieMethodsServer } from '@supabase/ssr';
import type { Database } from './types.js';

/**
 * Creates a Supabase client with cookie handling for server-side auth.
 * Uses SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and anon key.
 */
export function createServerClient(cookieMethods: CookieMethodsServer) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!;

  return createSSRServerClient<Database>(supabaseUrl, publishableKey, {
    cookies: cookieMethods,
  });
}

export type { CookieMethodsServer };
