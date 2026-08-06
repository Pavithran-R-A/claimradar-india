# Crawler Operations

## CLI Commands

The crawler CLI is invoked via `pnpm` scripts or directly from the built output. All commands support the `--dry-run` flag.

### daily

Run the full crawl pipeline across all enabled sources.

```bash
pnpm crawler:daily              # normal run
pnpm crawler:daily -- --dry-run # dry-run (no DB writes, no AI calls)
```

This runs discover → fetch → dedup → score → AI → validate → publish for every enabled source. Exit code is `1` if any errors occurred, `0` on clean success.

### source

Run the pipeline for a single source only.

```bash
pnpm crawler:source -- --source=pib-rss
pnpm crawler:source -- --source=sebi-rss --dry-run
```

Useful for debugging a specific source without running the full pipeline.

### health

Run source health checks against all enabled sources without processing documents.

```bash
pnpm crawler:health
```

For each source, outputs:

```
PIB RSS: OK (234ms)
SEBI RSS: OK (189ms)
RBI RSS: FAIL [TIMEOUT] (5002ms) - Connection timeout
```

Behavior details:

- Uses `dryRun: true` internally — it makes real HTTP requests but does not write document data or consume AI budget.
- Every failure is classified into a stable category (`DNS_ERROR`, `TLS_ERROR`, `TIMEOUT`, `CONNECTION_ERROR`, `HTTP_4XX`, `HTTP_5XX`, `PARSE_ERROR`, `RATE_LIMITED`, `DATABASE_ERROR`, `AI_PROVIDER_ERROR`, `CONFIGURATION_ERROR`, `UNKNOWN`) — see `observability/failure-categories.ts`.
- Each check result is persisted to `source_health_events` when database credentials are available (best-effort; persistence errors are logged, not fatal).
- A deduplicated structured alert line is emitted per failing source (`ALERT_SINK=log`).
- Prints a sanitized machine-readable summary (counts and categories only — no URLs, no credentials).
- **Exits non-zero when any source fails** — this is the alerting signal used by the Source Health Check workflow.

### crawl-status

Missed-run detection: verifies that a successful crawl run exists inside the expected window.

```bash
pnpm crawler:crawl-status                            # default threshold: 26h
pnpm crawler:crawl-status -- --max-age-hours 30
```

Queries `crawl_runs` for the most recent run and the most recent run with status `completed` / `completed_with_errors`, then prints a JSON verdict:

```json
{
  "type": "crawl-status",
  "verdict": "ok | stale | never_ran",
  "alert": false,
  "lastSuccessAt": "2026-08-06T00:19:41Z",
  "ageHours": 12.4,
  "maxAgeHours": 26,
  "reason": "..."
}
```

Exits `1` when the verdict is `stale` or `never_ran`. The Source Health Check workflow runs this on its own schedule, so a skipped/broken daily crawl becomes visible within at most one health-check interval.

### reprocess

Reprocess a specific document through the pipeline.

```bash
pnpm crawler:reprocess -- --document=<document-id>
```

Re-runs AI extraction, validation, scoring, and the publication decision for one already-ingested document, and records a new `ai_runs` row.

### retry-queued

Retry all deferred/failed candidates (`ai_extraction_status` in `deferred`, `failed`).

```bash
pnpm crawler:retry-queued
```

Reprocesses candidates that were deferred due to AI budget exhaustion or provider unavailability, respecting the configured budget for the current run.

### --dry-run flag

Available on all commands. When set:

- No database records are created or modified
- No AI budget is consumed
- Real HTTP requests are still made (adapters still fetch)
- Pipeline logic (dedup, scoring, validation) runs in-memory
- Summary output is still printed

## GitHub Actions

All three workflows pin Node via the committed `.node-version` file (24) and pnpm via the exact `packageManager` field in the root `package.json` (`pnpm@11.20.0`, matching `pnpm-lock.yaml`). All installs use `pnpm install --frozen-lockfile`.

