import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { writeSupabaseServerCookies } from './cookie-write';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY!;

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        writeSupabaseServerCookies(cookiesToSet, (name, value, options) => {
          cookieStore.set(name, value, options as never);
        });
      },
    },
  });
}
