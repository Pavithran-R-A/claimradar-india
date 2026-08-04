import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface Profile {
  id: string;
  email: string;
  role: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current authenticated user on the server.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current user's profile from the profiles table.
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return data as Profile | null;
}

/**
 * Check if the current user has a specific role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const profile = await getUserProfile();
  if (!profile) return false;
  return profile.role === role;
}

/**
 * Require authentication — redirect to login if not authenticated.
 * Returns the user if authenticated.
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Require a specific role — redirect to home if unauthorized.
 * Returns the profile if authorized.
 */
export async function requireRole(role: string): Promise<Profile> {
  const profile = await getUserProfile();
  if (!profile || profile.role !== role) {
    redirect('/');
  }
  return profile;
}
