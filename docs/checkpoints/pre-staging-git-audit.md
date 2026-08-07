# Pre-Staging Git Audit � Commit b495cd4

## Summary

- **Commit Hash:** 495cd40d34ea5c3776e4c2f34ed8bbdb39613c0
- **Branch:** qoder/complete-claimradar
- **Author:** ClaimRadar Developer <dev@claimradar.in>
- **Date:** Fri Aug 7 13:33:23 2026 +0530

## Scope of Changes

Commit 495cd4 contains 19 modified/added files across crawler, scripts, pgTAP tests, and documentation:

1. pps/crawler/src/pipeline/index.ts: Updated sourceFilter logic to match source ID, adapter name, or name substring.
2. scripts/verify-local-database-ingestion.mjs: Updated import path to relative package output (../packages/database/dist/index.js).
3. scripts/verify-local-live-source-idempotency.mjs: Updated import path and count helper to support composite primary key tables; explicitly passed SUPABASE_SERVICE_ROLE_KEY.
4. supabase/tests/009_notifications_rls.test.sql: Added pgTAP test file validating migration 011 notification tables and RLS isolation.
5. Markdown audit reports & test runner scripts formatted cleanly by Prettier (pnpm format:fix).

## Secret & Privacy Inspection

- **Secrets / API Keys / Passwords:** NONE found. All code references process.env.SUPABASE_SERVICE_ROLE_KEY dynamically.
- **Forbidden Files (.env,
  ode_modules, .next, supabase/.temp):** NONE included.
- **Git Diff Hygiene (git diff b495cd4^..b495cd4 --check):** PASS � 0 trailing whitespace or format errors detected.

## Audit Verdict

PRE_STAGING_GIT_AUDIT = PASS
No secrets or accidental build artifacts were committed. The repository commit history is safe for staging.
