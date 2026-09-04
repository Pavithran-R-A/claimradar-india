# ClaimRadar India Active Completion State

Updated: 2026-09-04

## Repository

- CURRENT_HEAD: `25e3af667adbcc487c086832dd39cc08106f3552`
- CURRENT_MAIN: `fc14de90783587013e692a70281ea88b8c3920f5`
- CURRENT_PHASE: takeover verification and drift reconciliation
- BRANCH: `codex/claimradar-completion`
- PR: `#2`, draft, unmerged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Evidence

- LAST_COMPLETED_GATE: remote branch alignment and Supabase drift recovery
- CI_STATE: prior exact-head evidence exists; new head needs CI after push
- VERCEL_STATE: prior exact-head Preview evidence exists; new head needs redeployment
- SUPABASE_STATE: staging reachable through authorized Supabase connector
- PRE_SOAK_STATE: blocked until staging runtime crawl and browser access
- SOAK_STATE: not started for this completion candidate

## Next action

Run the Node 24 local gates.

## Known internal defects

- Migration 017 was missing from Git.
- Migration contract expected only 016 versions.

## External blockers

- Authenticated Preview SSO may require human interaction.
- Final merge requires explicit human approval.
- Final soak requires real elapsed time.
