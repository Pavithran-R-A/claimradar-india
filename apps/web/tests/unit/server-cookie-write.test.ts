import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { writeSupabaseServerCookies } from '../../lib/supabase/cookie-write';

describe('Next Server Component Supabase cookie writes', () => {
  it('does not throw for a blocked cookie write during server rendering', () => {
    const write = vi.fn(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler.');
    });
    expect(() =>
      writeSupabaseServerCookies([{ name: 'sb-staging-auth-token', value: 'opaque' }], write),
    ).not.toThrow();
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('preserves legitimate cookie updates in writable contexts', () => {
    const write = vi.fn();
    writeSupabaseServerCookies(
      [{ name: 'sb-staging-auth-token', value: 'opaque', options: { secure: true } }],
      write,
    );
    expect(write).toHaveBeenCalledWith('sb-staging-auth-token', 'opaque', { secure: true });
  });

  it('does not hide unexpected exceptions or configuration failures', () => {
    const write = () => {
      throw new Error('unexpected cookie store failure');
    };
    expect(() =>
      writeSupabaseServerCookies([{ name: 'sb-staging-auth-token', value: 'opaque' }], write),
    ).toThrow('unexpected cookie store failure');
  });

  it('has a middleware refresh path for signed-in /claimables visitors', () => {
    const code = readFileSync(new URL('../../middleware.ts', import.meta.url), 'utf8');
    expect(code).toContain("pathname === '/claimables'");
    expect(code).toContain("name.includes('-auth-token')");
    expect(code).toContain('needsPublicDirectoryRefresh');
    expect(code).toContain('await updateSession(request, requestHeaders)');
  });
});
