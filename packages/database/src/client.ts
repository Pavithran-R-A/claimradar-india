import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from './types.js';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env vars.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY!;

  return createSSRBrowserClient<Database>(supabaseUrl, publishableKey);
}
