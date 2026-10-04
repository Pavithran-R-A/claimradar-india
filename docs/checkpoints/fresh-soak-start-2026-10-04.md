# ClaimKhoj Fresh Soak Observation — 2026-10-04

## Purpose

Start a new observation-only 48–72 hour staging soak from the current customer-live codebase.

## Baseline policy

- Historical soak evidence remains historical and is not reclassified.
- Runtime base before this operations-only reset: `4e6f172835a4ed2cf6ccbc731ae74ce4c08c3878`.
- The start-trigger merge changes only GitHub Actions orchestration and this marker; it does not change application/crawler runtime behavior.
- The push-triggered run is a fresh baseline/probe only.
- Fresh scheduled observation credit starts with the first subsequent genuine `schedule` event that passes all soak acceptance invariants.
- The existing six-hour schedule remains `17 */6 * * *`.

## Locked safety guards

- `APP_ENV=staging`
- `EXPECTED_STAGING_SUPABASE_PROJECT_REF=upvsfqufkywlpibbwrse`
- `AUTO_VERIFY_CLAIMABLES=false`
- `ENABLE_BILLING=false`
- `NOTIFY_CUSTOMERS_ENABLED=false`
- `LIVE_ADAPTERS_ENABLED=true`
- staging runs must publish zero records

## Acceptance

A qualifying run must attempt at least one source, have all attempted sources succeed, fetch documents, record zero crawl errors, record zero unexpected errors, publish zero records, and retain the locked policy guards.
