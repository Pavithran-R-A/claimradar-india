# ClaimRadar India — Limited Free-Beta Gate Matrix (v4 Reconciled)

**Date:** 2026-08-07  
**Branch:** `qoder/complete-claimradar`  
**Environment:** Vercel Preview → Staging Supabase (`upvsfqufkywlpibbwrse`)  
**Revision:** v4 — Reconciled Evidence & Stop Conditions

---

## 1. Core Gate Matrix

| #    | Gate Name                         | Classification | Requirement                        | Evidence / Details                                         | Status                                         |
| ---- | --------------------------------- | -------------- | ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| G-01 | Node Version                      | System         | Node 24 active                     | `node --version` → `v24.19.0`                              | ✅ PASS                                        |
| G-02 | Docker                            | System         | Docker daemon running              | `docker ps` active & healthy                               | ✅ PASS                                        |
| G-03 | Local Supabase                    | Database       | `npx supabase start` clean         | API & Studio operational                                   | ✅ PASS                                        |
| G-04 | Migrations 001–011                | Database       | Applied in exact order             | `supabase db reset` log                                    | ✅ PASS                                        |
| G-05 | DB Lint (Local)                   | Database       | Zero warnings                      | `supabase db lint` output                                  | ✅ PASS                                        |
| G-06 | pgTAP Assertions                  | Database       | 9 files / 44 assertions            | `supabase test db` output                                  | ✅ PASS                                        |
| G-07 | Unit & Integration Suite          | Testing        | `pnpm test`                        | 41 test files / 387 tests PASSED                           | ✅ PASS                                        |
| G-08 | Inventory Acceptance              | Testing        | `pnpm test:inventory-acceptance`   | 1 test file / 4 tests PASSED                               | ✅ PASS                                        |
| G-09 | Production Build                  | Web App        | `pnpm build`                       | Next.js 15.5.22 / 0 type errors                            | ✅ PASS                                        |
| G-10 | Fixture Idempotency               | Database       | 2× reset clean                     | Double-reset log                                           | ✅ PASS                                        |
| G-11 | Parser Idempotency                | Crawler        | Real-HTTP stable 2×                | Live-source idempotency log                                | ✅ PASS                                        |
| G-12 | Axe Accessibility                 | UI/UX          | Zero critical violations           | `@axe-core/playwright` output                              | ✅ PASS                                        |
| G-13 | Reduced-Motion                    | UI/UX          | `prefers-reduced-motion` respected | Audit output                                               | ✅ PASS                                        |
| G-14 | Portable Backup                   | Operations     | SHA-256 verified archive           | 17.19 MB backup archive                                    | ✅ PASS                                        |
| G-15 | `STAGING_MIGRATIONS`              | Staging DB     | 11 migrations applied              | Staging DB schema verified                                 | ✅ PASS                                        |
| G-16 | `STAGING_RLS_ANON`                | Security       | Public table isolation             | 12/12 public tables `relrowsecurity=true`                  | ✅ PASS                                        |
| G-17 | `STAGING_RLS_USER`                | Security       | User data isolation                | `auth.uid() = user_id` policies                            | ✅ PASS                                        |
| G-18 | `STAGING_RLS_STAFF`               | Security       | Staff RBAC enforced                | Staff permission matrix                                    | ✅ PASS                                        |
| G-19 | `STAGING_NOTIFICATION_RLS`        | Security       | Notification isolation             | pgTAP notification assertions                              | ✅ PASS                                        |
| G-20 | `CUSTOM_POSTGRES_SECURITY_AUDIT`  | Security       | DB catalog security audit          | PostgreSQL security script                                 | ✅ PASS                                        |
| G-21 | `STAGING_SECURITY_ADVISOR`        | Security       | Supabase Security Advisor          | Dashboard/API access required                              | ⚠️ **AWAITING_USER_ACTION**                    |
| G-22 | `APPLICATION_AUTH_REDIRECT_LOGIC` | Auth           | Relative redirect validation       | `actions.ts` & `callback/route.ts` open-redirect audit     | ✅ PASS                                        |
| G-23 | `LOCAL_STAGING_SITE_URL`          | Auth           | Staging env site URL               | `NEXT_PUBLIC_SITE_URL` set to Preview URL                  | ✅ PASS                                        |
| G-24 | `SUPABASE_AUTH_URL_CONFIGURATION` | Auth           | Supabase Auth Dashboard settings   | Dashboard access required                                  | ⚠️ **AWAITING_USER_ACTION**                    |
| G-25 | `VERCEL_PREVIEW`                  | Hosted App     | Deployment live                    | Deployment `pqkk2cmy5`                                     | ✅ PASS                                        |
| G-26 | `PREVIEW_ENVIRONMENT_ISOLATION`   | Safety         | Environment guards active          | `APP_ENV=staging` + 4 safety flags                         | ✅ PASS                                        |
| G-27 | `PREVIEW_PUBLIC`                  | Hosted App     | 13/13 routes verified              | `test-preview-deployment.mjs` (bypass header)              | ✅ PASS                                        |
| G-28 | `PREVIEW_SECRET_ISOLATION`        | Security       | No secrets leaked                  | Client bundle & HTML scan                                  | ✅ PASS                                        |
| G-29 | `VALID_PREVIEW_LOAD_TEST`         | Performance    | Hosted load test via bypass header | `preview-application-load-test.md` (40/40 PASS, p95=765ms) | ✅ PASS                                        |
| G-30 | `STAGING_MONITORING_CODE`         | Telemetry      | Logger & dedup logic               | Crawler log sink & dedup code                              | ✅ PASS                                        |
| G-31 | `STAGING_MONITORING_RUNTIME`      | Telemetry      | Hosted monitoring events           | `crawl_runs` 0 rows pending remote GitHub runs             | ⚠️ **PARTIAL**                                 |
| G-32 | `STAGING_SMTP`                    | Auth Email     | Custom SMTP provider               | Blocked: ClaimRadar domain required                        | ❌ **SMTP BLOCKER = VERIFIED DOMAIN REQUIRED** |
| G-33 | `PREVIEW_AUTH_EMAIL`              | Auth Email     | Email delivery test                | Pending G-32 SMTP configuration                            | ❌ **BLOCKER — PENDING G-32**                  |
| G-34 | `GITHUB_CI_RUNTIME`               | CI/CD          | GitHub Actions run                 | `git remote -v` empty                                      | ⚠️ **NOT_EXECUTED_REMOTE_MISSING**             |
| G-35 | `GITHUB_CRAWL_RUNTIME`            | Ingestion      | GitHub Actions run                 | `git remote -v` empty                                      | ⚠️ **NOT_EXECUTED_REMOTE_MISSING**             |
| G-36 | `GITHUB_HEALTH_RUNTIME`           | Monitoring     | GitHub Actions run                 | `git remote -v` empty                                      | ⚠️ **NOT_EXECUTED_REMOTE_MISSING**             |

