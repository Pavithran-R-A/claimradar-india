# ClaimRadar India — Staging Secret Isolation Verification

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS

---

## 1. Environment File Git Ignore Verification

Executing `git check-ignore`:

- `.env.staging` → **IGNORED**
- `.env.staging.local` → **IGNORED**

No staging secrets or environment files are tracked by Git.

---

## 2. Tracked Files Audit

Inspected all committed files and working directory state:

- No hardcoded API keys, database passwords, tokens, or service-role keys in any committed file or commit history.
- All database connections use environment variables (`DATABASE_URL`, `SUPABASE_DB_PASSWORD`).
- CLI operations receive connection parameters strictly via environment variables or `--env-file=.env.staging`, ensuring zero secrets leak into command-line argument logs or shell history.

---

## 3. Client / Browser Bundle Secret Boundary Audit

Audited `apps/web/env.ts` and `packages/database/src/client.ts`:

### Exposed Client Environment Variables (Browser Safe):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_ENABLE_BILLING` (defaults to `false`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Server-Only Environment Variables (Never Bundled to Browser):

- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY`
- `SUPABASE_DB_PASSWORD`
- `DATABASE_URL`
- `SUPABASE_ACCESS_TOKEN`

The client-side bundle imports only browser-safe public variables.
