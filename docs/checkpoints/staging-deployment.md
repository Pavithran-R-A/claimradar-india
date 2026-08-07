# ClaimRadar India — Staging Deployment & Remote RLS Checkpoint Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Project Ref:** `upvsfqufkywlpibbwrse`  
**Status:** DISPOSABLE STAGING DEPLOYED & VERIFIED

---

## 1. Executive Summary

The disposable staging Supabase project has been linked, remote database schema migrations (001 through 011) have been pushed and verified, remote RLS policies have been confirmed operational, and `staging-preflight` checks passed with zero failures.

---

## 2. Remote Database & Migration Verification

- **Staging URL:** `https://upvsfqufkywlpibbwrse.supabase.co`
- **Region:** `ap-northeast-1`
- **Dry-Run Target Verification:** Confirmed empty target project before migration execution (`dryRun: true`, 11 pending migrations).
- **Migration Push Execution:** Executed `npx supabase db push` via pooler database connection.
- **Applied Migrations (001–011):**
  1. `001_initial_schema.sql`
  2. `002_ingestion_tables.sql`
  3. `003_user_tables.sql`
  4. `004_billing_tables.sql`
  5. `005_editorial_tables.sql`
  6. `006_rls_policies.sql`
  7. `007_profile_trigger.sql`
  8. `008_security_fixes.sql`
  9. `009_freshness_and_deduplication.sql`
  10. `010_user_product.sql`
  11. `011_notifications.sql`
- **Post-Migration Parity:** `npx supabase db push --dry-run` returns `{"upToDate":true,"dryRun":true,"migrations":[]}`.

---

## 3. Remote RLS Spot Checks

- **Admin Table Exposure Test:** Anonymous / publishable key requests to `/rest/v1/audit_log`, `/rest/v1/ai_runs`, and `/rest/v1/crawl_errors` were probed over HTTPS.
- **Result:** Anon key returned zero rows (`[]` / `404`) across all probed admin tables. RLS spot check: **PASS** (3/3 admin tables denied).

---

## 4. Staging Preflight Status

Executing `node --env-file=.env.staging scripts/staging-preflight.mjs`:

```text
Policy guards:
✅ [PASS] APP_ENV staging guard — APP_ENV=staging
✅ [PASS] AUTO_VERIFY_CLAIMABLES=false guard — AUTO_VERIFY_CLAIMABLES='false'
✅ [PASS] ENABLE_BILLING=false guard — ENABLE_BILLING='false'
✅ [PASS] NOTIFY_CUSTOMERS_ENABLED=false guard — NOTIFY_CUSTOMERS_ENABLED='false'

Credential resolution & Connectivity:
✅ [PASS] SUPABASE_URL present — https://upvsfqufkywlpibbwrse.supabase.co
✅ [PASS] SUPABASE_ANON_KEY present — via SUPABASE_ANON_KEY
✅ [PASS] Connectivity (REST API) — responded cleanly

Migration list parity:
✅ [PASS] Migration list parity — 11 local migrations all applied on staging

RLS spot checks:
✅ [PASS] RLS spot check (anon denied on admin tables) — anon key denied on 3/3 admin tables

Summary: PASS: 9 | FAIL: 0 | SKIP_CREDENTIALS: 2
```

---

## 5. Security & Safety Compliance

- Secret values, database passwords, and API keys are stored exclusively in the gitignored `.env.staging` file (`.gitignore` updated and verified). No credentials or tokens exist in Git history.
- Mandatory safety flags active:
  - `AUTO_VERIFY_CLAIMABLES=false`
  - `ENABLE_BILLING=false`
  - `NEXT_PUBLIC_ENABLE_BILLING=false`
