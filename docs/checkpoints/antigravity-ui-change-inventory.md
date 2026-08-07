# ClaimRadar India — UI Change Inventory & Source Audit

**Date:** August 6, 2026  
**Repository Branch:** `qoder/complete-claimradar`  
**Git Commit:** `d425747b9adec24b336278e511800b331d67f185` (`fix(web): correct landing page component props and state types`)

---

## 1. Change Breakdown by Development Phase

### A. Files Changed by Recovered Qoder Work (Commit `9901ebc`)
- **Database & Migrations:** `supabase/migrations/011_notifications.sql`
- **Notification Engine Package:** `apps/web/lib/notifications/config.ts`, `engine.ts`, `providers.ts`, `safety.ts`, `store.ts`, `types.ts`
- **Unsubscribe Handler:** `apps/web/app/app/settings/unsubscribe/actions.ts`, `page.tsx`, `unsubscribe-form.tsx`
- **Observability:** `apps/crawler/src/observability/alerts.ts`, `failure-categories.ts`, `missed-run.ts`
- **Unit & Acceptance Suites:** `apps/web/tests/unit/notifications-engine.test.ts`, `notifications-safety.test.ts`, `admin-ui-helpers.test.ts`, `auth-guards.test.ts`, `dashboard-helpers.test.ts`
- **Verification Scripts:** `scripts/phase-4b-acceptance-runner.mjs`, `verify-local-live-source-idempotency.mjs`, `staging-preflight.mjs`, `backup-export.ps1`
- **Documentation:** `docs/deployment-readiness.md`, `docs/staging-supabase-setup.md`, `docs/crawler-operations.md`

### B. Files Changed by First Antigravity Redesign (Committed in `d425747`)
- **Landing Page Component:** `apps/web/app/(public)/page.tsx` — Updated `ClaimableCard`, `ClaimableRow`, `EmptyDirectoryNotice`, and `activeClaimCount` props to match strict workspace TypeScript definitions.

### C. Pages Redesigned & Source-Updated
- **Landing Page (`/`):** Full "Evidence in Motion" hero, interactive search component (`InteractiveHeroSearch`), evidence flow diagram (`EvidenceFlowDiagram`), sector badges, status metrics, and footer.
- **Public Directory (`/claimables`):** Upgraded continuous dark aurora layout, filter bar, status badges, and claimable card grid.
- **Claim Detail (`/claimables/[slug]`):** Direct-answer header, official source links, proof requirements checklist, and prominent legal disclaimer.
- **Companies Directory (`/companies`, `/companies/[slug]`):** Neutral, non-defamatory corporate summary headers, active claim counts, and verified regulatory source links.
- **Sectors Directory (`/sectors`, `/sectors/[slug]`):** Dynamic sector aggregates, clean information cards, and non-misleading opportunity counts.
- **Deadlines & Closing Soon (`/deadlines`, `/closing-soon`, `/new`):** Categorized urgency grids (closing this week, closing this month, upcoming).

### D. Pages Merely Compiled (Styled via Global Layout & Shared CSS Tokens)
- **Legal & Information Pages:** `/about`, `/contact`, `/acceptable-use`, `/cookie-policy`, `/corrections`, `/disclaimer`, `/editorial-policy`, `/faq`, `/glossary`, `/guides`, `/how-it-works`, `/methodology`, `/pricing`, `/privacy`, `/refund-policy`, `/security`, `/sources`, `/terms`.
- **Customer App Routes:** `/app`, `/app/billing`, `/app/matches`, `/app/notifications`, `/app/privacy`, `/app/profile`, `/app/settings`, `/app/tracker`, `/app/watchlist`.
- **Admin Dashboard Routes:** `/admin`, `/admin/ai-runs`, `/admin/alerts`, `/admin/audit`, `/admin/candidates`, `/admin/claimables`, `/admin/companies`, `/admin/corrections`, `/admin/crawl-runs`, `/admin/reviews`, `/admin/settings`, `/admin/sources`, `/admin/users`.
- **Auth Routes:** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.

