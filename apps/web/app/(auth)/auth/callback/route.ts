import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Auth callback for email confirmation and password-recovery links.
 *
 * Expired or invalid links are routed back to the relevant auth page with an
 * `error` flag so users get actionable feedback (and can resend) instead of a
 * silent redirect to login.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Prevent open redirect: only allow safe relative paths
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  const isRecoveryFlow = safeNext.startsWith('/reset-password');
  const failureBase = isRecoveryFlow ? '/forgot-password' : '/verify-email';

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    const message = error.message.toLowerCase();
    const failureKind = message.includes('expired') ? 'link_expired' : 'link_invalid';
    return NextResponse.redirect(`${origin}${failureBase}?error=${failureKind}`);
  }

  // No code at all — treat the link as invalid.
  return NextResponse.redirect(`${origin}${failureBase}?error=link_invalid`);
}
