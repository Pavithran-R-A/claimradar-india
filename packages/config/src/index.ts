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

export const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
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
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
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
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER: z.enum(['openrouter', 'nvidia', 'none']).default('none'),
  AI_DAILY_REQUEST_BUDGET: z.coerce.number().default(40),
  AI_SECOND_PASS_RESERVE: z.coerce.number().default(10),
  LIVE_ADAPTERS_ENABLED: z.coerce.boolean().default(false),
  CRAWLER_CONCURRENCY: z.coerce.number().default(3),
});

export type CrawlerEnvConfig = z.infer<typeof crawlerEnvSchema>;