> **Hosting blocker:** this repository currently has **no git remote configured**. GitHub `schedule` triggers only fire on hosted repositories, so the daily/weekly schedules cannot execute until the repo is pushed to GitHub. The YAML is written to be correct once hosted; see `docs/deployment-readiness.md`.

### daily-crawl.yml

**Schedule**: `17 0 * * *` — runs at 00:17 UTC daily (non-round minute to reduce GitHub runner contention).

**Steps**:

1. Checkout code
2. Setup Node.js (`.node-version`) + pnpm (`packageManager` pin)
3. Install dependencies (`--frozen-lockfile`, cached)
4. Run crawler tests (`pnpm --filter @claimradar/crawler test`)
5. Preflight policy gate (`pnpm crawler:preflight -- --environment=staging`) — refuses if `AUTO_VERIFY_CLAIMABLES` or `ENABLE_BILLING` is ever true
6. Run daily crawl (`pnpm crawler:daily`, or `crawler:source` when a single source is selected)
7. Publish sanitized job summary (whitelisted counters + source ids only — never URLs, tokens, or raw error text)
8. Upload `crawl-summary.json` artifact

**Concurrency**: Group `daily-crawl` with `cancel-in-progress: false` — a running crawl is never cancelled by a new trigger; overlapping triggers queue.

**Timeout**: 30 minutes.

**Environment**: `environment: staging` — secrets resolve from the GitHub `staging` environment only. Production credentials must never be added there.

**Secret handling**: secrets are injected only as step-scoped env vars, never interpolated into shell text; dispatch inputs are passed through env to prevent script injection; `permissions: contents: read`.

**Environment variables**:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — from staging environment secrets
- `AI_PROVIDER` — from vars (default: `none`)
- `OPENROUTER_API_KEY`, `NVIDIA_API_KEY` — from secrets
- `AI_DAILY_REQUEST_BUDGET` — from vars (default: `40`)
- `SENTRY_DSN` — from secrets (optional)
- `LIVE_ADAPTERS_ENABLED` — set to `true`
- `CRAWLER_SUMMARY_FILE=crawl-summary.json` — machine-readable summary for artifact/job summary
- Pinned safety guards (never sourced from vars/secrets): `AUTO_VERIFY_CLAIMABLES=false`, `ENABLE_BILLING=false`, `NOTIFY_CUSTOMERS_ENABLED=false`, `APP_ENV=staging`

### source-health.yml

**Schedule**: `43 2 * * 1` — runs at 02:43 UTC every Monday (weekly).

**Steps**:

1. Checkout code
2. Setup Node.js (`.node-version`) + pnpm (`packageManager` pin)
3. Install dependencies (`--frozen-lockfile`, cached)
4. Run source health checks (`pnpm crawler:health`) — categorized failures, persisted `source_health_events`, non-zero exit on any failure
5. Missed-run detection (`pnpm crawler:crawl-status -- --max-age-hours <n>`, runs even if step 4 failed) — fails the workflow when no successful crawl exists inside the window
6. Publish sanitized job summary

**Concurrency**: group `source-health`, `cancel-in-progress: false`. **Timeout**: 20 minutes. **Environment**: `staging`.

This workflow does **not** make AI calls. It only tests source availability and feed validity.

### Missed-run detection strategy

GitHub schedules are best-effort (delays, skips on inactive repos), so the system does not trust the scheduler to prove itself. Instead:

1. Every daily crawl records a `crawl_runs` row with a terminal status.
2. The weekly (or manually triggered) source-health workflow queries the last successful run and fails if it is older than `max_age_hours` (default 26h = 24h period + 2h grace).
3. A failed scheduled workflow produces GitHub's native failure notifications to watchers — no external alert credentials required.

Between hosting the repo and the first health run, operators can run `pnpm crawler:crawl-status` locally against staging at any time.

## Triggering Manual Runs