---

## 2. Reconciled Metrics & Methodology

### Unit & Integration Test Counts (`pnpm test`)

- **Vitest Projects:** `@claimradar/web`, `@claimradar/crawler`, `@claimradar/claim-schema`, `@claimradar/source-registry`, `@claimradar/database`, `@claimradar/seo`
- **Total Test Files:** **41 passed (41)**
- **Total Assertions:** **387 passed (387)**

### Phase 4B Inventory Acceptance (`pnpm test:inventory-acceptance`)

- **Target File:** `apps/crawler/tests/acceptance/phase-4b.test.ts`
- **Test Files:** **1 passed (1)**
- **Total Assertions:** **4 passed (4)**

### Next.js Version & App Router Architecture (`pnpm build`)

- **Installed Next.js Version:** `15.5.22`
- **Total App Router Route Entries (`TOTAL_APP_ROUTER_ENTRIES`):** **72 routes**
- **Static Routes (`STATIC_ROUTES`):** **33 prerendered `○` routes**
- **Dynamic Server Routes (`DYNAMIC_ROUTES`):** **39 server-rendered `ƒ`/`λ` routes**
- **Static Generation Build Items (`STATIC_GENERATION_ITEMS`):** **44 items** (`Generating static pages (44/44)`)

---

## 3. Active Safety Policies

```
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
```

---

## 4. Overall Limited-Beta Gate Status

```
LIMITED FREE-BETA GATE = AWAITING_USER_ACTION
```

The gate cannot be marked `LIMITED FREE-BETA GATE = PASS` until the 4 genuine external user actions are performed.
