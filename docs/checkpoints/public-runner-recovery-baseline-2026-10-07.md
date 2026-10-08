# ClaimKhoj public-runner recovery baseline — 2026-10-07

## Decision

A new fresh observation baseline is established after the repository was temporarily made public.

The earlier 2026-10-04 baseline is preserved as historical evidence but is **not** used to claim
continuous 48–72 hour observation because several scheduled jobs later failed before any runner step
started while the repository was private and the account's GitHub Actions quota was exhausted.

## Recovery proof

- GitHub Actions run: `37511309872`
- Successful rerun attempt: 2
- Head: `1e3f1e79d093af7d67e08c5a61dfca09335cc79b`
- Crawl run: `0378cbaa-7ea7-4fbe-b1f0-4ae647507d3d`
- Crawl start: `2026-10-07T06:04:07.435Z`
- Crawl completion / fresh baseline start: `2026-10-07T06:08:02.471Z`
- First post-baseline nominal scheduled slot: `2026-10-07T06:17:00.000Z`

The same previously failing scheduled job obtained a normal GitHub-hosted runner after the repository
became public. Checkout, dependency setup, build, crawler tests, Supabase preflight, live staging crawl,
post-crawl acceptance, and sanitized artifact upload all passed.

## Crawl result

| Metric               |        Result |
| -------------------- | ------------: |
| Sources              | 7/7 succeeded |
| Documents discovered |           126 |
| Documents fetched    |           126 |
| Duplicates           |           122 |
| Candidates created   |             0 |
| AI calls             |             0 |
| Records published    |             0 |
| Records queued       |             0 |
| Crawl errors         |             0 |
| Unexpected errors    |             0 |
| Duration             |     235.036 s |

Safety posture remained locked:

- `APP_ENV=staging`
- `AUTO_VERIFY_CLAIMABLES=false`
- `ENABLE_BILLING=false`
- `NOTIFY_CUSTOMERS_ENABLED=false`
- `LIVE_ADAPTERS_ENABLED=true`

## Accounting

No failed pre-runner slot from the private/quota-blocked period receives soak credit.
The fresh observation clock starts from this recovered baseline and only qualifying subsequent
scheduled runs count toward the 48-hour and 72-hour gates.
