# Operations Runbook

## Missed-Run Detection & Recovery

### Detection

- `source-health.yml` runs `pnpm crawler:crawl-status -- --max-age-hours 26` and fails when no successful `crawl_runs` row exists inside the window.
- GitHub notifies watchers of the failed scheduled workflow — no external alert credentials required.
- Manual check at any time: `pnpm crawler:crawl-status` with staging credentials in env.

### Recovery

1. Determine why the run was missed: workflow disabled? repo inactive > 60 days (GitHub disables schedules)? staging secrets expired/rotated? runner outage?
2. Fix the root cause (re-enable the workflow, refresh the `staging` environment secrets per `docs/staging-supabase-setup.md`).
3. Trigger a manual run: **Actions → Daily Crawl → Run workflow** (first with `dry_run: true`, then live).
4. Verify recovery: `pnpm crawler:crawl-status` reports verdict `ok`; the next health run passes.
5. If multiple days were missed, no special backfill is needed — the pipeline is idempotent (content-hash dedup + `ON CONFLICT DO NOTHING` upserts; verified by `scripts/verify-local-live-source-idempotency.mjs`). One live run catches up the current window.

## Source Failures

### Single Source Unavailable

- Crawler logs error to `ingestion_runs` with status `partial_failure`.
- Exponential back-off: retry at 1 h, 4 h, 16 h intervals.
- After 3 failures: alert created in editorial dashboard.
- **Action**: Investigate source URL change, robots.txt update, or IP block. Update `packages/source-registry` if URL has moved.

### All Sources Failing

- Likely infrastructure issue (DNS, network, or staging database unreachable).
- **Action**: check the Daily Crawl workflow logs for the `database-failure` alert line and the categorized `crawl_errors` rows. Verify staging Supabase status. Re-run manually once the dependency recovers.
- **Escalation**: if unresolved in 2 h, notify the on-call engineer.

## AI Outages

### AI Provider Unavailable

- AI extraction skipped; raw documents saved to `raw_documents` for later retry.
- Deterministic validation still runs on non-AI fields.
- Claims enter `detected` status (not `uncertain`) — will be reprocessed when AI returns.
- **Action**: Monitor provider status page. Queue retries automatically every 30 min.

### AI Output Quality Degradation

- Detected via confidence score thresholds (< 0.6 on key fields).
- Low-confidence extractions routed to human review queue.
- **Action**: Review prompt template; check for source format changes. Update prompt in `packages/claim-schema` if needed.

## Database Issues

### Supabase Outage

- Web falls back to ISR-cached pages (stale data served with `stale-while-revalidate`).
- Crawler queues documents locally; retries on Supabase recovery.
- **Action**: Monitor Supabase status page. No data loss — crawler resumes automatically.

### Migration Failure

- PR blocked; CI fails on migration test.
- **Action**: Review migration locally with `pnpm --filter @claimradar/database migrate`. Fix and re-run. Never apply broken migration to production.

### Data Corruption / Incorrect Bulk Update

- **Action**: Use `claim_revisions` to identify affected rows. Create correction entries. Notify affected users via alerts. Editor reviews and publishes corrections.

## Emergency Corrections

### Factual Error on Published Claim

1. Create `corrections` row with original + corrected values.
2. Editor signs off on correction.
3. Claim page updated; "Correction" banner displayed with link to correction log.
4. Affected watchlist users notified via alert.
5. Post-mortem added to `audit_log`.

### Claim Must Be Unpublished Immediately

1. Editor sets status to `rejected` with reason.
2. Claim removed from public pages on next ISR revalidation (≤ 60 s).
3. Correction log entry created explaining retraction.
4. Legal reviewer notified for follow-up.

## Monitoring & Alerts

- **Structured logs**: JSON lines from the crawler (`observability/logger.ts`) with `runId`, `stage`, redaction of credential-shaped keys.
- **Alerts**: credential-free structured alert lines (`ALERT_SINK=log`) with per-process dedup; Sentry (`SENTRY_DSN`) when configured.
- **Run records**: `crawl_runs`, `crawl_run_sources`, `crawl_errors`, `source_health_events`, `publication_events`.
- **GitHub-native notifications**: failed scheduled workflows notify watchers — this is the primary alert channel until an external consumer of alert log lines is provisioned.
- **Editorial dashboard**: ingestion run status, publication queue depth, correction queue.

