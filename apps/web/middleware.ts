import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that need auth session refresh
const authRequiredPrefixes = ['/app', '/admin', '/onboarding'];
const authCallbackPrefix = '/auth/callback';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for static assets, images, and non-page routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Expose the current pathname to server components (used for return-path
  // redirects after login) via a request header.
  request.headers.set('x-pathname', pathname);

  // Only refresh auth session on routes that need it
  const needsAuth =
    authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith(authCallbackPrefix);

  if (needsAuth) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