Both workflows support `workflow_dispatch`:

### Daily Crawl (manual)

1. Go to **Actions → Daily Crawl → Run workflow**
2. Optionally set `dry_run` to `true` (no DB writes, no publishing)
3. Optionally set `source` to a single source id (e.g. `sebi-rss`)
4. Click **Run workflow**

When `dry_run` is `true`, the crawl command receives `--dry-run` and no database writes occur.

### Source Health Check (manual)

1. Go to **Actions → Source Health Check → Run workflow**
2. Optionally set `max_age_hours` for the missed-run threshold (default `26`)
3. Click **Run workflow**

## Monitoring

### Structured JSON Logs

The crawler uses a structured logger (`observability/logger.ts`) that outputs JSON-formatted log entries:

```json
{
  "level": "info",
  "stage": "discover",
  "message": "Discovered 12 documents",
  "sourceId": "pib-rss",
  "runId": "abc-123"
}
```

Log levels: `debug`, `info`, `warn`, `error`.

Key stages logged: `discover`, `dedup`, `scoring`, `ai`, `candidate`, `source`, `pipeline`, `document`.

### Run Summaries

At the end of every run, two summary formats are printed:

**Text summary** (human-readable):

```
=== Crawl Run abc-123 ===
Duration:      45.2s
Sources:       4/4 succeeded, 0 failed
Documents:     47 discovered, 42 fetched
               5 unchanged, 31 duplicates
Candidates:    3 created
AI calls:      3 used, 0 failed
Publications:  0 published, 3 queued, 0 rejected
Errors:        0
Per-source:
  pib-rss      succeeded  discovered=20 fetched=0  candidates=0 errors=20
  sebi-rss     succeeded  discovered=30 fetched=29 candidates=2 errors=1
  rbi-rss      succeeded  discovered=10 fetched=10 candidates=0 errors=0
  generic-rss  succeeded  discovered=25 fetched=25 candidates=0 errors=0
```

The per-source section always lists every configured source key — including failed ones — so a single-source outage can never hide a source from the summary.

**JSON summary** (machine-readable):
Full `CrawlSummary` object serialized as JSON, including all counters and timestamps. When `CRAWLER_SUMMARY_FILE` is set (the Daily Crawl workflow uses `crawl-summary.json`), the same JSON is written to that file and uploaded as a workflow artifact.

Every live run also persists a `crawl_runs` record (status, per-source rows in `crawl_run_sources`, and errors in `crawl_errors`), which powers missed-run detection and the inventory report.

### Alerts (credential-free)

Operational alerts are emitted as structured JSON lines on stderr via `observability/alerts.ts`:

```json
{
  "type": "alert",
  "alertType": "crawl-source-failure",
  "severity": "warning",
  "category": "TIMEOUT",
  "sourceId": "rbi-rss",
  "runId": "..."
}
```

- Sink selection: `ALERT_SINK=log` (default) or `ALERT_SINK=none`. **No channel requiring credentials is implemented by design**; external channels must consume these log lines separately.
- Deduplication: repeated alerts with the same `alertType + sourceId + category` are suppressed within `ALERT_DEDUP_WINDOW_MINUTES` (default 60) per process, so a failing source cannot flood logs once per document.
- Alert types: `crawl-source-failure`, `crawl-completed-with-failures`, `ai-provider-degraded`, `database-failure`, `policy-guard-violation`, `source-health-failure`, `missed-crawl-run`.

### Failure Categories

All crawl and health failures are classified into a finite category set (`observability/failure-categories.ts`) before being written to `crawl_errors`, `source_health_events`, or alert lines. This makes dashboards/aggregations deterministic (`GROUP BY category`) instead of string-matching error text.

### Publication Event Audit Trail

Every pipeline publication decision is persisted to `publication_events` (action, previous/new status, actor type, reasons), for both auto-published and human-review/rejected outcomes. Manual editorial actions record their own events via the admin surface; together these form the complete audit trail for what was published, when, and why.

