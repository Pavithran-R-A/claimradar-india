import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(
  request: NextRequest,
  requestHeaders = new Headers(request.headers),
) {
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY!;

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options as never);
        });
      },
    },
  });

  // Refresh the auth session on every request
  await supabase.auth.getUser();

  return supabaseResponse;
}
