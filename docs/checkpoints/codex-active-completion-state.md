# ClaimRadar India Active Completion State

Updated: 2026-09-07

## Repository

- CURRENT_HEAD: `e278ce8f580fabfa6e0258c582712ab2068b672f`
- CURRENT_MAIN: `e278ce8f580fabfa6e0258c582712ab2068b672f`
- CURRENT_PHASE: final scheduled soak in progress
- BRANCH: `main`
- PR: `#2`, merged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: second qualifying scheduled soak crawl
- SOURCE_HEAD: `4a2fa8230b1418e8a109de3d543bbc2562ff158f`
- MAIN_PRE_MERGE_SHA: `fc14de90783587013e692a70281ea88b8c3920f5`
- MERGE_SHA: `f7a77ee0349078a0dfbe8649d77683feb89e6470`
- MERGE_PARENTS: `fc14de90783587013e692a70281ea88b8c3920f5`, `4a2fa8230b1418e8a109de3d543bbc2562ff158f`
- MERGE_TIMESTAMP_UTC: `2026-09-06T14:09:30Z`
- MERGE_TIMESTAMP_IST: `2026-09-06T19:39:30+05:30`
- CI_STATE: exact source head passed run `33969160473`
- VERCEL_STATE: exact head deployment is READY
- SUPABASE_STATE: target ref verified; run data corroborated
- PRE_SOAK_STATE: PASS, workflow run `33840659144`
- BASELINE_GHA_RUN: `34038342122`
- BASELINE_CRAWL_RUN: `afc0ddfd-e65c-4b03-aaa8-be8537a5fc94`
- BASELINE_RESULT: PASS, frozen main head verified
- BASELINE_COUNTS: 7 sources, 126 found, 0 candidates
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
- RUNTIME_FREEZE_HEAD: `f7a77ee0349078a0dfbe8649d77683feb89e6470`
- SOAK_START_UTC: `2026-09-06T18:17:00Z`
- SOAK_START_IST: `2026-09-06T23:47:00+05:30`
- SOAK_START_RUN: `34058094014`
- SOAK_START_CRAWL_RUN: `539dfcc6-8f4d-41c8-bb83-1092d2dd53d2`
- QUALIFYING_SCHEDULED_RUN_1: `34058094014`, slot `2026-09-06T18:17:00Z`, crawl `539dfcc6-8f4d-41c8-bb83-1092d2dd53d2`, PASS
- QUALIFYING_SCHEDULED_RUN_2: `34084538536`, slot `2026-09-07T00:17:00Z`, crawl `4ea1eaab-f549-4174-982c-a96bde06d296`, PASS
- QUALIFYING_RUN_INVARIANTS: both runs 7/7 sources, 126 documents, zero errors, zero unexpected errors, zero publications
- SOAK_ELAPSED_AT_LAST_CHECK_UTC: `2026-09-07T05:48:12Z` (`11.5h`)
- SOAK_48H: `PENDING_TIME_SOAK` - first qualifying slot plus 2 valid scheduled runs
- SOAK_72H: `PENDING_TIME_SOAK` - first qualifying slot plus 2 valid scheduled runs
- SCHEDULE_CRON: `17 */6 * * *`
- FIRST_SCHEDULED_SLOT_UTC: `2026-09-06T18:17:00Z`
- FIRST_SCHEDULED_SLOT_IST: `2026-09-06T23:47:00+05:30`
- NEXT_4_SCHEDULED_SLOTS_UTC: `2026-09-07T00:17:00Z`, `2026-09-07T06:17:00Z`, `2026-09-07T12:17:00Z`, `2026-09-07T18:17:00Z`
- SCHEDULED_RUN_34042559516: `PRE_FREEZE_NOMINAL_SLOT`, started `2026-09-06T15:31:11Z`
- SCHEDULED_RUN_34042559516_NOMINAL_SLOT: `2026-09-06T12:17:00Z`
- SCHEDULED_RUN_34042559516_QUALIFICATION: `EXCLUDED_FROM_FINAL_SOAK_QUALIFICATION`
- SCHEDULED_RUN_34042559516_PERMANENT_ACCOUNTING: excluded from all final soak counts
- SLOT_ACCOUNTING_STATE: delayed pre-freeze scheduled run excluded
- BASELINE_ACCOUNTING: workflow_dispatch baseline remains baseline-only
- SOAK_RESTART_REQUIRED: `NO` - accounting-only correction; runtime freeze preserved
- RUNTIME_SENSITIVE_DIFF: `EMPTY` - accounting helper, tests, and checkpoint docs only
- SOAK_STATE: active; manual runs excluded from qualification

## Next action

Track genuine scheduled runs through the 72-hour window.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.
- Merged PR #2 with evidence-sensitive history preserved.
- Added frozen-main baseline evidence and soak monitor.
- Corrected POSIX cron slot accounting before the first scheduled run.
- Classified delayed run `34042559516` against nominal slot `12:17Z`.
- Started qualification at run `34058094014` nominal slot `18:17Z`.
- Corrected elapsed-soak origin to first qualifying slot.

## External blockers

- Final soak requires real elapsed time.
