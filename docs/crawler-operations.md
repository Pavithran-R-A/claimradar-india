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
RBI RSS: FAIL (5002ms) - Connection timeout
```

This command uses `dryRun: true` internally — it makes real HTTP requests but does not write to the database or consume AI budget.

### reprocess

Reprocess a specific document through the pipeline.

```bash
pnpm crawler:reprocess -- --document=<document-id>
```

> Note: This command is scaffolded but not yet fully implemented. It will re-run AI extraction and validation on the specified document.

### retry-queued

Retry all deferred candidates (documents saved with `ai_extraction_status: 'deferred'`).

```bash
pnpm crawler:retry-queued
```

> Note: This command is scaffolded but not yet fully implemented. It will reprocess candidates that were deferred due to AI budget exhaustion or provider unavailability.

### --dry-run flag

Available on all commands. When set:

- No database records are created or modified
- No AI budget is consumed
- Real HTTP requests are still made (adapters still fetch)
- Pipeline logic (dedup, scoring, validation) runs in-memory
- Summary output is still printed

## GitHub Actions

### daily-crawl.yml

**Schedule**: `17 0 * * *` — runs at 00:17 UTC daily (non-round minute to reduce GitHub runner contention).

**Steps**:

1. Checkout code
2. Setup Node.js 24 + pnpm 9
3. Install dependencies (cached)
4. Run crawler tests (`pnpm --filter @claimradar/crawler test`)
5. Run daily crawl (`pnpm crawler:daily`)
6. Upload run summary artifact

**Concurrency**: Group `daily-crawl` with `cancel-in-progress: false` — a running crawl is never cancelled by a new trigger.

**Timeout**: 30 minutes.

**Environment variables**:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — from secrets
- `AI_PROVIDER` — from vars (default: `none`)
- `OPENROUTER_API_KEY`, `NVIDIA_API_KEY` — from secrets
- `AI_DAILY_REQUEST_BUDGET` — from vars (default: `40`)
- `SENTRY_DSN` — from secrets (optional)
- `LIVE_ADAPTERS_ENABLED` — set to `true`

### source-health.yml

**Schedule**: `43 2 * * 1` — runs at 02:43 UTC every Monday (weekly).

**Steps**:

1. Checkout code
2. Setup Node.js 24 + pnpm 9
3. Install dependencies
4. Run source health checks (`pnpm crawler:health`)

This workflow does **not** make AI calls. It only tests source availability and feed validity.

## Triggering Manual Runs

Both workflows support `workflow_dispatch`:

### Daily Crawl (manual)

1. Go to **Actions → Daily Crawl → Run workflow**
2. Optionally set `dry_run` to `true`
3. Click **Run workflow**

When `dry_run` is `true`, the crawl command receives `--dry-run` and no database writes occur.

### Source Health Check (manual)

1. Go to **Actions → Source Health Check → Run workflow**
2. Click **Run workflow**

No additional inputs required.

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
```

**JSON summary** (machine-readable):
Full `CrawlSummary` object serialized as JSON, including all counters and timestamps.

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
