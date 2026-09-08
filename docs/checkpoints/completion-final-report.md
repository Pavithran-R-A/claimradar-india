# ClaimRadar India Completion Report

Date: 2026-09-07

## Verification Snapshot

RUNTIME_FREEZE_HEAD = `6f22c5ef4119000318218f136f5416987a451877`
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

PR = `#3` - IBBI Unicode persistence repair
PR_DRAFT = `NO`
PR_STATE = `MERGED`
SOURCE_HEAD = `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
MAIN_PRE_MERGE_SHA = `7504f303099491132a804f723699197fa6334d8f`
MERGE_SHA = `6f22c5ef4119000318218f136f5416987a451877`
MERGE_PARENTS = `7504f303099491132a804f723699197fa6334d8f`, `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
MERGE_TIMESTAMP_UTC = `2026-09-07T15:31:12Z`
MERGE_TIMESTAMP_IST = `2026-09-07T21:01:12+05:30`

CI_RUN = `34138348817` ([GitHub Actions run](https://github.com/Pavithran-R-A/claimradar-india/actions/runs/34138348817))
CI_EXACT_HEAD = `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
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
BASELINE_GHA_RUN = `34138764303` ([GitHub Actions run](https://github.com/Pavithran-R-A/claimradar-india/actions/runs/34138764303))
BASELINE_HEAD = `6f22c5ef4119000318218f136f5416987a451877`
BASELINE_CRAWL_RUN = `0fe7626a-3332-403d-b3d4-d66db3ddefb9`
BASELINE_RESULT = `PASS` - repaired frozen main, 7 sources, 126 discovered and fetched, zero errors, zero publications.
BASELINE_SOURCE_DOCUMENTS = `PASS` - exact IBBI PDF persisted; 25 IBBI documents present.

SECURITY_HIGH = `NO_KNOWN_FINDINGS` - scoped review and tests passed
SECURITY_MEDIUM = `DOCUMENTED_STATIC_CSP_LIMITATION` - inline scripts remain required for static rendering
KNOWN_INTERNAL_DEFECTS = `NONE` found after repair and baseline gates

ACCESSIBILITY_REVIEW = `PASS_WITH_LIMITATION` - route and keyboard checks passed.
PERFORMANCE_REVIEW = `PASS_WITH_LIMITATION` - local smoke and runtime health passed.
RUNTIME_SENSITIVE_CHANGED = `YES` historically - IBBI persistence repair required a new freeze.
RUNTIME_SENSITIVE_DIFF_AFTER_FREEZE = `EMPTY`
NEW_FINAL_SOAK_REQUIRED = `YES`
SOAK_START_UTC = `2026-09-07T18:17:00Z`
SOAK_START_IST = `2026-09-07T23:47:00+05:30`
SOAK_START_RUN = `34163605422`
SOAK_START_CRAWL_RUN = `2aa12fb7-e011-474b-a3b0-068f52d090bf`
SCHEDULE_CRON = `17 */6 * * *`
FIRST_SCHEDULED_SLOT_UTC = `2026-09-07T18:17:00Z`
FIRST_SCHEDULED_SLOT_IST = `2026-09-07T23:47:00+05:30`
NEXT_4_SCHEDULED_SLOTS_UTC = `2026-09-08T00:17:00Z`, `2026-09-08T06:17:00Z`, `2026-09-08T12:17:00Z`, `2026-09-08T18:17:00Z`
SCHEDULED_RUN_34042559516 = `PRE_FREEZE_NOMINAL_SLOT`
SCHEDULED_RUN_34042559516_STARTED_UTC = `2026-09-06T15:31:11Z`
SCHEDULED_RUN_34042559516_NOMINAL_SLOT_UTC = `2026-09-06T12:17:00Z`
SCHEDULED_RUN_34042559516_QUALIFICATION = `EXCLUDED_FROM_FINAL_SOAK_QUALIFICATION`
SCHEDULED_RUN_34042559516_PERMANENT_ACCOUNTING = `EXCLUDED_FROM_ALL_FINAL_SOAK_COUNTS`
SLOT_ACCOUNTING_STATE = `DELAYED_PRE_FREEZE_RUN_EXCLUDED`
MANUAL_WORKFLOW_DISPATCH_QUALIFICATION = `EXCLUDED`
BASELINE_ACCOUNTING = `BASELINE_ONLY`
SOAK_RESTART_REQUIRED = `YES - RUNTIME_DEFECT_REPAIR`
RUNTIME_FREEZE_HEAD = `6f22c5ef4119000318218f136f5416987a451877`
RUNTIME_SENSITIVE_DIFF = `EMPTY AFTER NEW FREEZE`
FIRST_QUALIFYING_SLOT_UTC = `2026-09-07T18:17:00Z`
OLD_SOAK_INVALIDATED = `YES` - runs `34058094014`, `34084538536`, and failed run `34123292686`
FAILED_SOAK_RUN = `34123292686` - scheduled IBBI PDF persistence failure, crawl `8aee683a-73d1-43d5-85a3-5266f9614c80`
ROOT_CAUSE = `raw_text` contained U+0000 characters from the IBBI PDF.
FIX = `sanitizePostgresText` and recursive JSON sanitization before persistence.
NEW_BASELINE_GUARDS = `staging`, billing off, notifications off, live adapters on
NEW_BASELINE_INVARIANTS = `7/7 sources, 126 discovered, 126 fetched, zero errors, zero unexpected errors, zero publications`
SOAK_ELAPSED_AT_2026-09-08T10:37:45Z = `16.3h`
QUALIFYING_RUN_1 = `34163605422` - slot `2026-09-07T18:17:00Z`, crawl `2aa12fb7-e011-474b-a3b0-068f52d090bf`, PASS
QUALIFYING_RUN_1_INVARIANTS = `7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications`
QUALIFYING_RUN_2 = `34188114057` - slot `2026-09-08T00:17:00Z`, crawl `898c47d8-2299-414b-a06b-8450c4c49862`, PASS
QUALIFYING_RUN_2_INVARIANTS = `7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications`
SOAK_48H = `PENDING_TIME_SOAK`
SOAK_72H = `PENDING_TIME_SOAK`
WRONG_TARGET_SOAK_REJECTED = `33836845034` - passed against another project.

CUSTOM_DOMAIN_STATUS = `EXTERNAL_CONFIG_PENDING` - DNS remains separate deployment work
MAIN_MODIFIED = `YES` - repair merge applied; runtime freeze reset.
PRODUCTION_MERGED = `YES` - repository main only; production deployment untouched.
MAIN_CLEAN = `YES`
RUNTIME_FROZEN = `YES`
PRODUCTION_READY_NOW = `NO - PENDING NEW FINAL SOAK`

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
- PostgreSQL-safe Unicode sanitization for source persistence.
- Exact IBBI PDF regression coverage and repaired-main baseline.

## Branch Evidence

- Branch: `main`
- Runtime repair source: `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
- New frozen main: `6f22c5ef4119000318218f136f5416987a451877`
- Frontend source: `d3f3e9cb338c1b0d98a2f5e3696b8081c33c07b3`
- Vercel commit author: `Pavithran-R-A <pavithranraar@gmail.com>`
- Active soak disturbed: `YES` - old soak invalidated by genuine runtime failure

## CI Coverage

The exact-head workflow covers format, lint, typecheck, tests, inventory acceptance, production build, client bundle secret scanning, migration validation, browser smoke, and release integrity.

The staging auth-only mode creates confirmed disposable users through the Auth Admin API. It verifies roles, sessions, RLS isolation, admin access, notification deduplication, and cleanup. Credentials remain in memory and never enter logs or artifacts.

## Release Decision

**NO-GO for autonomous production release.**

All controllable local, exact-head CI, and credentialed staging runtime gates pass.
Vercel reports the exact Preview ready, and interactive public routes pass.
Correct-target repaired staging baseline passed from frozen main.
The new final soak remains pending genuine scheduled executions.
Production stays untouched.
