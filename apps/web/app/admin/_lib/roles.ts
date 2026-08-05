import type { Profile, StaffRole } from '@/lib/auth';
import { getUserProfile, isStaffRole } from '@/lib/auth';

/**
 * Admin panel role matrix.
 *
 * - researcher: view candidates and sources (read-only triage)
 * - editor: claim editing, review assignments, publication approval
 * - legal_reviewer: legal reviews and takedown handling
 * - admin: everything, including users, roles, audit and settings
 *
 * Pages enforce this matrix server-side via `requireRoles`; server actions
 * enforce it via `getActionActor`. Keep both in sync when editing.
 */

export const ALL_STAFF: readonly StaffRole[] = ['admin', 'editor', 'legal_reviewer', 'researcher'];
export const EDITORIAL: readonly StaffRole[] = ['admin', 'editor'];
export const LEGAL: readonly StaffRole[] = ['admin', 'legal_reviewer'];
export const EDITORIAL_AND_LEGAL: readonly StaffRole[] = ['admin', 'editor', 'legal_reviewer'];
export const ADMINS_ONLY: readonly StaffRole[] = ['admin'];

export interface AdminNavGroup {
  heading: string;
  items: { href: string; label: string; roles: readonly StaffRole[] }[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    heading: 'Content',
    items: [
      { href: '/admin/candidates', label: 'Candidates', roles: ALL_STAFF },
      { href: '/admin/claimables', label: 'Claimables', roles: ALL_STAFF },
      { href: '/admin/companies', label: 'Companies', roles: ALL_STAFF },
      { href: '/admin/reviews', label: 'Review Queue', roles: EDITORIAL_AND_LEGAL },
      { href: '/admin/corrections', label: 'Corrections', roles: EDITORIAL_AND_LEGAL },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/admin/sources', label: 'Sources', roles: ALL_STAFF },
      { href: '/admin/crawl-runs', label: 'Crawl Runs', roles: ALL_STAFF },
      { href: '/admin/ai-runs', label: 'AI Runs', roles: ALL_STAFF },
      { href: '/admin/alerts', label: 'Alerts', roles: ALL_STAFF },
    ],
  },
  {
    heading: 'System',
    items: [
      { href: '/admin/users', label: 'Users & Roles', roles: ADMINS_ONLY },
      { href: '/admin/audit', label: 'Audit Log', roles: ADMINS_ONLY },
      { href: '/admin/settings', label: 'Settings', roles: ADMINS_ONLY },
    ],
  },
];

/**
 * Authorization check for server actions. Returns the acting profile when the
 * current user holds one of the allowed roles, otherwise null. Server actions
 * must return an error result (never `redirect`) so forms degrade gracefully.
 */
export async function getActionActor(roles: readonly StaffRole[]): Promise<Profile | null> {
  const profile = await getUserProfile();
  if (!profile || !isStaffRole(profile.role) || !roles.includes(profile.role)) {
    return null;
  }
  return profile;
}

export function unauthorized(): { error: string } {
  return { error: 'You do not have permission to perform this action.' };
}
