import { z } from 'zod';

const getEnv = (key: string): string | null => {
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  ) {
    return (
      (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[
        key
      ] || null
    );
  }
  return null;
};

export const contactConfig = {
  supportEmail: getEnv('NEXT_PUBLIC_SUPPORT_EMAIL'),
  correctionsEmail: getEnv('NEXT_PUBLIC_CORRECTIONS_EMAIL'),
  grievanceEmail: getEnv('NEXT_PUBLIC_GRIEVANCE_EMAIL'),
  pressEmail: getEnv('NEXT_PUBLIC_PRESS_EMAIL'),
  stagingNotice:
    'Direct email support is not currently offered; claim-specific questions should go to the official authority linked from the relevant opportunity.',
} as const;

const siteUrl = getEnv('NEXT_PUBLIC_SITE_URL') ?? 'https://claimradar-staging.vercel.app';

export const brandConfig = {
  /**
   * ClaimKhoj public identity. Keep this object as the single source of
   * visible brand naming and canonical origin across application surfaces.
   */
  siteName: 'ClaimKhoj',
  shortName: 'ClaimKhoj',
  descriptor: 'Find what you can claim',
  tagline: "Find refunds, benefits & claims you're entitled to.",
  isProvisional: true,
  description: 'Discover refunds, benefits, and claims you may be entitled to in India',
  url: siteUrl,
  supportEmail: contactConfig.supportEmail,
} as const;

export interface FeatureFlags {
  ENABLE_BILLING: boolean;
  AUTO_VERIFY_CLAIMABLES: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  ENABLE_BILLING: false,
  AUTO_VERIFY_CLAIMABLES: false,
};

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
  infoBackground: 'rgba(93,183,255,0.12)',
} as const;
