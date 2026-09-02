import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeNextPath } from '@/lib/app-auth';
import {
  getUser,
  getUserProfile,
  hasRole,
  isStaffRole,
  requireAuth,
  requireRole,
  requireRoles,
  STAFF_ROLES,
} from '@/lib/auth';

/* ---------------------------------------------------------------------------
 * Module mocks — auth guards are verified without a live Supabase instance.
 * ------------------------------------------------------------------------- */

class RedirectError extends Error {
  constructor(readonly destination: string) {
    super(`redirect:${destination}`);
  }
}

const mockGetUser = vi.fn();
const mockProfileQuery = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: async () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({ single: () => mockProfileQuery(table) }),
      }),
    }),
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: (destination: string) => {
    throw new RedirectError(destination);
  },
}));

function setAuthedUser(id = 'user-1', email = 'user@example.com') {
  mockGetUser.mockResolvedValue({ data: { user: { id, email } }, error: null });
}

function setSignedOut() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

function setProfile(role: string) {
  mockProfileQuery.mockResolvedValue({
    data: { id: 'user-1', email: 'user@example.com', role },
    error: null,
  });
}

function setProfileMissing() {
  mockProfileQuery.mockResolvedValue({ data: null, error: { message: 'not found' } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ---------------------------------------------------------------------------
 * Role guard primitives
 * ------------------------------------------------------------------------- */

describe('isStaffRole', () => {
  it('accepts every recognised staff role', () => {
    for (const role of STAFF_ROLES) {
      expect(isStaffRole(role)).toBe(true);
    }
  });

  it('rejects regular users, unknown roles and null', () => {
    expect(isStaffRole('user')).toBe(false);
    expect(isStaffRole('superadmin')).toBe(false);
    expect(isStaffRole('')).toBe(false);
    expect(isStaffRole(null)).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });
});

describe('safeNextPath — open-redirect protection', () => {
  it('passes through same-origin paths', () => {
    expect(safeNextPath('/app/watchlist')).toBe('/app/watchlist');
  });

  it('defaults missing values to /app', () => {
    expect(safeNextPath(null)).toBe('/app');
    expect(safeNextPath(undefined)).toBe('/app');
    expect(safeNextPath('  ')).toBe('/app');
  });

  it('rejects protocol-relative redirects', () => {
    expect(safeNextPath('//evil.com')).toBe('/app');
    expect(safeNextPath('///evil.com')).toBe('/app');
  });

  it('rejects absolute URLs and non-path values', () => {
    expect(safeNextPath('https://evil.com')).toBe('/app');
    expect(safeNextPath('javascript:alert(1)')).toBe('/app');
  });
});

/* ---------------------------------------------------------------------------
 * Session guards
 * ------------------------------------------------------------------------- */

describe('getUser', () => {
  it('returns the session user when authenticated', async () => {
    setAuthedUser();
    const user = await getUser();
    expect(user?.id).toBe('user-1');
  });

  it('returns null when signed out', async () => {
    setSignedOut();
    expect(await getUser()).toBeNull();
  });
});

describe('requireAuth', () => {
  it('returns the user when authenticated', async () => {
    setAuthedUser();
    const user = await requireAuth();
    expect(user.id).toBe('user-1');
  });

  it('redirects signed-out users to /login', async () => {
    setSignedOut();
    await expect(requireAuth()).rejects.toMatchObject({ destination: '/login' });
  });
});

describe('getUserProfile', () => {
  it('returns null when signed out (never queries profiles)', async () => {
    setSignedOut();
    expect(await getUserProfile()).toBeNull();
    expect(mockProfileQuery).not.toHaveBeenCalled();
  });

  it('scopes the profile lookup to the session user id', async () => {
    setAuthedUser('user-42');
    setProfile('user');
    await getUserProfile();
    expect(mockProfileQuery).toHaveBeenCalledWith('profiles');
  });
});

/* ---------------------------------------------------------------------------
 * Admin denial for non-staff
 * ------------------------------------------------------------------------- */

describe('requireRoles', () => {
  it('lets a matching staff role through', async () => {
    setAuthedUser();
    setProfile('editor');
    const profile = await requireRoles(['admin', 'editor']);
    expect(profile.role).toBe('editor');
  });

  it('denies regular users', async () => {
    setAuthedUser();
    setProfile('user');
    await expect(requireRoles(['admin'])).rejects.toMatchObject({ destination: '/' });
  });

  it('denies staff whose role is not in the allowed set', async () => {
    setAuthedUser();
    setProfile('researcher');
    await expect(requireRoles(['admin', 'editor'])).rejects.toMatchObject({ destination: '/' });
  });

  it('denies signed-out users', async () => {
    setSignedOut();
    setProfile('admin');
    await expect(requireRoles(['admin'])).rejects.toMatchObject({
      destination: '/login?next=%2Fadmin',
    });
  });

  it('denies when the profile row is missing', async () => {
    setAuthedUser();
    setProfileMissing();
    await expect(requireRoles(['admin'])).rejects.toMatchObject({ destination: '/' });
  });
});

describe('requireRole', () => {
  it('allows the exact role and denies everything else', async () => {
    setAuthedUser();
    setProfile('admin');
    const profile = await requireRole('admin');
    expect(profile.role).toBe('admin');

    setProfile('editor');
    await expect(requireRole('admin')).rejects.toMatchObject({ destination: '/' });
  });
});

describe('hasRole', () => {
  it('reflects the profile role', async () => {
    setAuthedUser();
    setProfile('legal_reviewer');
    expect(await hasRole('legal_reviewer')).toBe(true);
    expect(await hasRole('admin')).toBe(false);
  });

  it('is false when signed out', async () => {
    setSignedOut();
    expect(await hasRole('admin')).toBe(false);
  });
});
