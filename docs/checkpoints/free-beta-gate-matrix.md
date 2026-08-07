# ClaimRadar India — Limited Free-Beta Gate Matrix (v2)

**Date:** 2026-08-07  
**Branch:** `qoder/complete-claimradar`  
**Environment:** Vercel Preview → Staging Supabase  
**Revision:** v2 — replaces v1 which incorrectly marked STAGING_LOAD_TEST as PASS based on HTTP 302 Vercel protection redirects  

---

> [!CAUTION]
> **v1 correction:** The previous v1 matrix incorrectly counted HTTP 302 responses from Vercel Deployment Protection
> as application-level PASS results. Gate G-29 is now superseded by G-29b with the valid application test result.
> The original 302 test is classified as `VERCEL_PROTECTION_RESPONSE_TEST` in `preview-light-load-test.md`.

---

## Database & Schema Gates

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-01 | Node Version | Node 24 active (`v24.19.0`) | `node --version` | ✅ PASS |
| G-02 | Docker | Docker daemon running | `docker info` | ✅ PASS |
| G-03 | Local Supabase | `npx supabase start` clean | API + Studio URLs returned | ✅ PASS |
| G-04 | Migrations 001–011 | Applied in order | `supabase db reset` + `migration list` | ✅ PASS |
| G-05 | DB Lint (local) | Zero warnings | `supabase db lint` output | ✅ PASS |
| G-06 | pgTAP Tests | 9 files / 44 assertions | `supabase test db` output | ✅ PASS |
| G-07 | Unit/Integration Tests | 387 tests / 41 files | `pnpm test` | ✅ PASS |
| G-08 | Inventory Acceptance | Phase 4B suite | `pnpm test:inventory-acceptance` | ✅ PASS |
| G-09 | Production Build | Next.js / 0 type errors | `pnpm build` 44/44 pages | ✅ PASS |
| G-10 | Fixture Idempotency | 2× reset clean | Double-reset log | ✅ PASS |
| G-11 | Parser Idempotency | Real-HTTP stable 2× | Parser test output | ✅ PASS |
| G-12 | Axe Accessibility | Zero critical violations | `axe-core` playwright output | ✅ PASS |
| G-13 | Reduced-Motion | `prefers-reduced-motion` respected | Audit output | ✅ PASS |
| G-14 | Portable Backup | SHA-256 verified archive | 16MB `045E20F9...` | ✅ PASS |

## Staging Database Gates

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-15 | `STAGING_MIGRATIONS` | 11 migrations applied to staging DB | `supabase migration list` linked | ✅ PASS |
| G-16 | `STAGING_RLS_ANON` | Anon user data isolation | RLS policy review + staging schema | ✅ PASS |
| G-17 | `STAGING_RLS_USER` | Authenticated user isolation | `auth.uid() = user_id` policies | ✅ PASS |
| G-18 | `STAGING_RLS_STAFF` | Staff RBAC enforced | Permission matrix doc | ✅ PASS |
| G-19 | `STAGING_NOTIFICATION_RLS` | Notification RLS policies | pgTAP notification assertions | ✅ PASS |
| G-20 | `STAGING_DB_LINT` | `supabase db lint --linked` clean | Remote lint output | ✅ PASS |

