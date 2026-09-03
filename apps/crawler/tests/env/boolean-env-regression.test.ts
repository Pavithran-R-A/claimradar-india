import { describe, it, expect } from 'vitest';
import { envBoolean, envAppEnv, crawlerEnvSchema as configCrawlerSchema } from '@claimradar/config';
import { crawlerEnvSchema } from '../../src/env.js';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Phase 1 & 2: Environment Boolean Parser & Regression Tests', () => {
  const schema = z.object({
    APP_ENV: envAppEnv,
    AUTO_VERIFY_CLAIMABLES: envBoolean(false),
    ENABLE_BILLING: envBoolean(false),
    NOTIFY_CUSTOMERS_ENABLED: envBoolean(false),
    LIVE_ADAPTERS_ENABLED: envBoolean(false),
  });

  describe('Strict Boolean String Resolution', () => {
    it('parses "false" string to boolean false for all policy guards', () => {
      const parsed = schema.parse({
        AUTO_VERIFY_CLAIMABLES: 'false',
        ENABLE_BILLING: 'false',
        NOTIFY_CUSTOMERS_ENABLED: 'false',
        LIVE_ADAPTERS_ENABLED: 'false',
      });

      expect(parsed.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsed.ENABLE_BILLING).toBe(false);
      expect(parsed.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsed.LIVE_ADAPTERS_ENABLED).toBe(false);
    });

    it('parses "true" string to boolean true for all policy guards', () => {
      const parsed = schema.parse({
        AUTO_VERIFY_CLAIMABLES: 'true',
        ENABLE_BILLING: 'true',
        NOTIFY_CUSTOMERS_ENABLED: 'true',
        LIVE_ADAPTERS_ENABLED: 'true',
      });

      expect(parsed.AUTO_VERIFY_CLAIMABLES).toBe(true);
      expect(parsed.ENABLE_BILLING).toBe(true);
      expect(parsed.NOTIFY_CUSTOMERS_ENABLED).toBe(true);
      expect(parsed.LIVE_ADAPTERS_ENABLED).toBe(true);
    });

    it('handles boolean primitives true and false directly', () => {
      const parsed = schema.parse({
        AUTO_VERIFY_CLAIMABLES: false,
        ENABLE_BILLING: false,
        NOTIFY_CUSTOMERS_ENABLED: false,
        LIVE_ADAPTERS_ENABLED: true,
      });

      expect(parsed.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsed.ENABLE_BILLING).toBe(false);
      expect(parsed.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsed.LIVE_ADAPTERS_ENABLED).toBe(true);
    });

    it('trims whitespace and handles case-insensitivity ("  FALSE  ", " True ")', () => {
      const parsed = schema.parse({
        AUTO_VERIFY_CLAIMABLES: '  FALSE  ',
        ENABLE_BILLING: '  false  ',
        NOTIFY_CUSTOMERS_ENABLED: '  False  ',
        LIVE_ADAPTERS_ENABLED: '  TRUE  ',
      });

      expect(parsed.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsed.ENABLE_BILLING).toBe(false);
      expect(parsed.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsed.LIVE_ADAPTERS_ENABLED).toBe(true);
    });

    it('defaults undefined or empty values to false', () => {
      const parsed = schema.parse({});

      expect(parsed.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsed.ENABLE_BILLING).toBe(false);
      expect(parsed.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsed.LIVE_ADAPTERS_ENABLED).toBe(false);
    });
  });

  describe('Malformed Input Fail-Closed Protection', () => {
    it('fails on "0" and "1" rather than silently coercing', () => {
      expect(() => schema.parse({ AUTO_VERIFY_CLAIMABLES: '0' })).toThrow();
      expect(() => schema.parse({ AUTO_VERIFY_CLAIMABLES: '1' })).toThrow();
    });

    it('fails on "yes", "no", and arbitrary strings', () => {
      expect(() => schema.parse({ ENABLE_BILLING: 'yes' })).toThrow();
      expect(() => schema.parse({ ENABLE_BILLING: 'no' })).toThrow();
      expect(() => schema.parse({ NOTIFY_CUSTOMERS_ENABLED: 'enabled' })).toThrow();
      expect(() => schema.parse({ LIVE_ADAPTERS_ENABLED: 'random_string' })).toThrow();
    });
  });

  describe('Exact GitHub Actions Staging Environment Recreation', () => {
    it('faithfully resolves GitHub Actions staging workflow environment variables', () => {
      const ghActionsStagingEnv = {
        APP_ENV: 'staging',
        SUPABASE_URL: 'https://qsshiksnyflwsybjyzob.supabase.co',
        SUPABASE_SECRET_KEY: 'sb_secret_dummy_test_value',
        AUTO_VERIFY_CLAIMABLES: 'false',
        ENABLE_BILLING: 'false',
        NOTIFY_CUSTOMERS_ENABLED: 'false',
        LIVE_ADAPTERS_ENABLED: 'true',
      };

      const parsedCrawler = crawlerEnvSchema.parse(ghActionsStagingEnv);
      const parsedConfig = configCrawlerSchema.parse(ghActionsStagingEnv);

      // Phase 2: Runtime must match expected booleans
      expect(parsedCrawler.APP_ENV).toBe('staging');
      expect(parsedCrawler.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsedCrawler.ENABLE_BILLING).toBe(false);
      expect(parsedCrawler.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsedCrawler.LIVE_ADAPTERS_ENABLED).toBe(true);

      // Phase 3: Preflight / Config schema parity
      expect(parsedConfig.APP_ENV).toBe('staging');
      expect(parsedConfig.AUTO_VERIFY_CLAIMABLES).toBe(false);
      expect(parsedConfig.ENABLE_BILLING).toBe(false);
      expect(parsedConfig.NOTIFY_CUSTOMERS_ENABLED).toBe(false);
      expect(parsedConfig.LIVE_ADAPTERS_ENABLED).toBe(true);

      // Preflight guards == Pipeline runtime guards
      expect(parsedConfig.AUTO_VERIFY_CLAIMABLES).toEqual(parsedCrawler.AUTO_VERIFY_CLAIMABLES);
      expect(parsedConfig.ENABLE_BILLING).toEqual(parsedCrawler.ENABLE_BILLING);
      expect(parsedConfig.NOTIFY_CUSTOMERS_ENABLED).toEqual(parsedCrawler.NOTIFY_CUSTOMERS_ENABLED);
      expect(parsedConfig.LIVE_ADAPTERS_ENABLED).toEqual(parsedCrawler.LIVE_ADAPTERS_ENABLED);
    });

    it('normalizes the boolean dispatch input before the shell comparison', () => {
      const workflow = readFileSync(
        path.resolve(__dirname, '../../../..', '.github/workflows/daily-crawl.yml'),
        'utf8',
      );

      expect(workflow).toContain("DRY_RUN: ${{ inputs.dry_run == true && 'true' || 'false' }}");
    });
  });
});
