import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import * as path from 'node:path';
import { envBoolean, envAppEnv } from '@claimradar/config';

export const crawlerEnvSchema = z.object({
  APP_ENV: envAppEnv,
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  CRAWLER_USER_AGENT: z.string().default('ClaimRadar India Bot/1.0 (+https://claimradar.in)'),
  CRAWLER_CONTACT_EMAIL: z.string().email().optional(),
  AI_PROVIDER: z.enum(['openrouter', 'nvidia', 'none']).default('none'),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.1-70b-instruct'),
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().url().optional(),
  NVIDIA_MODEL: z.string().default('meta/llama-3.1-70b-instruct'),
  AI_DAILY_REQUEST_BUDGET: z.coerce.number().default(40),
  AI_SECOND_PASS_RESERVE: z.coerce.number().default(10),
  AI_MAX_ATTEMPTS_PER_DOCUMENT: z.coerce.number().default(2),
  LIVE_ADAPTERS_ENABLED: envBoolean(false),
  CRAWLER_CONCURRENCY: z.coerce.number().default(3),
  CRAWLER_REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
  AUTO_VERIFY_CLAIMABLES: envBoolean(false),
  ENABLE_BILLING: envBoolean(false),
  /** Staging must never notify real customers. */
  NOTIFY_CUSTOMERS_ENABLED: envBoolean(false),
  /** Optional file path to write the machine-readable crawl summary JSON. */
  CRAWLER_SUMMARY_FILE: z.string().optional(),
  /** Alert sink selection: 'log' (default, structured stderr) or 'none'. */
  ALERT_SINK: z.enum(['log', 'none']).default('log'),
  ALERT_DEDUP_WINDOW_MINUTES: z.coerce.number().default(60),
  SENTRY_DSN: z.string().optional(),
});

export type CrawlerEnv = z.infer<typeof crawlerEnvSchema>;

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const res: Record<string, string> = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    res[t.slice(0, eq).trim()] = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return res;
}

export function loadCrawlerEnv(options?: { dryRun?: boolean }): CrawlerEnv {
  const rootDir = process.cwd();
  const candidates = [rootDir, path.resolve(rootDir, '..'), path.resolve(rootDir, '../..')];
  let localEnv: Record<string, string> = {};
  let stagingEnv: Record<string, string> = {};

  for (const dir of candidates) {
    const localPath = path.resolve(dir, '.env.local');
    const stagingPath = path.resolve(dir, '.env.staging');
    if (Object.keys(localEnv).length === 0 && existsSync(localPath)) {
      localEnv = readEnvFile(localPath);
    }
    if (Object.keys(stagingEnv).length === 0 && existsSync(stagingPath)) {
      stagingEnv = readEnvFile(stagingPath);
    }
  }

  const env = { ...stagingEnv, ...localEnv, ...process.env };
  const isDryRun = options?.dryRun ?? process.argv.includes('--dry-run');

  if (isDryRun) {
    env.SUPABASE_URL = env.SUPABASE_URL || 'https://dryrun.local';
  }
  const resolvedKey =
    env.SUPABASE_SECRET_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    (isDryRun ? 'dummy-dryrun-secret-key' : undefined);

  env.SUPABASE_SECRET_KEY = resolvedKey;
  return crawlerEnvSchema.parse(env);
}
