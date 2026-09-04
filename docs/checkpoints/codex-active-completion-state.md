# ClaimRadar India Active Completion State

Updated: 2026-09-04

## Repository

- CURRENT_HEAD: `5e027700d60b1c06f9cbda285f7b009a6c32b228`
- CURRENT_MAIN: `fc14de90783587013e692a70281ea88b8c3920f5`
- CURRENT_PHASE: takeover verification and drift reconciliation
- BRANCH: `codex/claimradar-completion`
- PR: `#2`, draft, unmerged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: exact-target guard and release CI
- CI_STATE: exact head passed run `33837672749`
- VERCEL_STATE: exact head deployment is READY
- SUPABASE_STATE: staging schema and registry verified read-only
- PRE_SOAK_STATE: blocked by staging secret target mismatch
- SOAK_STATE: run `33837926250` failed closed before crawl

## Next action

Correct staging workflow secrets, then rerun.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.

## External blockers

- GitHub staging secrets target another Supabase project.
- Final merge requires explicit human approval.
- Final soak requires real elapsed time.
