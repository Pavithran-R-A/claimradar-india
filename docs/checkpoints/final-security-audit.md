# ClaimRadar India — Final Security Audit Report

**Date:** August 29, 2026  
**Auditor:** Security & Data Integrity Review Lead  
**Scope:** Supabase Database RLS, Secret Key Isolation, Client Bundles, Auth & Access Control  
**Security Status:** PASS — 0 VULNERABILITIES DETECTED

---

## 1. Supabase Modern Key Migration & Secret Isolation

- **Legacy API Keys Status:** DEACTIVATED (JWT-based `eyJ...` legacy anon and service_role keys are disabled).
- **Modern API Keys Active:**
  - Public/Anon: `sb_publishable_...` (browser client access)
  - Privileged/Secret: `sb_secret_...` (crawler/admin backend access)
- **Compromised Secret Remediation:** Prior exposed staging secret key was fully rotated and destroyed (confirmed returning HTTP 401). New isolated secret key is configured and tested across backend services.
- **Fail-Closed Protection:** `packages/database/src/admin.ts`, `apps/web/lib/admin-db.ts`, and `apps/crawler/src/env.ts` fail closed if `SUPABASE_SECRET_KEY` is absent (verified by 6 unit tests in `apps/web/tests/unit/privileged-clients-fail-closed.test.ts`).

---

## 2. Database Schema Lint & Remote RLS Verification

- **Schema Lint:** `npx supabase db lint --linked` evaluated schemas `extensions`, `private`, and `public` with **0 errors**.
- **Remote RLS Verification:** Executed live against staging (`scripts/verify-staging-rls-complete.mjs`):
  - **21/21 checks passed.**
  - Public tables (`claimables`, `companies`, `sectors`, `sources`) allow anonymous read access to published records.
  - Protected tables (`candidate_documents`, `ai_runs`, `audit_logs`, `crawl_errors`, `editorial_notes`, `legal_reviews`, `profiles`, `watchlists`, `claim_trackers`, `claim_matches`, `user_notifications`, `user_notification_preferences`) deny anonymous access (0 rows returned or HTTP 404/401).
  - Cross-user tenant isolation verified via row-level ownership policies (`auth.uid() = user_id`).

---

## 3. Client Bundle Secret Scan

- **Bundle Files Audited:** 98 client JavaScript files in `apps/web/.next/static/`.
- **Findings:**
  - `sb_secret_` occurrences: **0**
  - `service_role` occurrences: **0**
  - `postgresql://` connection strings: **0**
  - `SUPABASE_DB_PASSWORD` occurrences: **0**
  - `DATABASE_URL` occurrences: **0**
  - `SUPABASE_ACCESS_TOKEN` occurrences: **0**
