# ClaimRadar India Active Completion State

Updated: 2026-09-04

## Repository

- CURRENT_HEAD: `3a02277807c77322ebdab6d4e597defde90a80bb`
- CURRENT_MAIN: `fc14de90783587013e692a70281ea88b8c3920f5`
- CURRENT_PHASE: post pre-soak runtime qualification
- BRANCH: `codex/claimradar-completion`
- PR: `#2`, draft, unmerged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: correct-target pre-soak and DB corroboration
- CI_STATE: exact head passed run `33838263155`
- VERCEL_STATE: exact head deployment is READY
- SUPABASE_STATE: target ref verified; run data corroborated
- PRE_SOAK_STATE: PASS, workflow run `33840659144`
- CRAWL_RUN_ID: `b24296a6-f586-4575-95cb-e763346e589e`
- PRE_SOAK_COUNTS: 7 sources, 126 found, 123 stored, 21 candidates
- PRE_SOAK_ERRORS: zero crawl errors and zero unexpected errors
- POLICY_GUARDS: staging, billing off, notifications off, live adapters on
- AUTH_STATE: unverified; disposable signup hit Auth email rate limit
- CUSTOMER_STATE: unverified; credentialed session unavailable
- ADMIN_STATE: unverified; staff session unavailable
- API_STATE: unverified; credentialed runtime unavailable
- NOTIFICATIONS_STATE: unverified; safe user-scoped runtime unavailable
- SECURITY_STATE: zero Security Advisor lints
- PERFORMANCE_STATE: expected unused-index and policy-performance notices
- SOAK_STATE: pending merge, freeze, and genuine scheduled elapsed time

## Next action

Obtain credentialed runtime test access, then continue.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.

## External blockers

- Supabase Auth email rate limiting blocks test signup.
- No disposable authenticated session currently exists.
- Staff runtime requires a trusted admin identity.
- Final merge requires explicit human approval.
- Final soak requires real elapsed time.
