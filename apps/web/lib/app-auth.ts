/**
 * Auth guard for the authenticated product area.
 *
 * Builds on lib/auth.ts (read-only dependency) and adds return-path support:
 * unauthenticated users are redirected to /login?next=<current path> so they
 * land back where they were after signing in.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getUser } from '@/lib/auth';

/** Current request pathname, propagated by middleware via x-pathname header. */
export async function getCurrentPath(): Promise<string> {
  const headerStore = await headers();
  const path = headerStore.get('x-pathname');
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    return path;
  }
  return '/app';
}

/**
 * Require authentication for the product area. Redirects to /login with the
 * current path as the `next` return target when signed out.
 */
export async function requireAppAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    const currentPath = await getCurrentPath();
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return user;
}

/** Validate and normalise a `next` redirect target (open-redirect safe). */
export function safeNextPath(candidate: string | null | undefined): string {
  if (!candidate) return '/app';
  const trimmed = candidate.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/app';
  return trimmed;
}
