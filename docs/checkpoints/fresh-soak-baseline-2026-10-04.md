# ClaimKhoj Fresh Soak Baseline — 2026-10-04

## Status

```ini
FRESH_SOAK_BASELINE = PASS
OBSERVATION_MODE = ACTIVE
RUNTIME_FREEZE_HEAD = faedec687989a5de2b47ed1bff933db04d3975b3
BASELINE_GHA_RUN = 37186623270
BASELINE_CRAWL_RUN = 517d1604-14bd-4cc3-b57a-88db821da1b4
BASELINE_COMPLETED_UTC = 2026-10-04T07:49:07.427Z
FIRST_ELIGIBLE_SCHEDULED_SLOT_UTC = 2026-10-04T12:17:00.000Z
FIRST_ELIGIBLE_SCHEDULED_SLOT_IST = 2026-10-04T17:47:00+05:30
SCHEDULE = 17 */6 * * *
```

## Baseline evidence

Fresh baseline GitHub Actions run `37186623270` completed successfully on exact head
`faedec687989a5de2b47ed1bff933db04d3975b3`.

The workflow passed:

- workspace build;
- crawler test suite;
- staging preflight policy gate;
- real staging crawl;
- post-crawl soak acceptance gate;
- sanitized summary artifact upload.

Crawl `517d1604-14bd-4cc3-b57a-88db821da1b4` produced:

| Metric               |      Baseline |
| -------------------- | ------------: |
| Sources              | 7/7 succeeded |
| Documents discovered |           126 |
| Documents fetched    |           126 |
| Duplicates           |            28 |
| Candidates created   |            17 |
| AI calls             |             0 |
| Records published    |             0 |
| Records queued       |            17 |
| Crawl errors         |             0 |
| Unexpected errors    |             0 |
| Duration             |     264.748 s |

## Locked safety posture

The successful baseline recorded:

- `APP_ENV=staging`;
- `AUTO_VERIFY_CLAIMABLES=false`;
- `ENABLE_BILLING=false`;
- `NOTIFY_CUSTOMERS_ENABLED=false`;
- `LIVE_ADAPTERS_ENABLED=true`.

The staging target remains Supabase project `upvsfqufkywlpibbwrse`.

## Observation accounting

This push-triggered execution is baseline/probe evidence only. It does **not** receive scheduled-soak
credit. Fresh observation credit starts with the first subsequent genuine `schedule` event that passes
all acceptance invariants.

The first eligible nominal slot is `2026-10-04T12:17:00Z` (17:47 IST). The observation continues every
six hours thereafter. The 48-hour and 72-hour gates require real elapsed time and qualifying scheduled
runs; they must not be inferred from the baseline itself.

The earlier 2026-09 soak evidence remains historical and is not rewritten as part of this reset.

## Bootstrap cleanup

The temporary path-scoped push trigger used to create this baseline is removed after this successful
baseline. The normal six-hour schedule and manual `workflow_dispatch` controls remain.
