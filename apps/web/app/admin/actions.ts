'use server';

import { getAdminDb } from '@/lib/admin-db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleSource(sourceId: string) {
  await requireRole('admin');
  const supabase = getAdminDb();

  const { data: source } = await supabase
    .from('sources')
    .select('enabled')
    .eq('id', sourceId)
    .single();

  if (!source) return { error: 'Source not found' };

  const { error } = await supabase
    .from('sources')
    .update({ enabled: !source.enabled })
    .eq('id', sourceId);

  if (error) return { error: error.message };

  revalidatePath('/admin/sources');
  return { success: true };
}

export async function triggerCrawl() {
  await requireRole('admin');
  return { message: 'Crawler must be triggered via CLI: pnpm crawler:daily' };
}

export async function retryDeferred() {
  await requireRole('admin');
  return { message: 'Retry must be triggered via CLI: pnpm crawler:retry-queued' };
}
