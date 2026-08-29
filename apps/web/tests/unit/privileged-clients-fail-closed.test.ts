import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { getAdminDb } from '@/lib/admin-db';
import { createAdminClient } from '@claimradar/database';

describe('Privileged Clients Fail-Closed Security Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getAdminDb()', () => {
    it('throws error when SUPABASE_SECRET_KEY is missing', () => {
      delete process.env.SUPABASE_SECRET_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dummy_value';

      expect(() => getAdminDb()).toThrow(
        /Missing SUPABASE_SECRET_KEY environment variable — required for admin DB access/i,
      );
    });

    it('does NOT fallback to publishable key when SUPABASE_SECRET_KEY is absent', () => {
      delete process.env.SUPABASE_SECRET_KEY;
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dummy_key_not_secret';

      expect(() => getAdminDb()).toThrow();
    });

    it('instantiates client when SUPABASE_SECRET_KEY and SUPABASE_URL are present', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_SECRET_KEY = 'sb_secret_test_value';

      const client = getAdminDb();
      expect(client).toBeDefined();
    });
  });

  describe('createAdminClient()', () => {
    it('throws error when SUPABASE_SECRET_KEY is missing', () => {
      delete process.env.SUPABASE_SECRET_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dummy_value';

      expect(() => createAdminClient()).toThrow(
        /Missing SUPABASE_SECRET_KEY environment variable — required for admin DB access/i,
      );
    });

    it('does NOT fallback to publishable or anon key when secret key is absent', () => {
      delete process.env.SUPABASE_SECRET_KEY;
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';

      expect(() => createAdminClient()).toThrow();
    });

    it('instantiates admin client when SUPABASE_SECRET_KEY and SUPABASE_URL are present', () => {
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_SECRET_KEY = 'sb_secret_valid_key';

      const client = createAdminClient();
      expect(client).toBeDefined();
    });
  });
});