## Backup & Restore (Supabase staging)

### Backups

- Supabase projects on paid plans retain automatic daily PITR backups (Project Settings → Backups); free-tier projects do **not** — schedule manual dumps for staging.
- Manual logical dump (PowerShell; store outside the repo, never commit):

```powershell
pg_dump "$env:DATABASE_URL" --no-owner --no-privileges -f "claimradar-staging-$(Get-Date -Format yyyyMMdd-HHmm).sql"
```

- Take a dump before any migration push, any bulk data fix, and at least weekly during active ingestion testing.

### Restore

1. Confirm the target is staging (check `STAGING_SUPABASE_PROJECT_REF`) — restoring into the wrong project is a data-loss event.
2. For point-in-time incidents, prefer Supabase's PITR restore (Project Settings → Backups → Restore to timestamp) over manual replay.
3. For a logical dump: apply into an empty staging database, then re-run `supabase db push` to guarantee migration state consistency:

```powershell
psql "$env:DATABASE_URL" -f claimradar-staging-YYYYMMDD-HHMM.sql ; supabase db push
```

4. Verify: `pnpm crawler:crawl-status`, row counts on core tables, one `crawler:source -- --source=<id> --dry-run` smoke run.

## Incident Response

Severity classes and first actions:

| Severity | Example                                          | First action                                                        |
| :------- | :----------------------------------------------- | :------------------------------------------------------------------ |
| SEV1     | Staging DB unreachable; wrong data published     | Stop the pipeline (disable Daily Crawl schedule), assess data scope |
| SEV2     | Single source failing ≥ 3 runs; AI provider down | Check failure categories in `source_health_events`/`crawl_errors`   |
| SEV3     | Missed run; elevated duplicate rate              | Follow Missed-Run Recovery above                                    |

Standard flow: **Detect → Contain → Diagnose → Recover → Post-mortem**.

1. **Detect**: failed workflow notification, alert log line, or editor report.
2. **Contain**: disable the Daily Crawl schedule if writes are suspect; never delete data while diagnosing.
3. **Diagnose**: filter logs by `runId`; query `crawl_errors` by category; check `ai_runs` for provider error categories.
4. **Recover**: fix config/migration/credentials; run the relevant verification script; re-enable schedule; confirm next scheduled run.
5. **Post-mortem**: append findings to `docs/checkpoints/`; update this runbook if a new failure class appeared.

## Rollback Procedures

- **Code rollback**: revert to the last green commit and re-push; CI (format/lint/typecheck/test/build) gates every merge. Scheduled workflows always run the default branch, so the revert takes effect on the next trigger.
- **Schema rollback**: migrations are forward-only by policy. **Never** `supabase db reset --linked`. To roll back a bad migration, write a NEW corrective migration (restore dropped columns as nullable, re-add constraints after data repair) and `supabase db push`. If the bad migration corrupted data, restore from backup first, then re-apply only good migrations.
- **Data rollback**: for a bad bulk ingestion, scope affected rows via `crawl_runs` + `crawl_run_sources` timestamps, then delete in dependency order (publication_events → validation_results → ai_runs → candidate_documents → source_documents) inside a transaction, and record the action in `publication_events`/editorial notes.
- **Config rollback**: workflow guard values (`AUTO_VERIFY_CLAIMABLES`, `ENABLE_BILLING`, `NOTIFY_CUSTOMERS_ENABLED`) are pinned literals in YAML — revert the change that touched them; the preflight gate will refuse runs until they are false again.

## Regular Maintenance

- Weekly: editor spot-checks ≥ 10 % of auto-published claims.
- Monthly: review crawler error rates; prune stale sources.
- Quarterly: rotate service-role keys; review RLS policies; audit admin access.
