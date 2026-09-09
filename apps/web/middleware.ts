import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that need auth session refresh
const authRequiredPrefixes = ['/app', '/admin', '/onboarding'];
const authCallbackPrefix = '/auth/callback';

function buildContentSecurityPolicy(nonce: string, isDevelopment: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'${isDevelopment ? " 'unsafe-inline'" : ''}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
    'upgrade-insecure-requests',
  ].join('; ');
}

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

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === 'development',
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  // Only refresh auth session on routes that need it
  const needsAuth =
    authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith(authCallbackPrefix);

  if (needsAuth) {
    const response = await updateSession(request, requestHeaders);
    response.headers.set('Content-Security-Policy', contentSecurityPolicy);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
