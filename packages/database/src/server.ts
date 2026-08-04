import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { CookieMethodsServer } from '@supabase/ssr';
import type { Database } from './types.js';

/**
 * Creates a Supabase client with cookie handling for server-side auth.
 * Uses SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and anon key.
 */
export function createServerClient(cookieMethods: CookieMethodsServer) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}

export type { CookieMethodsServer };
