import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    /**
     * Deployment tier. Real customer email only leaves in 'production'
     * (see lib/notifications). Search crawlability is additionally guarded
     * by Vercel's deployment environment in app/robots.ts so previews stay blocked.
     */
    APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
    DATABASE_URL: z.string().url().optional(),
    INDEXNOW_KEY: z
      .string()
      .regex(/^[A-Fa-f0-9]{8,128}$/)
      .optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SITE_NAME: z.string().min(1),
    NEXT_PUBLIC_ENABLE_BILLING: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    INDEXNOW_KEY: process.env.INDEXNOW_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_ENABLE_BILLING: process.env.NEXT_PUBLIC_ENABLE_BILLING,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
