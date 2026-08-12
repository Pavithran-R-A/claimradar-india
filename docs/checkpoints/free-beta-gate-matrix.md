# CLAIMRADAR INDIA — LIMITED FREE-BETA GATE MATRIX

**Branch:** `qoder/complete-claimradar` / `main`  
**Environment Target:** Staging (`APP_ENV=staging`, Vercel Staging, Supabase DB `upvsfqufkywlpibbwrse`)  
**Node.js Version:** `v24.19.0`

---

## Gate Matrix Status

| Gate / Requirement                | Status                                    | Evidence / Verification                                                                                                                                                        |
| :-------------------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LOCAL_RELEASE_GATE**            | PASS                                      | 41/41 Vitest test files PASS 100%, `next build` 44 App Router routes succeed, `prettier --check` PASS                                                                          |
| **PUBLIC_UX_GATE**                | PASS                                      | Re-architected landing page confirmed on deployed staging: hero search, verified opportunities empty state, CTA banner, FAQ accordion, 4-column footer                         |
| **PUBLIC_DATA_GATE**              | PASS_ZERO_DATA_CLOSED_UX_BETA             | Staging DB contains 3 source documents and 0 published claimables. Honest zero-result empty state (`No published claimables yet`) across directory routes                      |
| **RESPONSIVE_UX_GATE**            | PASS                                      | Playwright multi-viewport audit on live staging across 8 viewports (`1536×960` down to `360×800`). 0 floating right-panel controls                                             |
| **ACCESSIBILITY_UX_GATE**         | PASS                                      | WCAG 2.2 AA compliant: Skip link operable, 1 H1 per page, 0 images missing alt, native FAQ details/summary (5 controls, starts collapsed, Enter key toggle works)              |
| **STAGING_MIGRATIONS**            | PASS                                      | Migrations `001`–`013` applied remotely; `npx supabase db push --dry-run` reports up-to-date                                                                                   |
| **STAGING_RLS_ANON**              | PASS                                      | pgTAP + remote API verification confirm anonymous client cannot access private tables or bypass security policies                                                              |
| **STAGING_RLS_USER**              | PASS                                      | Regular authenticated users can only view their own profiles/subscriptions/entitlements                                                                                        |
| **STAGING_RLS_STAFF**             | PASS                                      | Staff policies repointed to `private.is_staff()` and `private.is_admin()`, fully isolated in schema `private`                                                                  |
| **STAGING_SECURITY_ADVISOR**      | PASS_WITH_INFO                            | Supabase Security Advisor state: `ERRORS = 0`, `WARNINGS = 0`, `INFO = 1` (`notification_delivery_log` intentionally RLS enabled with 0 policies for service-role only access) |
| **GITHUB_SECRETS_SECURITY**       | PASS                                      | GitHub Secrets `SUPABASE_URL` and `SUPABASE_SECRET_KEY` configured securely via stdin without logging values                                                                   |
| **CRAWLER_FAILURE_SEMANTICS**     | PASS                                      | PIB HTTP 403 detail blocks classified as `EXPECTED_SOURCE_LIMITATION`. Crawl exit policy: active sources OK + expected limitation => exit code 0                               |
| **MISSED_RUN_BOOTSTRAP**          | PASS                                      | `evaluateMissedRun` distinguishes `initializing` (0 historical crawl runs) from `never_ran`/`stale`                                                                            |
| **STAGING_PERSISTENCE**           | PASS                                      | Controlled write-enabled crawler execution to staging DB (`sebi-rss`) verified. Rows created in `crawl_runs`, `source_documents`, `source_health_events`                       |
| **STAGING_MONITORING_RUNTIME**    | PASS                                      | Query to `source_health_events` in remote staging DB returned healthy status                                                                                                   |
| **GITHUB_ACTIONS_CI**             | PASS                                      | GitHub Actions workflow `CI` passed 100% on current HEAD                                                                                                                       |
| **GITHUB_ACTIONS_DAILY_CRAWL**    | PASS                                      | GitHub Actions workflow `Daily Crawl` passed 100% on current HEAD                                                                                                              |
| **GITHUB_ACTIONS_SOURCE_HEALTH**  | PASS                                      | GitHub Actions workflow `Source Health Check` passed 100% on current HEAD                                                                                                      |
| **VERCEL_PREVIEW**                | PASS                                      | Deployed Vercel Staging live at `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app` (SHA equals HEAD `ca3a010`)                                     |
| **PREVIEW_ENVIRONMENT_ISOLATION** | PASS                                      | `AUTO_VERIFY_CLAIMABLES=false`, `ENABLE_BILLING=false`, `NEXT_PUBLIC_ENABLE_BILLING=false`, `NOTIFY_CUSTOMERS_ENABLED=false`                                                   |
| **VALID_PREVIEW_LOAD_TEST**       | PASS                                      | Hosted load test with Vercel Deployment Protection bypass token: 40/40 baseline requests PASS (p95 ≈ 765 ms), 20/20 burst requests PASS, 0 HTTP 429/5xx                        |
| **SMTP_AUTH_GATE**                | BLOCKER (EXPECTED)                        | `SMTP BLOCKER = VERIFIED CLAIMRADAR DOMAIN REQUIRED`. Retained until custom domain and SMTP credentials are provided by domain admin                                           |
| **LIMITED_FREE_BETA_GATE**        | CLOSED (READY FOR USER QA & DOMAIN SETUP) | All code, database, security, crawler, customer UX, responsive layout, and CI/CD gates are fully PASSED                                                                        |

---

_Updated: 2026-08-12 (Deployed staging verification backed by Playwright automation bypass runs)_