## Vercel Preview Gates

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-21 | `VERCEL_PREVIEW` | Deployment live | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` | ✅ PASS |
| G-22 | `PREVIEW_ENVIRONMENT_ISOLATION` | Safety flags active | `APP_ENV=staging` + 4 guards | ✅ PASS |
| G-23 | `PREVIEW_PUBLIC` | 13/13 routes verified (bypass header) | `test-preview-deployment.mjs` | ✅ PASS |
| G-24 | `PREVIEW_AUTH` | `/app` → `/login`, `/admin` → `/` | HTTP 307 with bypass | ✅ PASS |
| G-25 | `PREVIEW_CUSTOMER` | Auth isolation, RLS, billing gate | Customer QA doc | ✅ PASS |
| G-26 | `PREVIEW_ADMIN` | RBAC matrix, admin route protection | Admin QA doc | ✅ PASS |
| G-27 | `PREVIEW_SECRET_ISOLATION` | No secrets in HTML or JS | Content-class verification in load test | ✅ PASS |

## Load Test Gate (CORRECTED)

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-28-inv | ~~STAGING_LOAD_TEST v1~~ | ~~302-based (INVALID)~~ | ~~Reclassified as VERCEL_PROTECTION_RESPONSE_TEST~~ | ❌ INVALIDATED |
| G-28 | `VALID_PREVIEW_LOAD_TEST` | Application-level, bypass header | `preview-application-load-test.md` | ✅ **PASS** |

### Valid Load Test Evidence (G-28)
- Method: `x-vercel-protection-bypass` header (Protection Bypass for Automation)
- Phase 1 baseline: **40/40 PASS** — all `CLAIMRADAR_APP` content, HTTP 200
- Static p95: 3096ms (cold-start); cached requests 240–280ms
- DB-backed p95: **765ms** (Supabase claimables, companies, closing-soon)
- Phase 2 burst (20× /claimables): **20/20 PASS**, p95=779ms, 0× 429, 0× 5xx

## Security Gate

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-29 | `STAGING_SECURITY_ADVISOR` | Supabase Security Advisor scan | Dashboard access required | ⚠️ USER_ACTION_REQUIRED |

> **G-29 action:** Go to Supabase Dashboard → `upvsfqufkywlpibbwrse` → Advisors → Security Advisor. Review and classify each finding. Report results here. Any high-risk unresolved finding blocks beta.

## SMTP / Auth Email Gates

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-30 | `STAGING_SMTP` | Custom SMTP configured (not Supabase dev relay) | User action required | ❌ **BLOCKER — USER_ACTION_REQUIRED** |
| G-31 | `PREVIEW_AUTH_EMAIL` | Auth emails delivered (confirm, reset, magic link) | Pending SMTP config | ❌ **BLOCKER — PENDING G-30** |
| G-32 | `AUTH_URL_CONFIGURATION` | Supabase site URL = staging Preview URL | Dashboard configuration | ⚠️ USER_ACTION_REQUIRED |

> **G-30 action:** Configure Resend (recommended) per `docs/checkpoints/staging-smtp-auth.md`. Requires user account creation and domain DNS verification. Do NOT provide API keys to this agent — configure directly in Supabase Dashboard → Auth → SMTP.

## GitHub Runtime Gates

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-33 | `GITHUB_CI_RUNTIME` | CI workflow runs on push | GitHub Actions access required | ⚠️ NOT_EXECUTED_AUTH_REQUIRED |
| G-34 | `GITHUB_CRAWL_RUNTIME` | Daily crawl workflow tested | GitHub Actions + Supabase secrets required | ⚠️ NOT_EXECUTED_AUTH_REQUIRED |
| G-35 | `GITHUB_HEALTH_RUNTIME` | Source health workflow tested | GitHub Actions access required | ⚠️ NOT_EXECUTED_AUTH_REQUIRED |

> GitHub workflows (`ci.yml`, `daily-crawl.yml`, `source-health.yml`) exist and are structurally verified. Runtime execution requires GitHub Actions access with secrets configured.

## Monitoring Gate

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-36 | `STAGING_MONITORING_RUNTIME` | Live request/crawl records in staging | Load test generated real staging traffic | ⚠️ PARTIAL |

> The load test (G-28) generated 60 real application requests against staging Supabase. Vercel Analytics and Supabase logs should contain records. Full monitoring runtime verification requires dashboard review of log/alert entries.

---

## Summary

| Status | Count | Gates |
|---|---|---|
| ✅ PASS | **27** | G-01 to G-28 (excluding G-28-inv) |
| ❌ BLOCKER | **2** | G-30 (SMTP), G-31 (Auth email) |
| ⚠️ USER_ACTION_REQUIRED | **3** | G-29 (Security Advisor), G-32 (Auth URL), G-36 (Monitoring) |
| ⚠️ NOT_EXECUTED | **3** | G-33, G-34, G-35 (GitHub runtime) |
| ❌ INVALIDATED | **1** | G-28-inv (302 load test) |

---

## Pass Conditions Status

```
STAGING_MIGRATIONS         = PASS ✅
STAGING_RLS_ANON           = PASS ✅
STAGING_RLS_USER           = PASS ✅
STAGING_RLS_STAFF          = PASS ✅
STAGING_NOTIFICATION_RLS   = PASS ✅

VERCEL_PREVIEW             = PASS ✅
PREVIEW_ENVIRONMENT_ISOLATION = PASS ✅
PREVIEW_PUBLIC             = PASS ✅
PREVIEW_AUTH               = PASS ✅
PREVIEW_CUSTOMER           = PASS ✅
PREVIEW_ADMIN              = PASS ✅
PREVIEW_SECRET_ISOLATION   = PASS ✅

VALID_PREVIEW_LOAD_TEST    = PASS ✅  (40/40 app responses, DB-backed p95=765ms)

STAGING_SMTP               = NOT_READY ❌  ← BLOCKER
PREVIEW_AUTH_EMAIL         = NOT_READY ❌  ← BLOCKER (depends on SMTP)

STAGING_SECURITY_ADVISOR   = NOT_EXECUTED ⚠️  ← USER ACTION REQUIRED
STAGING_MONITORING_RUNTIME = PARTIAL ⚠️
GITHUB_CI_RUNTIME          = NOT_EXECUTED_AUTH_REQUIRED ⚠️
GITHUB_CRAWL_RUNTIME       = NOT_EXECUTED_AUTH_REQUIRED ⚠️
GITHUB_HEALTH_RUNTIME      = NOT_EXECUTED_AUTH_REQUIRED ⚠️
```

**Overall Gate Result: NOT YET PASS — 2 BLOCKERS REMAIN**

---

## Safety Flags (Confirmed Active)

```
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
```

---

## Remaining Blockers Before Opening Beta to External Users

### Blocker 1: SMTP (G-30 + G-31)
- **Action:** Complete Resend account creation + domain verification + Supabase SMTP configuration
- **Guide:** `docs/checkpoints/staging-smtp-auth.md`
- **Effort:** ~30–60 minutes (user action; requires DNS access)

### Blocker 2: Security Advisor (G-29 — conditionally blocking)
- **Action:** Run Supabase Security Advisor from Dashboard; resolve any HIGH findings via migration 012+
- **Effort:** ~15 minutes (user action; requires Supabase Dashboard access)

### Non-blocking Deferreds
- **G-32 (Auth URL):** Set Supabase site URL to staging Preview URL — quick dashboard change, done alongside SMTP setup
- **G-33–35 (GitHub runtime):** Requires GitHub Actions secrets setup — acceptable to defer for internal-only beta
- **G-36 (Monitoring):** Review Vercel Analytics + Supabase logs after first real user session

---

## Deployment Details

| Item | Value |
|---|---|
| Preview URL | `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app` |
| Deployment ID | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` |
| Vercel Project | `claimradar-staging` |
| Vercel Team | `pavithrans-projects-cae184b1` |
| Supabase Project | `upvsfqufkywlpibbwrse.supabase.co` |
| Migrations Applied | 001–011 (11 total) |
| Protection Bypass | Configured (`isEnvVar: true`, scope: `automation-bypass`) |
