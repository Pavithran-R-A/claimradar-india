# ClaimRadar India Active Completion State

Updated: 2026-09-06

## Repository

- CURRENT_HEAD: `f7a77ee0349078a0dfbe8649d77683feb89e6470`
- CURRENT_MAIN: `f7a77ee0349078a0dfbe8649d77683feb89e6470`
- CURRENT_PHASE: final scheduled soak pending first slot
- BRANCH: `main`
- PR: `#2`, merged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: frozen main baseline crawl
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
- SOAK_START_UTC: pending first genuine scheduled execution
- SOAK_START_IST: pending first genuine scheduled execution
- SCHEDULE_CRON: `17 */6 * * *`
- NEXT_SCHEDULED_SLOT_UTC: `2026-09-06T23:17:00Z`
- NEXT_SCHEDULED_SLOT_IST: `2026-09-07T04:47:00+05:30`
- SOAK_STATE: scheduled; manual runs excluded from qualification

## Next action

Track scheduled runs through the 72-hour window.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.
- Merged PR #2 with evidence-sensitive history preserved.
- Added frozen-main baseline evidence and soak monitor.

## External blockers

- Final soak requires real elapsed time.
