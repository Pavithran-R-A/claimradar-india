# ClaimRadar India Completion Report

Date: 2026-09-07

## Verification Snapshot

RUNTIME_FREEZE_HEAD = `f7a77ee0349078a0dfbe8649d77683feb89e6470`
NODE_VERSION = `v24.19.0`

FORMAT = `LOCAL_PASS` and `REMOTE_CI_PASS`
LINT = `LOCAL_PASS` and `REMOTE_CI_PASS`
TYPECHECK = `LOCAL_PASS` and `REMOTE_CI_PASS`
TESTS = `LOCAL_PASS` and `REMOTE_CI_PASS` - 67 files, 539 tests
INVENTORY_ACCEPTANCE = `LOCAL_PASS` and `REMOTE_CI_PASS` - 47 files, 338 tests
BUILD = `LOCAL_PASS` and `REMOTE_CI_PASS` - 44 static pages
SECRET_SCAN = `LOCAL_PASS` and `REMOTE_CI_PASS` - zero client matches
MIGRATION_CONTRACT = `LOCAL_PASS` and `REMOTE_CI_PASS` - 17 ordered migrations
LOCAL_BROWSER_SMOKE = `LOCAL_PASS` - 10 routes across two viewports
STAGING_PREFLIGHT = `LOCAL_PASS_WITH_SKIPS` - four guards pass; seven credential checks skipped

PR = `#2` - ClaimRadar completion and production-readiness hardening
PR_DRAFT = `NO`
PR_STATE = `MERGED`
SOURCE_HEAD = `4a2fa8230b1418e8a109de3d543bbc2562ff158f`
MAIN_PRE_MERGE_SHA = `fc14de90783587013e692a70281ea88b8c3920f5`
MERGE_SHA = `f7a77ee0349078a0dfbe8649d77683feb89e6470`
MERGE_PARENTS = `fc14de90783587013e692a70281ea88b8c3920f5`, `4a2fa8230b1418e8a109de3d543bbc2562ff158f`
MERGE_TIMESTAMP_UTC = `2026-09-06T14:09:30Z`
MERGE_TIMESTAMP_IST = `2026-09-06T19:39:30+05:30`

