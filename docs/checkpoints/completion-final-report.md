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

## Soak-safe finalization pass

AUDIT_BRANCH = `codex/claimradar-soak-safe-finalization`
AUDIT_DATE = `2026-09-08`
RUNTIME_FREEZE_HEAD = `6f22c5ef4119000318218f136f5416987a451877`
RUNTIME_SENSITIVE_DIFF = `EMPTY_AFTER_FREEZE`
SOAK_INVALIDATED = `NO`

PUBLIC_BROWSER_QA = `PASS_WITH_LIMITATION`
ACCESSIBILITY = `MATERIAL_RUNTIME_FIX_REQUIRED`
PERFORMANCE = `PASS_WITH_LIMITATION`
SUPABASE_DATABASE = `PASS_WITH_LIMITATION`
SUPABASE_SECURITY = `PASS_WITH_LIMITATION`
SUPABASE_PERFORMANCE = `PASS_WITH_ACCEPTED_CAPACITY_LIMIT`
AUTH_SMTP_READINESS = `EXTERNAL_CONFIGURATION_REQUIRED`
CSP_SECURITY = `ACCEPTED_TRADEOFF_REQUIRES_SECURITY_OWNER_ACK`
VERCEL_READINESS = `PASS_WITH_LIMITATION`
BACKUP_RECOVERY = `EXTERNAL_CONFIGURATION_REQUIRED`
OBSERVABILITY = `PASS_WITH_LIMITATION`
INCIDENT_RESPONSE = `PASS`
ROLLBACK_READINESS = `PASS_WITH_LIMITATION`
PRODUCTION_RUNBOOK = `PASS`
POST_DEPLOY_SMOKE_PLAN = `PASS`

MATERIAL_RUNTIME_DEFECTS_FOUND = `YES`
ACCESSIBILITY_DEFECTS = `contrast; heading order; logo accessible name; mobile target size`
EXTERNAL_ACTIONS = `SMTP; backup/PITR; Vercel production controls; alerts; CSP owner decision`

The final scheduled soak continues unchanged. The accessibility findings are
runtime defects, not documentation defects. Repair work must wait for a
deliberate soak-reset decision.

## Latest scheduled evidence

QUALIFYING_SCHEDULED_RUN_4 = `34252651891`
QUALIFYING_RUN_4_NOMINAL_SLOT_UTC = `2026-09-08T12:17:00Z`
QUALIFYING_RUN_4_CRAWL_RUN = `cdef4024-628e-4275-846e-af21efe84eca`
QUALIFYING_RUN_4_HEAD = `32fb580e86c9d490cb0428f291c667f7d5538061`
QUALIFYING_RUN_4_RESULT = `PASS`
QUALIFYING_RUN_4_INVARIANTS = `7/7 sources; 126 fetched; zero unexpected errors; zero publications`
QUALIFYING_RUN_4_ARTIFACT = `staging-soak-summary; retained; sanitized`
QUALIFYING_RUN_COUNT = `4`
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
SOAK_ELAPSED_AT_2026-09-08T16:37:54Z = `22.3h`
QUALIFYING_RUN_1 = `34163605422` - slot `2026-09-07T18:17:00Z`, crawl `2aa12fb7-e011-474b-a3b0-068f52d090bf`, PASS
QUALIFYING_RUN_1_INVARIANTS = `7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications`
QUALIFYING_RUN_2 = `34188114057` - slot `2026-09-08T00:17:00Z`, crawl `898c47d8-2299-414b-a06b-8450c4c49862`, PASS
QUALIFYING_RUN_2_INVARIANTS = `7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications`
QUALIFYING_RUN_3 = `34220598983` - slot `2026-09-08T06:17:00Z`, crawl `196a1bd8-e33b-4bad-b689-d10a8a4b5e40`, PASS
QUALIFYING_RUN_3_INVARIANTS = `7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications`
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

## Current final-100 completion pass

UPDATED_UTC = `2026-09-08`
FINAL_BRANCH = `codex/claimradar-final-100`
FINAL_BASE = `32fb580e86c9d490cb0428f291c667f7d5538061`
FINAL_CANDIDATE_STATUS = `IN_PROGRESS`
ROUTE_INVENTORY = `PASS` - 69 pages, one API source, seven server actions
FINAL_ROUTE_BROWSER_QA = `PENDING_CI_RERUN` - 69 routes across three viewports
ACCESSIBILITY_SOURCE_FIXES = `IMPLEMENTED`
CSP_NONCE_REPAIR = `IMPLEMENTED`
LINT = `PASS`
TYPECHECK = `PASS`
CRAWLER_INVENTORY_ACCEPTANCE = `PASS` - 48 files, 344 tests
AUTH_RUNTIME_CONTRACT = `PASS` - five tests
MIGRATION_CONTRACT = `PASS` - 17 ordered migrations
FULL_TESTS = `PARTIAL` - 553 passed; five checks require production CSS
BUILD = `BLOCKED_LOCAL_ENVIRONMENT` - zero free bytes on C drive
CLIENT_BUNDLE_SECRET_SCAN = `PENDING_FINAL_BUILD`
GLOBAL_FORMAT = `LEGACY_BASELINE_WARNINGS`; scoped candidate files pass
RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HISTORICAL_RUNTIME_FREEZE = `6f22c5ef4119000318218f136f5416987a451877`
PRODUCTION_READY_NOW = `NO`

