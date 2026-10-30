import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('customer support and notification launch contracts', () => {
  it('exposes real authenticated privacy intake without inventing an email address', () => {
    for (const path of [
      '../../app/(public)/contact/page.tsx',
      '../../app/(public)/corrections/page.tsx',
    ]) {
      const content = source(path);
      expect(content).toContain('href="/app/privacy"');
      expect(content).not.toContain('will be published prior to unrestricted public launch');
    }
    const actions = source('../../app/app/privacy-actions.ts');
    expect(actions).toContain(".from('user_correction_requests').insert");
    expect(actions).toContain(".from('grievance_contacts').insert");
    expect(actions).toContain('if (error) return { ok: false, error: DB_UNAVAILABLE }');
  });

  it('restricts raw grievance access and processing to administrators', () => {
    const page = source('../../app/admin/customer-requests/page.tsx');
    const actions = source('../../app/admin/customer-requests/actions.ts');
    const roles = source('../../app/admin/_lib/roles.ts');
    expect(page).toContain('await requireRoles(ADMINS_ONLY)');
    expect(actions).toContain('await getActionActor(ADMINS_ONLY)');
    expect(actions).toContain('z.string().uuid().safeParse(id)');
    expect(actions).toContain('const audit = await writeAuditLog(');
    expect(roles).toContain("label: 'Customer Requests', roles: ADMINS_ONLY");
    expect(actions).not.toContain('sendEmail(');
    expect(actions).not.toContain('sendNotification(');
  });

  it('never promises automated matching alerts while delivery is disabled', () => {
    const pages = [
      '../../app/(public)/how-it-works/page.tsx',
      '../../components/landing/account-cta.tsx',
      '../../app/app/notifications/page.tsx',
      '../../app/app/settings/page.tsx',
    ];
    for (const path of pages) {
      expect(source(path)).toMatch(/automatic|Automatic/);
    }
    expect(source('../../components/landing/account-cta.tsx')).not.toContain(
      'We send notifications as soon as',
    );
  });
});