### Sentry Integration

When `SENTRY_DSN` is configured, source-level errors are captured via `captureError()` for alerting. This is optional and does not affect pipeline behavior.

## Troubleshooting

### Source returns no documents

- Check if the source is enabled: `SELECT enabled FROM sources WHERE id = 'source-id'`
- Run health check: `pnpm crawler:health`
- Check if the feed URL is correct in `sources.metadata->>'feedUrl'`
- Verify the source hasn't changed its feed format

### AI budget exhausted early

- Check `crawl_runs.ai_budget_used` for recent runs
- Increase `AI_DAILY_REQUEST_BUDGET` env var
- Review keyword scoring thresholds — too many false positives waste AI budget
- Check if duplicates are being filtered properly (content-hash dedup should prevent repeat AI calls)

### Circuit breaker stuck open

- The circuit breaker resets automatically after 60 seconds
- If the provider is persistently failing, check API key validity and quota
- Switch providers via `AI_PROVIDER` env var

### Document reprocessing needed

- For a specific document: `pnpm crawler:reprocess -- --document=<id>`
- For all deferred candidates: `pnpm crawler:retry-queued`

### High duplicate rate

- Normal for sources that republish the same content
- Cross-source duplicates (same content from PIB + SEBI about the same order) are expected
- Check `documentsDuplicate` count in run summaries

## Current Live-Source Status (verified 2026-08-06)

| Source                     | Status                           | Notes                                                                                                                                                             |
| :------------------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pib-rss`                  | monitored, 403 accepted honestly | published endpoint only; HTTP 403 is recorded as an error, never evaded                                                                                           |
| `sebi-rss`                 | live                             | fetched 29/30 in last dry run (1 PDF 404 recorded honestly)                                                                                                       |
| `rbi-rss`                  | live                             | fetched 10/10, 0 errors                                                                                                                                           |
| `generic-rss`              | live (W3C News RSS)              | replacement for CCI; fetched 25/25, 0 errors                                                                                                                      |
| CCI (`cci.gov.in/rss.xml`) | **disabled**                     | TLS chain invalid (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, leaf-only chain). Disabled rather than weakening TLS. Diagnostic probe: `scratch-capture/cci-tls-probe.mjs` |

## Local Verification Scripts

- `scripts/verify-local-database-ingestion.mjs` — local Supabase ingestion checkpoint (requires Docker). Alias: `pnpm verify:local-ingestion`.
- `scripts/verify-local-live-source-idempotency.mjs` — Phase 4B section 25: two identical live `generic-rss` windows against local Postgres; asserts the re-run creates 0 duplicate content rows. Refuses to run unless `SUPABASE_URL` is the local stack and `AUTO_VERIFY_CLAIMABLES`/`ENABLE_BILLING` are false. Alias: `pnpm verify:local-idempotency`.
- `scripts/phase-4b-acceptance-runner.mjs` — evidence-driven acceptance report; every status derives from exit codes / test output / DB queries, never from file existence.

### Latest verification status (2026-08-06)

- **Offline suite**: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — PASS.
- **Local idempotency + ingestion**: PASS where the local Supabase stack is available; `BLOCKED_LOCAL_ENVIRONMENT` on machines without WSL2/Docker (Docker engine currently down — DB verification is deferred to a separate DB-focused pass).
- **Hosted steps (scheduled runs, environment secrets)**: NOT_EXECUTED — no git remote configured yet, so no GitHub-hosted run has happened. The workflow YAML is audited for correctness; see `docs/deployment-readiness.md` for the exact blocker list.

> Docker/WSL2 note: local Supabase steps are `BLOCKED_LOCAL_ENVIRONMENT` on machines without WSL2 (Docker Desktop's WSL2 backend returns 500 on `/info`). See `docs/checkpoints/qoder-local-live-source-idempotency.md`.