No release claim is made from this intermediate state. The final candidate
needs remote exact-head build, browser evidence, security evidence, and a new
post-merge staging baseline before soak qualification can begin.

## Current final-candidate verification refresh

UPDATED_UTC = `2026-09-08`
CURRENT_HEAD = `5e65153039c745a371f1b06f360ae6c86bfe0afa`
EXACT_HEAD_CI = `PASS` - GHA run `34276267445`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 207 checks, zero failures, zero axe violations
PUBLIC_AUTH_ROUTE_CHECKS = `123` across desktop, tablet, and mobile
PROTECTED_ROUTE_ENTRIES = `84` - authenticated browser credentials required
EXPECTED_DYNAMIC_404_CHECKS = `12` rendered and intentionally non-published
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge`

Protected browser routes are not represented as unauthenticated passes.
Credentialed staging runtime QA separately passed customer/admin/API and
notification boundaries. The final merge must establish a new freeze.

## Final candidate gate refresh

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `74809dc2b1ec8467484d609a476d1d5095ed957d`
EXACT_HEAD_CI = `PASS` - GHA run `34308913068`
REMOTE_BUILD = `PASS`
REMOTE_TESTS = `PASS`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
PUBLIC_AUTH_ROUTE_CHECKS = `123` across desktop, tablet, and mobile
PROTECTED_ROUTE_ENTRIES = `84` - authenticated browser credentials required
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

## Final candidate gate refresh, latest

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `3aa6eef4fd0f2644a39eff4c0c987c567b1ddadd`
EXACT_HEAD_CI = `PASS` - GHA run `34312344579`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

## Final candidate gate refresh, latest

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `4e0ae8e12b092dc9f61f960e7ede867cc8e0404d`
EXACT_HEAD_CI = `PASS` - GHA run `34311888166`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

## Final candidate gate refresh, latest

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `cb5478e91f0db32fc8e3de6f0206b51a04f46076`
EXACT_HEAD_CI = `PASS` - GHA run `34311512314`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

The local disk limitation does not affect remote evidence. Production remains
untouched until merge, baseline, soak, and deployment approval.

## Final candidate gate refresh, latest

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `7547f34e2d10f52804b65f65befacb747a978cca`
EXACT_HEAD_CI = `PASS` - GHA run `34310073132`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

## Final candidate gate refresh, latest

UPDATED_UTC = `2026-09-09`
CURRENT_HEAD = `817fdf5d5f0465dd425c665ba4bc4763724ba8f1`
EXACT_HEAD_CI = `PASS` - GHA run `34311026621`
VERCEL_EXACT_HEAD = `PASS`
FINAL_ROUTE_BROWSER_QA = `PASS` - 69 routes, 207 checks, zero failures
AXE_VIOLATIONS = `0`
FINAL_CANDIDATE_STATUS = `READY_FOR_FINAL_MERGE_REVIEW`
FINAL_RUNTIME_FREEZE = `PENDING_FINAL_MERGE_AND_BASELINE`
HUMAN_ACTION = `approve final merge of PR #4`

## Final candidate proof-completion refresh, authoritative

