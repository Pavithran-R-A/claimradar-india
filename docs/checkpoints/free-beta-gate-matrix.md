# ClaimRadar India — Limited Free-Beta Gate Matrix (v3)

**Date:** 2026-08-07  
**Branch:** `qoder/complete-claimradar`  
**Environment:** Vercel Preview → Staging Supabase  
**Revision:** v3 — post Security Advisor, Auth URLs, Monitoring & GitHub Runtime Audit  

---

## Complete Gate Matrix

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-01 | Node Version | Node 24 active (`v24.19.0`) | `node --version` | ✅ PASS |
| G-02 | Docker | Docker daemon running | `docker ps` active & healthy | ✅ PASS |
| G-03 | Local Supabase | `npx supabase start` clean | API + Studio operational | ✅ PASS |
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
| G-14 | Portable Backup | SHA-256 verified archive | 17MB archive | ✅ PASS |
| G-15 | `STAGING_MIGRATIONS` | 11 migrations applied to staging DB | `supabase migration list` linked | ✅ PASS |
| G-16 | `STAGING_RLS_ANON` | Anon user data isolation | RLS policy review + staging schema | ✅ PASS |
| G-17 | `STAGING_RLS_USER` | Authenticated user isolation | `auth.uid() = user_id` policies | ✅ PASS |
| G-18 | `STAGING_RLS_STAFF` | Staff RBAC enforced | Permission matrix doc | ✅ PASS |
| G-19 | `STAGING_NOTIFICATION_RLS` | Notification RLS policies | pgTAP notification assertions | ✅ PASS |
| G-20 | `STAGING_DB_LINT` | Schema security & RLS | Database audit script | ✅ PASS |
| G-21 | `VERCEL_PREVIEW` | Deployment live | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` | ✅ PASS |
| G-22 | `PREVIEW_ENVIRONMENT_ISOLATION` | Safety flags active | `APP_ENV=staging` + 4 guards | ✅ PASS |
| G-23 | `PREVIEW_PUBLIC` | 13/13 routes verified (bypass header) | `test-preview-deployment.mjs` | ✅ PASS |
| G-24 | `PREVIEW_AUTH` | `/app` → `/login`, `/admin` → `/` | HTTP 307 with bypass | ✅ PASS |
| G-25 | `PREVIEW_CUSTOMER` | Auth isolation, RLS, billing gate | Customer QA doc | ✅ PASS |
| G-26 | `PREVIEW_ADMIN` | RBAC matrix, admin route protection | Admin QA doc | ✅ PASS |
| G-27 | `PREVIEW_SECRET_ISOLATION` | No secrets in HTML or JS | Content-class verification | ✅ PASS |
| G-28 | `VALID_PREVIEW_LOAD_TEST` | Application-level, bypass header | `preview-application-load-test.md` (40/40 PASS, p95=765ms) | ✅ PASS |
| G-29 | `STAGING_SECURITY_ADVISOR` | Catalog & RLS Security Audit | `staging-security-advisor.md` | ✅ **PASS_WITH_NON_BLOCKING_FINDINGS** |
| G-30 | `STAGING_AUTH_URLS` | Site URL & Allowed Callback URLs | `staging-auth-url-configuration.md` | ✅ **PASS** |
| G-31 | `STAGING_SMTP` | Custom SMTP configured | Blocked: Verified domain required | ❌ **SMTP BLOCKER = VERIFIED DOMAIN REQUIRED** |
| G-32 | `PREVIEW_AUTH_EMAIL` | Delivery of auth emails | Pending G-31 | ❌ **BLOCKER — PENDING G-31** |
| G-33 | `GITHUB_CI_RUNTIME` | CI workflow execution | Remote repository not configured | ⚠️ **NOT_EXECUTED_REMOTE_MISSING** |
| G-34 | `GITHUB_CRAWL_RUNTIME` | Daily crawl workflow execution | Remote repository not configured | ⚠️ **NOT_EXECUTED_REMOTE_MISSING** |
| G-35 | `GITHUB_HEALTH_RUNTIME` | Source health workflow execution | Remote repository not configured | ⚠️ **NOT_EXECUTED_REMOTE_MISSING** |
| G-36 | `STAGING_MONITORING_RUNTIME` | Operational event telemetry | `staging-monitoring-runtime.md` | ✅ **PASS** |

---

## Gate Summary

```
STAGING_MIGRATIONS            = PASS ✅
STAGING_RLS_ANON              = PASS ✅
STAGING_RLS_USER              = PASS ✅
STAGING_RLS_STAFF             = PASS ✅
STAGING_NOTIFICATION_RLS      = PASS ✅
VERCEL_PREVIEW                = PASS ✅
PREVIEW_ENVIRONMENT_ISOLATION = PASS ✅
PREVIEW_PUBLIC                = PASS ✅
PREVIEW_CUSTOMER              = PASS ✅
PREVIEW_ADMIN                 = PASS ✅
PREVIEW_SECRET_ISOLATION      = PASS ✅
VALID_PREVIEW_LOAD_TEST       = PASS ✅  (40/40 PASS, DB-backed p95=765ms)
STAGING_SECURITY_ADVISOR      = PASS_WITH_NON_BLOCKING_FINDINGS ✅
STAGING_AUTH_URLS             = PASS ✅
STAGING_MONITORING_RUNTIME    = PASS ✅

STAGING_SMTP                  = NOT_READY ❌ (SMTP BLOCKER = VERIFIED DOMAIN REQUIRED)
PREVIEW_AUTH_EMAIL            = NOT_READY ❌ (Pending SMTP configuration)

GITHUB_CI_RUNTIME             = NOT_EXECUTED_REMOTE_MISSING ⚠️
GITHUB_CRAWL_RUNTIME          = NOT_EXECUTED_REMOTE_MISSING ⚠️
GITHUB_HEALTH_RUNTIME         = NOT_EXECUTED_REMOTE_MISSING ⚠️
```

---

## Safety Policy Compliance

```
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
```
