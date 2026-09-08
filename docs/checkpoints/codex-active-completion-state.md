# ClaimRadar India Active Completion State

Updated: 2026-09-07

## Repository

- CURRENT_HEAD: `6f22c5ef4119000318218f136f5416987a451877`
- CURRENT_MAIN: `6f22c5ef4119000318218f136f5416987a451877`
- CURRENT_PHASE: new final scheduled soak in progress
- BRANCH: `main`
- PR: `#2` completion merged; `#3` runtime repair merged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: repaired-main manual baseline
- REPAIR_SOURCE_HEAD: `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
- REPAIR_MAIN_PRE_MERGE_SHA: `7504f303099491132a804f723699197fa6334d8f`
- REPAIR_MERGE_SHA: `6f22c5ef4119000318218f136f5416987a451877`
- REPAIR_MERGE_PARENTS: `7504f303099491132a804f723699197fa6334d8f`, `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
- REPAIR_MERGE_TIMESTAMP_UTC: `2026-09-07T15:31:12Z`
- REPAIR_CI_STATE: exact repair head passed run `34138348817`
- REPAIR_VERCEL_STATE: exact repair Preview is READY
- SUPABASE_STATE: target ref verified; run data corroborated
- PRE_SOAK_STATE: PASS, workflow run `33840659144`
- BASELINE_GHA_RUN: `34138764303` (manual baseline)
- BASELINE_CRAWL_RUN: `0fe7626a-3332-403d-b3d4-d66db3ddefb9`
- BASELINE_RESULT: PASS, repaired frozen main head verified
- BASELINE_COUNTS: 7 sources, 126 discovered, 126 fetched, 110 duplicates, 0 candidates
- BASELINE_ERRORS: zero crawl errors and zero unexpected errors
- BASELINE_PUBLICATIONS: zero automatic publications
- POLICY_GUARDS: staging, billing off, notifications off, live adapters on
- AUTH_STATE: PASS; Auth Admin API created three confirmed disposable users
- CUSTOMER_STATE: PASS; onboarding ownership and cross-user isolation verified
- ADMIN_STATE: PASS; admin surfaces verified, normal users blocked
- API_STATE: PASS; credentialed Auth and PostgREST runtime verified
- NOTIFICATIONS_STATE: PASS; ownership, read, dedup, and delivery privacy verified
- SECURITY_STATE: zero Security Advisor lints
- PERFORMANCE_STATE: expected unused-index and policy-performance notices
- AUTH_RUNTIME_RUN: `33968830120`, all stages passed, three users deleted
- CLEANUP_STATE: zero disposable profiles, onboarding rows, notifications, or delivery rows
- RUNTIME_FREEZE_HEAD: `6f22c5ef4119000318218f136f5416987a451877`
- RUNTIME_SENSITIVE_DIFF_AFTER_FREEZE: `EMPTY`
- SOAK_START_UTC: `2026-09-07T18:17:00Z`
- SOAK_START_IST: `2026-09-07T23:47:00+05:30`
- SOAK_START_RUN: `34163605422`
- SOAK_START_CRAWL_RUN: `2aa12fb7-e011-474b-a3b0-068f52d090bf`
- OLD_SOAK_STATE: `INVALIDATED_AFTER_RUNTIME_DEFECT`
- FAILED_SCHEDULED_RUN: `34123292686`, crawl `8aee683a-73d1-43d5-85a3-5266f9614c80`, IBBI U+0000 persistence failure
- INVALIDATED_PRIOR_QUALIFYING_RUNS: `34058094014`, `34084538536`
- NEW_FIRST_QUALIFYING_SLOT_UTC: `2026-09-07T18:17:00Z`
- NEW_FIRST_QUALIFYING_SLOT_IST: `2026-09-07T23:47:00+05:30`
- QUALIFYING_SCHEDULED_RUN_1: `34163605422`, slot `2026-09-07T18:17:00Z`, crawl `2aa12fb7-e011-474b-a3b0-068f52d090bf`, PASS
- QUALIFYING_RUN_1_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- QUALIFYING_SCHEDULED_RUN_2: `34188114057`, slot `2026-09-08T00:17:00Z`, crawl `898c47d8-2299-414b-a06b-8450c4c49862`, PASS
- QUALIFYING_RUN_2_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- QUALIFYING_SCHEDULED_RUN_3: `34220598983`, slot `2026-09-08T06:17:00Z`, crawl `196a1bd8-e33b-4bad-b689-d10a8a4b5e40`, PASS
- QUALIFYING_RUN_3_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- SOAK_ELAPSED_AT_2026-09-08T16:37:54Z: `22.3h`
- SOAK_48H: `PENDING_TIME_SOAK` - three valid scheduled runs
- SOAK_72H: `PENDING_TIME_SOAK` - three valid scheduled runs
- SCHEDULE_CRON: `17 */6 * * *`
- FIRST_SCHEDULED_SLOT_UTC: `2026-09-07T18:17:00Z`
- FIRST_SCHEDULED_SLOT_IST: `2026-09-07T23:47:00+05:30`
- NEXT_4_SCHEDULED_SLOTS_UTC: `2026-09-08T00:17:00Z`, `2026-09-08T06:17:00Z`, `2026-09-08T12:17:00Z`, `2026-09-08T18:17:00Z`
- SCHEDULED_RUN_34042559516: `PRE_FREEZE_NOMINAL_SLOT`, started `2026-09-06T15:31:11Z`
- SCHEDULED_RUN_34042559516_NOMINAL_SLOT: `2026-09-06T12:17:00Z`
- SCHEDULED_RUN_34042559516_QUALIFICATION: `EXCLUDED_FROM_FINAL_SOAK_QUALIFICATION`
- SCHEDULED_RUN_34042559516_PERMANENT_ACCOUNTING: excluded from all final soak counts
- SLOT_ACCOUNTING_STATE: delayed pre-freeze scheduled run excluded
- BASELINE_ACCOUNTING: workflow_dispatch baseline remains baseline-only
- SOAK_RESTART_REQUIRED: `YES` - runtime defect invalidated prior soak
- RUNTIME_SENSITIVE_DIFF: `REPAIR_REQUIRED` before new freeze; `EMPTY` after `6f22c5e`
- BASELINE_ACCOUNTING: workflow_dispatch run `34138764303` remains baseline-only
- SOAK_STATE: active; manual runs excluded from qualification

## Next action

Track genuine scheduled runs through the 72-hour window.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.
- Merged PR #2 with evidence-sensitive history preserved.
- Fixed IBBI PDF U+0000 persistence in PR #3.
- Merged PR #3; established new runtime freeze `6f22c5e`.
- Baseline run `34138764303` passed from repaired main.
- Added frozen-main baseline evidence and soak monitor.
- Corrected POSIX cron slot accounting before the first scheduled run.
- Classified delayed run `34042559516` against nominal slot `12:17Z`.
- Previously started qualification at run `34058094014` nominal slot `18:17Z`; later invalidated.
- Corrected elapsed-soak origin to first qualifying slot.
- Invalidated old soak after scheduled runtime defect run `34123292686`.

## External blockers

- New final soak requires real elapsed time.
