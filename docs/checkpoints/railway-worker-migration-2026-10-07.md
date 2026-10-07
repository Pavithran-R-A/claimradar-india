# ClaimKhoj Railway Worker Migration Evidence — 2026-10-07

## Purpose

Move the recurring staging crawl/soak workload from scheduled GitHub-hosted runners to a short-lived Railway worker while keeping the existing Supabase staging safety posture.

## Railway runtime

- Project: `ClaimKhoj Soak Worker`
- Service: `claimkhoj-soak`
- Environment: `production`
- Runtime limit: 1 vCPU / 1 GB RAM
- Restart policy: `NEVER`
- Build scope: crawler and its workspace dependencies only
- Runtime entrypoint: `node scripts/run-railway-soak.mjs`
- Target Supabase project: `upvsfqufkywlpibbwrse`

The worker does not receive a Supabase service-role or secret key. Railway authenticates to a narrow Supabase Edge Function with a dedicated worker token; privileged database access remains inside Supabase.

## Dry-run qualification

Two real-source dry runs completed before live database access was enabled.

The final clean-exit dry run proved:

- 7/7 sources succeeded.
- 126 documents were discovered and fetched.
- Zero crawl errors occurred.
- Zero records were published.
- Peak memory remained below 0.30 GB during qualification.
- The worker exited after completion with no running replica left behind.

## Live staging qualification

Railway deployment `e24bab9e-3196-477f-8400-eb678a5e0310` executed the live staging path through the authenticated database gateway.

Crawl run: `88fd8c31-689a-4abe-8cdf-5b4be54e2a0e`.

| Metric | Result |
| --- | ---: |
| Sources | 7/7 succeeded |
| Documents discovered | 126 |
| Documents fetched | 126 |
| Candidates created | 0 |
| AI calls | 0 |
| Records published | 0 |
| Records queued | 0 |
| Crawl errors | 0 |
| Unexpected errors | 0 |
| Duration | 186.252 s |

The portable soak acceptance gate passed after the crawl.

Independent Supabase SQL verification confirmed:

- the crawl run status is `completed`;
- `sources_attempted = 7`;
- `sources_succeeded = 7`;
- all seven `crawl_run_sources` rows are `completed`;
- `crawl_errors = 0`.

## Locked safety posture

The Railway preflight and crawl retained:

- `APP_ENV=staging`;
- `EXPECTED_STAGING_SUPABASE_PROJECT_REF=upvsfqufkywlpibbwrse`;
- `AUTO_VERIFY_CLAIMABLES=false`;
- `ENABLE_BILLING=false`;
- `NOTIFY_CUSTOMERS_ENABLED=false`;
- `LIVE_ADAPTERS_ENABLED=true`;
- `AI_PROVIDER=none`.

## Scheduler promotion rule

Railway Cron is not enabled until the migration PR passes repository CI and is merged to `main`. After merge, Railway will be pinned back to `main`, the six-hour cron will be enabled, and a fresh Railway-based observation baseline will be recorded. The old GitHub-scheduled observation window will not be credited across this runtime migration.