### E. Untouched / Pristine Codebase Baseline
- **Shared Types:** `packages/shared-types`
- **Claim Schema:** `packages/claim-schema`
- **Source Registry:** `packages/source-registry`
- **Config & SEO Packages:** `packages/config`, `packages/seo`

## 2. Readiness Category Status Matrix

| Category | Status | Evidence / Reason |
| :--- | :--- | :--- |
| `HOMEPAGE_UI_CODE` | `PASS` | `apps/web/app/(public)/page.tsx` compiled & styled |
| `HOMEPAGE_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `PUBLIC_DIRECTORY_UI_CODE` | `PASS` | `apps/web/app/(public)/claimables/page.tsx` compiled & styled |
| `PUBLIC_DIRECTORY_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `CLAIM_DETAIL_UI_CODE` | `PASS` | `apps/web/app/(public)/claimables/[slug]/page.tsx` compiled & styled |
| `CLAIM_DETAIL_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `COMPANY_UI_CODE` | `PASS` | `apps/web/app/(public)/companies/page.tsx` compiled & styled |
| `COMPANY_UI_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `SECTOR_UI_CODE` | `PASS` | `apps/web/app/(public)/sectors/page.tsx` compiled & styled |
| `SECTOR_UI_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `DEADLINE_UI_CODE` | `PASS` | `apps/web/app/(public)/deadlines/page.tsx` compiled & styled |
| `DEADLINE_UI_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `CUSTOMER_APP_UI_CODE` | `PASS` | `apps/web/app/app/page.tsx` compiled & styled |
| `CUSTOMER_APP_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `ADMIN_UI_CODE` | `PASS` | `apps/web/app/admin/page.tsx` compiled & styled |
| `ADMIN_UI_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `AUTH_UI_CODE` | `PASS` | `apps/web/app/(auth)/login/page.tsx` compiled & styled |
| `AUTH_UI_BROWSER_QA` | `NOT_EXECUTED` | Pending live browser screenshot capture & interaction evidence |
| `LOADING_STATES` | `PASS` | Skeletons implemented in `components/skeletons/` |
| `EMPTY_STATES` | `PASS` | `EmptyDirectoryNotice` in `components/repository-states.tsx` |
| `ERROR_STATES` | `PASS` | `global-error.tsx` & error notice banners implemented |
| `MOBILE_UI` | `NOT_EXECUTED` | Pending mobile viewport screenshot & interaction evidence |
| `KEYBOARD_ACCESSIBILITY` | `NOT_EXECUTED` | Focus ring CSS present; manual/automated keyboard QA not executed |
| `AUTOMATED_ACCESSIBILITY` | `NOT_EXECUTED` | WCAG semantics present; automated axe scan not executed |
| `REDUCED_MOTION_BROWSER_QA` | `NOT_EXECUTED` | CSS media query present; browser emulation scan not executed |
| `LIGHTHOUSE_PERFORMANCE` | `NOT_EXECUTED` | Build completed; Lighthouse audit not executed |
| `LOCAL_SUPABASE_NEW_DEVICE` | `BLOCKED_LOCAL_ENVIRONMENT` | `com.docker.service` stopped on Windows host |
| `LOCAL_PGTAP_NEW_DEVICE` | `BLOCKED_LOCAL_ENVIRONMENT` | `supabase test db` pending Docker engine |
| `LOCAL_RLS_NEW_DEVICE` | `BLOCKED_LOCAL_ENVIRONMENT` | Local RLS suite pending Docker engine |
| `PUBLIC_ROUTES_LOCAL_DATABASE` | `BLOCKED_LOCAL_ENVIRONMENT` | Database-backed route isolation test pending Docker engine |
| `STAGING_DATABASE` | `SKIP_CREDENTIALS` | Disposable staging credentials required |
| `STAGING_PREVIEW` | `SKIP_CREDENTIALS` | Disposable staging credentials & Vercel link required |

---

## 3. Git Status Summary
- **Branch:** `qoder/complete-claimradar`
- **Working Tree:** `nothing to commit, working tree clean`
- **Uncommitted Files:** `0`

