import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../../../../supabase/migrations/20261030110000_admin_only_customer_request_rls.sql', import.meta.url),
  'utf8',
);

describe('sensitive customer request policy scope', () => {
  it('restricts correction and grievance triage policies to admins', () => {
    for (const name of [
      'ucrq_select_staff',
      'ucrq_manage_staff',
      'gc_select_staff',
      'gc_manage_staff',
    ]) {
      expect(migration).toContain(`CREATE POLICY ${name}`);
    }
    expect(migration.match(/USING \(private\.is_admin\(\)\)/g)).toHaveLength(4);
    expect(migration.match(/WITH CHECK \(private\.is_admin\(\)\)/g)).toHaveLength(2);
    expect(migration).not.toMatch(/USING \(private\.is_staff\(\)\)/);
  });

  it('does not remove customer-owned policies or modify records', () => {
    expect(migration).not.toMatch(/DROP POLICY.*(?:insert_own|select_own)/i);
    expect(migration).not.toMatch(/\b(?:UPDATE|DELETE FROM|TRUNCATE|INSERT INTO)\b/i);
  });
});
