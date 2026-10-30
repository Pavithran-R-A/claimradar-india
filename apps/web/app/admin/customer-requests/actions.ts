'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from '@/lib/admin-db';
import { writeAuditLog } from '../_lib/audit';
import { ADMINS_ONLY, getActionActor } from '../_lib/roles';

/** Restricted staff triage; never sends email, SMS or app notifications. */
export async function updateCustomerRequest(
  kind: 'correction' | 'grievance',
  id: string,
  formData: FormData,
): Promise<void> {
  const actor = await getActionActor(ADMINS_ONLY);
  if (!actor || !z.string().uuid().safeParse(id).success) return;
  const allowed =
    kind === 'correction'
      ? ['new', 'in_review', 'resolved', 'declined']
      : ['new', 'acknowledged', 'resolved'];
  const status = z
    .string()
    .refine((value) => allowed.includes(value))
    .safeParse(formData.get('status'));
  const note = z.string().trim().min(3).max(2000).safeParse(formData.get('resolution'));
  if (!status.success || !note.success) return;

  const table = kind === 'correction' ? 'user_correction_requests' : 'grievance_contacts';
  const db = getAdminDb();
  const { data: previous, error: readError } = await db
    .from(table)
    .select('id, status')
    .eq('id', id)
    .single();
  if (readError || !previous) return;
  const { data: updated, error: writeError } = await db
    .from(table)
    .update({ status: status.data, resolution: note.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', previous.status)
    .select('id')
    .maybeSingle();
  if (writeError || !updated) return;

  const audit = await writeAuditLog({
    actorId: actor.id,
    action: `customer_request.${kind}.triaged`,
    entityType: table,
    entityId: id,
    before: { status: previous.status },
    after: { status: status.data },
  });
  if (audit.error)
    throw new Error('Request saved but audit logging failed; escalate to administrator.');
  revalidatePath('/admin/customer-requests');
  revalidatePath('/app/privacy');
}