UPDATED_UTC = `2026-09-09`
FINAL_HEAD = `17275fc8e25c865942321450d599bda44fe0c0c5`
PR = `#4 OPEN; NOT MERGED`
TOTAL_PAGE_ROUTES = `69`
PUBLIC_AUTH_ROUTES = `41`
PROTECTED_ROUTES = `28`
DESKTOP_ROUTE_CHECKS = `69`
TABLET_ROUTE_CHECKS = `69`
MOBILE_ROUTE_CHECKS = `69`
PUBLIC_AUTH_ROUTE_CHECKS = `123`
PROTECTED_AUTHENTICATED_CHECKS = `84`
UNAUTHENTICATED_BOUNDARY_CHECKS = `1 PASS`
AXE_VIOLATIONS = `0`
PROTECTED_CONSOLE_ERRORS = `0`
PROTECTED_PAGE_ERRORS = `0`
PROTECTED_OVERFLOW_FAILURES = `0`
PRIMARY_INTERACTIONS_DISCOVERED = `11`
PRIMARY_INTERACTIONS_VERIFIED = `11`
MANUAL_KEYBOARD = `PASS`
MANUAL_FOCUS = `PASS`
MANUAL_ZOOM_REFLOW = `PASS`
MANUAL_REDUCED_MOTION = `PASS`
MANUAL_SCREEN_READER_SEMANTICS = `PASS_WITH_DOM_SEMANTICS_METHOD`
MANUAL_FORMS = `PASS`
MANUAL_TARGET_SIZES = `PASS`
ROUTES_WITH_PENDING_VERIFICATION = `0`
STATES_WITH_PENDING_VERIFICATION = `0`
KNOWN_UI_DEFECTS = `0`
KNOWN_ACCESSIBILITY_DEFECTS = `0`
KNOWN_AUTH_DEFECTS = `0`
CI = `PASS` - GHA `34321570779`
PROTECTED_BROWSER_QA = `PASS` - GHA `34320450223`
PROTECTED_BROWSER_QA_RUNTIME_HEAD = `d617fcd375d7d47041316d1c78dc8bcd9c829e34`
PROTECTED_BROWSER_QA_RUNTIME_TREE_UNCHANGED = `YES`
VERCEL_EXACT_HEAD = `READY`
VERCEL_DIRECT_ROUTE_QA = `BLOCKED_BY_DEPLOYMENT_PROTECTION`
WCAG_2_2_AA = `NOT_CLAIMED; DIRECT_ASSISTIVE_TECHNOLOGY_UNVERIFIED`
A_TO_Z_ROUTE_STATE_COVERAGE = `PASS_WITH_VERCEL_PROTECTION_LIMITATION`
MERGE_STATUS = `NOT_PERFORMED`
PRODUCTION_READY_NOW = `NO`

The exact Vercel check is ready. Direct route verification redirects to Vercel
SSO. The protected bypass credential is unavailable here. Merge remains held.

## Final merge and fresh baseline

MERGE_STATUS = `MERGED`

SOURCE_HEAD = `3c064681e4fd65aef4316f491a6050e631670e19`

MAIN_PRE_MERGE_SHA = `32fb580e86c9d490cb0428f291c667f7d5538061`

MERGE_SHA = `7f4834f23f48baeeb871afe3c0594fef9612b677`

MERGE_PARENTS = `32fb580e86c9d490cb0428f291c667f7d5538061`, `3c064681e4fd65aef4316f491a6050e631670e19`

MERGE_TIMESTAMP_UTC = `2026-09-09T07:56:21Z`

RUNTIME_FREEZE_HEAD = `7f4834f23f48baeeb871afe3c0594fef9612b677`

BASELINE_GHA_RUN = `34326475197`

BASELINE_CRAWL_RUN = `8ff537e8-a961-429a-a801-5393aaead1df`

BASELINE_RESULT = `PASS` - 7/7 sources, 126 discovered, 126 fetched, zero crawl errors, zero unexpected errors, zero publications.

BASELINE_DB_EVIDENCE = `PASS` - 7 crawl_run_sources completed, 0 crawl_errors, 13 source_documents retrieved in-window, 0 candidate documents, 0 publication events.

BASELINE_GUARDS = `PASS` - staging, billing off, notifications off, auto-verify off, live adapters on.

BASELINE_ARTIFACT = `staging-soak-summary` retained and sanitized.

RUNTIME_SENSITIVE_DIFF_AFTER_FREEZE = `EMPTY`

FIRST_QUALIFYING_SLOT_UTC = `2026-09-09T12:17:00Z`

FIRST_QUALIFYING_SLOT_IST = `2026-09-09T17:47:00+05:30`

NEXT_4_SLOTS_UTC = `2026-09-09T12:17:00Z`, `2026-09-09T18:17:00Z`, `2026-09-10T00:17:00Z`, `2026-09-10T06:17:00Z`

SOAK_START_UTC = `PENDING_FIRST_QUALIFYING_SCHEDULED_RUN`

SOAK_START_IST = `PENDING_FIRST_QUALIFYING_SCHEDULED_RUN`

SCHEDULE_CRON = `17 */6 * * *`

MANUAL_BASELINE_ACCOUNTING = `EXCLUDED_FROM_SOAK_QUALIFICATION`

SOAK_48H = `PENDING_REAL_ELAPSED_TIME`

SOAK_72H = `PENDING_REAL_ELAPSED_TIME`

PRODUCTION_READY_NOW = `NO - PENDING FINAL SOAK`
