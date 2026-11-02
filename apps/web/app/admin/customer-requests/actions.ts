'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from '@/lib/admin-db';
import { ADMINS_ONLY, getActionActor } from '../_lib/roles';

export interface CustomerRequestActionState {
  kind: 'idle' | 'success' | 'error';
  message: string;
}

const allowedStatuses = {
  correction: ['new', 'in_review', 'resolved', 'declined'],
  grievance: ['new', 'acknowledged', 'resolved'],
} as const;

/** Staff triage is transactional and sends no outbound messages. */
export async function updateCustomerRequest(
  kind: 'correction' | 'grievance',
  id: string,
  _state: CustomerRequestActionState,
  formData: FormData,
): Promise<CustomerRequestActionState> {
  const actor = await getActionActor(ADMINS_ONLY);
  if (!actor) return { kind: 'error', message: 'Unauthorized.' };
  if (!z.string().uuid().safeParse(id).success) {
    return { kind: 'error', message: 'Invalid request identifier.' };
  }

  const status = z
    .string()
    .refine((value) => (allowedStatuses[kind] as readonly string[]).includes(value))
    .safeParse(formData.get('status'));
  const resolution = z.string().trim().min(3).max(2000).safeParse(formData.get('resolution'));
  if (!status.success || !resolution.success) {
    return { kind: 'error', message: 'Enter a valid status and resolution note.' };
  }

  try {
    const { data, error } = await getAdminDb().rpc('triage_customer_request', {
      p_request_kind: kind,
      p_request_id: id,
      p_status: status.data,
      p_resolution: resolution.data,
      p_actor_id: actor.id,
    });
    if (error) throw error;
    const result = data as { success?: boolean; error?: string } | null;
    if (!result?.success) {
      return { kind: 'error', message: result?.error ?? 'The request was not saved.' };
    }
  } catch {
    return { kind: 'error', message: 'Could not save this request. No changes were committed.' };
  }

  revalidatePath('/admin/customer-requests');
  revalidatePath('/app/privacy');
  return { kind: 'success', message: 'Request saved.' };
}
