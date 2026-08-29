import { z } from 'zod';

export const brandConfig = {
  siteName: 'ClaimRadar India',
  description: 'Discover and track claimable opportunities in India',
  url: 'https://claimradar.in',
  supportEmail: 'support@claimradar.in',
} as const;

export interface FeatureFlags {
  ENABLE_BILLING: boolean;
  AUTO_VERIFY_CLAIMABLES: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  ENABLE_BILLING: false,
  AUTO_VERIFY_CLAIMABLES: false,
};

/**
 * Reusable environment boolean parser.
 *
 * Replaces broken `z.coerce.boolean()` which turns `"false"` into `true`.
 *
 * Rules:
 * - "true"  (case-insensitive, trimmed) -> true
 * - "false" (case-insensitive, trimmed) -> false
 * - true    -> true
 * - false   -> false
 * - undefined / null / "" -> defaultValue
 * - malformed strings ("0", "1", "yes", "no", "abc") -> fail closed with Zod validation error
 */
export const envBoolean = (defaultValue = false) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return value;
  }, z.boolean());

export const envAppEnv = z
  .enum(['development', 'staging', 'production', 'test'])
  .default('development');

export const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
});

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_ENABLE_BILLING: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const colors = {
  background: '#070B14',
  backgroundElevated: '#0B1120',
  surface: '#101827',
  surfaceStrong: '#151F32',
  border: 'rgba(255,255,255,0.09)',
  textPrimary: '#F7F8FB',
  textSecondary: '#A7B0C0',
  textMuted: '#778197',
  trustPrimary: '#7387FF',
  trustPrimaryHover: '#8798FF',
  success: '#28C6A2',
  deadline: '#F4A340',
  danger: '#FF6B72',
  info: '#5DB7FF',
  verifiedBackground: 'rgba(40,198,162,0.12)',
  deadlineBackground: 'rgba(244,163,64,0.12)',
} as const;

export const crawlerEnvSchema = z.object({
  APP_ENV: envAppEnv,
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openrouter', 'nvidia', 'none']).default('none'),
  AI_DAILY_REQUEST_BUDGET: z.coerce.number().default(40),
  AI_SECOND_PASS_RESERVE: z.coerce.number().default(10),
  LIVE_ADAPTERS_ENABLED: envBoolean(false),
  AUTO_VERIFY_CLAIMABLES: envBoolean(false),
  ENABLE_BILLING: envBoolean(false),
  NOTIFY_CUSTOMERS_ENABLED: envBoolean(false),
  CRAWLER_CONCURRENCY: z.coerce.number().default(3),
});

export type CrawlerEnvConfig = z.infer<typeof crawlerEnvSchema>;
