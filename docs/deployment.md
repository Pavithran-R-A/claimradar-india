# Deployment Guide

This guide matches the current repository contracts.

## Infrastructure

| Component       | Platform                  | Tier       |
| --------------- | ------------------------- | ---------- |
| Web (Next.js)   | Vercel                    | Pro        |
| Database + Auth | Supabase                  | Free → Pro |
| Crawler         | Railway / Fly.io          | Starter    |
| Repository + CI | GitHub + GitHub Actions   | Free       |
| Monitoring      | Vercel Analytics + Sentry | Free tiers |

## Environment Setup

### Required Environment Variables

Declared in `.env.example` (keys only, no values):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=              # server-only

# App
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# AI Extraction
AI_PROVIDER_API_KEY=
AI_MODEL_ID=

# Sentry
SENTRY_DSN=
```

### Local Development

```bash
pnpm install
cp .env.example .env.local
# Fill in real values in .env.local (never committed)
pnpm --filter @claimradar/database migrate
pnpm dev
```

## Vercel Deployment (Web)

- Connect GitHub repo; Vercel auto-detects Next.js.
- Set environment variables in Vercel dashboard (production, preview, development).
- `SUPABASE_SECRET_KEY` scoped to server functions only.
- Custom domain configured with DNS A/CNAME records.
- ISR revalidation via Vercel's `revalidatePath` / `revalidateTag`.

## Supabase Setup

- Create project (Free tier to start).
- Run migrations: `pnpm --filter @claimradar/database migrate`.
- Enable RLS on all user tables (handled by migrations).
- Configure Auth: email + magic link; custom SMTP for production.
- Storage bucket for raw documents (private, service-role access).

## Crawler Deployment

- Dockerfile in `apps/crawler/Dockerfile`.
- Deploy to Railway or Fly.io with cron trigger (daily at 06:00 IST).
- Environment variables: `SUPABASE_SECRET_KEY`, `AI_PROVIDER_API_KEY`.
- Health-check endpoint at `/health`.

## GitHub Actions CI

- Triggers on every PR and push to `main`.
- Steps: `pnpm install` → `format` → `lint` → `build` → `typecheck` → `test`.
- PR merges blocked until all checks pass.
- Preview deployments via Vercel bot comments.

## Rollback Procedure

- Vercel: one-click rollback to previous deployment.
- Database: reverse migration via `pnpm --filter @claimradar/database migrate-down`.
- Always test rollback in preview before applying to production.
