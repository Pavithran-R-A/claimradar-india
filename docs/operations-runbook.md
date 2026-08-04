# Operations Runbook

## Source Failures

### Single Source Unavailable

- Crawler logs error to `ingestion_runs` with status `partial_failure`.
- Exponential back-off: retry at 1 h, 4 h, 16 h intervals.
- After 3 failures: alert created in editorial dashboard.
- **Action**: Investigate source URL change, robots.txt update, or IP block. Update `packages/source-registry` if URL has moved.

### All Sources Failing

- Likely infrastructure issue (DNS, network, crawler container down).
- **Action**: Check crawler container health on Railway/Fly.io dashboard. Verify Supabase connectivity. Restart crawler if needed.
- **Escalation**: If unresolved in 2 h, notify on-call engineer.

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

- **Sentry**: error tracking for web and crawler.
- **Vercel Analytics**: Core Web Vitals, TTFB, error rates.
- **Editorial dashboard**: ingestion run status, publication queue depth, correction queue.
- **Pager**: (future) PagerDuty integration for critical infrastructure failures.

## Regular Maintenance

- Weekly: editor spot-checks ≥ 10 % of auto-published claims.
- Monthly: review crawler error rates; prune stale sources.
- Quarterly: rotate service-role keys; review RLS policies; audit admin access.