CI_RUN = `33969160473` ([GitHub Actions run](https://github.com/Pavithran-R-A/claimradar-india/actions/runs/33969160473))
CI_EXACT_HEAD = `4a2fa8230b1418e8a109de3d543bbc2562ff158f`
CI_RESULT = `REMOTE_CI_PASS`

VERCEL_DEPLOYMENT = `claimradar-staging-f23y60nj7-pavithrans-projects-cae184b1.vercel.app`
VERCEL_STATE = `READY`
PREVIEW_URL = `https://claimradar-staging-f23y60nj7-pavithrans-projects-cae184b1.vercel.app`
PREVIEW_BROWSER_QA = `PASS_WITH_LIMITATION` - exact deployment routes passed.

SUPABASE_TARGET = `PASS` - project ref `upvsfqufkywlpibbwrse` verified.
SUPABASE_RUNTIME = `PASS` - target crawl data corroborated read-only.
SUPABASE_SECURITY = `PASS` - Security Advisor returned zero lints.
SUPABASE_PERFORMANCE = `PASS_WITH_LIMITATION` - expected INFO/WARN notices remain.
CUSTOMER_RUNTIME = `PASS` - user-scoped onboarding and isolation passed.
ADMIN_RUNTIME = `PASS` - admin surfaces passed; normal users were blocked.
API_RUNTIME = `PASS` - credentialed Auth and PostgREST checks passed.
NOTIFICATIONS = `PASS` - ownership, read state, dedup, and ledger privacy passed.
AUTH_RUNTIME = `PASS` - run `33968830120` created, confirmed, signed in, and cleaned up three users.
CRAWLER_PRE_SOAK = `PASS` - run `33840659144` passed all invariants.
CRAWL_DB_CORROBORATION = `PASS` - 7 sources, 126 found, 123 stored, 21 candidates, zero errors.
BASELINE_GHA_RUN = `34038342122` ([GitHub Actions run](https://github.com/Pavithran-R-A/claimradar-india/actions/runs/34038342122))
BASELINE_CRAWL_RUN = `afc0ddfd-e65c-4b03-aaa8-be8537a5fc94`
BASELINE_RESULT = `PASS` - frozen main, 7 sources, 126 found, zero errors, zero publications.
BASELINE_SOURCE_DOCUMENTS = `PASS` - 204 total documents across 7 expected sources.

SECURITY_HIGH = `NO_KNOWN_FINDINGS` - scoped review and tests passed
SECURITY_MEDIUM = `DOCUMENTED_STATIC_CSP_LIMITATION` - inline scripts remain required for static rendering
KNOWN_INTERNAL_DEFECTS = `NONE` found by local and exact-head CI gates

ACCESSIBILITY_REVIEW = `PASS_WITH_LIMITATION` - route and keyboard checks passed.
PERFORMANCE_REVIEW = `PASS_WITH_LIMITATION` - local smoke and runtime health passed.
RUNTIME_SENSITIVE_CHANGED = `NO` after runtime freeze - later changes are accounting, tests, and checkpoint docs only.
NEW_FINAL_SOAK_REQUIRED = `YES`
SOAK_START_UTC = `2026-09-06T18:17:00Z` - nominal slot assigned to run `34058094014`
SOAK_START_IST = `2026-09-06T23:47:00+05:30`
SOAK_START_RUN = `34058094014`
SOAK_START_CRAWL_RUN = `539dfcc6-8f4d-41c8-bb83-1092d2dd53d2`
SCHEDULE_CRON = `17 */6 * * *`
FIRST_SCHEDULED_SLOT_UTC = `2026-09-06T18:17:00Z`
FIRST_SCHEDULED_SLOT_IST = `2026-09-06T23:47:00+05:30`
NEXT_4_SCHEDULED_SLOTS_UTC = `2026-09-07T00:17:00Z`, `2026-09-07T06:17:00Z`, `2026-09-07T12:17:00Z`, `2026-09-07T18:17:00Z`
SCHEDULED_RUN_34042559516 = `PRE_FREEZE_NOMINAL_SLOT`
SCHEDULED_RUN_34042559516_STARTED_UTC = `2026-09-06T15:31:11Z`
SCHEDULED_RUN_34042559516_NOMINAL_SLOT_UTC = `2026-09-06T12:17:00Z`
SCHEDULED_RUN_34042559516_QUALIFICATION = `EXCLUDED_FROM_FINAL_SOAK_QUALIFICATION`
SCHEDULED_RUN_34042559516_PERMANENT_ACCOUNTING = `EXCLUDED_FROM_ALL_FINAL_SOAK_COUNTS`
SLOT_ACCOUNTING_STATE = `DELAYED_PRE_FREEZE_RUN_EXCLUDED`
MANUAL_WORKFLOW_DISPATCH_QUALIFICATION = `EXCLUDED`
BASELINE_ACCOUNTING = `BASELINE_ONLY`
SOAK_RESTART_REQUIRED = `NO - ACCOUNTING_ONLY_CORRECTION`
RUNTIME_FREEZE_HEAD = `f7a77ee0349078a0dfbe8649d77683feb89e6470`
RUNTIME_SENSITIVE_DIFF = `EMPTY - ACCOUNTING_TEST_DOCS_ONLY`
FIRST_QUALIFYING_SLOT_UTC = `2026-09-06T18:17:00Z`
QUALIFYING_RUN_1 = `34058094014` - slot `2026-09-06T18:17:00Z`, crawl `539dfcc6-8f4d-41c8-bb83-1092d2dd53d2`, PASS
QUALIFYING_RUN_2 = `34084538536` - slot `2026-09-07T00:17:00Z`, crawl `4ea1eaab-f549-4174-982c-a96bde06d296`, PASS
QUALIFYING_RUN_INVARIANTS = `7/7 sources, 126 documents, zero errors, zero unexpected errors, zero publications`
SOAK_ELAPSED_AT_2026-09-07T05:48:12Z = `11.5h`
SOAK_48H = `PENDING_TIME_SOAK`
SOAK_72H = `PENDING_TIME_SOAK`
WRONG_TARGET_SOAK_REJECTED = `33836845034` - passed against another project.

CUSTOM_DOMAIN_STATUS = `EXTERNAL_CONFIG_PENDING` - DNS remains separate deployment work
MAIN_MODIFIED = `YES` - merge commit applied; runtime freeze remains unchanged.
PRODUCTION_MERGED = `YES` - repository main only; production deployment untouched.
MAIN_CLEAN = `YES`
RUNTIME_FROZEN = `YES`
PRODUCTION_READY_NOW = `NO - PENDING FINAL SOAK`

## Completion Scope

Implemented and documented the expanded completion scope.

- Public frontend redesign and responsive navigation.
- Honest source-family and authority copy.
- Customer route protection and sign-in redirects.
- Admin route protection and role boundaries.
- Profile-update and security-definer hardening.
- SSRF IPv6 normalization and boundary tests.
- RSS descriptions, date validation, and provenance.
- Per-document crawler failure propagation.
- Cross-source duplicate clustering support.
- IBBI PDF evidence and OCR signaling.
- Registry-aligned source seed records.
- Release preflight and runtime integrity guards.
- Browser security headers and daily-crawl soak tracking.
- Staging migration drift reconciliation and source bootstrap guard.
- Repository-wide formatting enforcement.
- CI browser smoke across two viewports.
- Completion plan, ledger, and runbook updates.

## Branch Evidence

- Branch: `codex/claimradar-completion`
- Baseline main: `fc14de90783587013e692a70281ea88b8c3920f5`
- Frontend source: `d3f3e9cb338c1b0d98a2f5e3696b8081c33c07b3`
- Vercel commit author: `Pavithran-R-A <pavithranraar@gmail.com>`
- Active soak disturbed: `NO`

## CI Coverage

The exact-head workflow covers format, lint, typecheck, tests, inventory acceptance, production build, client bundle secret scanning, migration validation, browser smoke, and release integrity.

The staging auth-only mode creates confirmed disposable users through the Auth Admin API. It verifies roles, sessions, RLS isolation, admin access, notification deduplication, and cleanup. Credentials remain in memory and never enter logs or artifacts.

## Release Decision

**NO-GO for autonomous production release.**

All controllable local, exact-head CI, and credentialed staging runtime gates pass.
Vercel reports the exact Preview ready, and interactive public routes pass.
Correct-target staging crawl evidence passed from frozen main.
Production stays untouched.
