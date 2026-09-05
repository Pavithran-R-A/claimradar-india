# ClaimRadar India Active Completion State

Updated: 2026-09-05

## Repository

- CURRENT_HEAD: `e376f9341f534b4d70956c440d175d1b026b3991`
- CURRENT_MAIN: `fc14de90783587013e692a70281ea88b8c3920f5`
- CURRENT_PHASE: post credentialed runtime qualification
- BRANCH: `codex/claimradar-completion`
- PR: `#2`, draft, unmerged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: credentialed staging runtime and cleanup
- CI_STATE: exact head passed run `33968827983`
- VERCEL_STATE: exact head deployment is READY
- SUPABASE_STATE: target ref verified; run data corroborated
- PRE_SOAK_STATE: PASS, workflow run `33840659144`
- CRAWL_RUN_ID: `b24296a6-f586-4575-95cb-e763346e589e`
- PRE_SOAK_COUNTS: 7 sources, 126 found, 123 stored, 21 candidates
- PRE_SOAK_ERRORS: zero crawl errors and zero unexpected errors
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
- SOAK_STATE: pending approved merge, freeze, and genuine scheduled elapsed time

## Next action

Obtain explicit merge approval, then run the final soak.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.

## External blockers

- Final merge requires explicit human approval.
- Final soak requires real elapsed time.
