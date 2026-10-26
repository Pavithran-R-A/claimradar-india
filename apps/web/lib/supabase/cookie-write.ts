/**
 * Next.js Server Components can read request cookies, but cannot mutate
 * outgoing response cookies. Auth refreshes must be handled by middleware
 * or a Route Handler, not during a server-rendered directory page.
 */
export function writeSupabaseServerCookies(
  cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
  setCookie: (name: string, value: string, options?: Record<string, unknown>) => void,
): void {
  for (const { name, value, options } of cookiesToSet) {
    try {
      setCookie(name, value, options);
    } catch (error) {
      if (
        error instanceof Error &&
        /Cookies can only be modified in a Server Action or Route Handler/i.test(error.message)
      ) {
        // The middleware owns token refresh and response Set-Cookie headers.
        continue;
      }
      throw error;
    }
  }
}
