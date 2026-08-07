# Staging Operational Monitoring Runtime Verification

**Timestamp:** 2026-08-07T22:39:30Z  
**Environment:** Staging Supabase (`upvsfqufkywlpibbwrse`) + Crawler Telemetry  
**Status:** `STAGING_MONITORING_RUNTIME = PASS`

---

## 1. Operational Event Verification Matrix

| Event Category                     | Tested Scenario                                 | Telemetry / Log Signature                                         | Result  |
| ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- | ------- |
| **Crawl Completion**               | Controlled ingestion run (`crawler:source`)     | `Ingestion run completed: status=success, records_ingested=N`     | ✅ PASS |
| **Source Health**                  | Live source connectivity check (SEBI, RBI, W3C) | `Source health check: status=healthy, latency_ms=N`               | ✅ PASS |
| **Source Failure Handling**        | Network timeout / 404 handling                  | `Source fetch warning: HTTP 404 / ETIMEDOUT logged without crash` | ✅ PASS |
| **DB Error Classification**        | Constraint violation / duplicate URL            | `Database error classified: UNIQUE_VIOLATION handled gracefully`  | ✅ PASS |
| **AI Extraction Fallback**         | `AI_PROVIDER=none` configured                   | `AI extraction skipped: provider disabled by policy`              | ✅ PASS |
| **Notification Failure Isolation** | `NOTIFY_CUSTOMERS_ENABLED=false`                | `Notifications suppressed by policy (APP_ENV=staging)`            | ✅ PASS |
| **Missed-Run Detection**           | Health evaluator age check                      | `Source health alert: max_age_hours check active`                 | ✅ PASS |

---

## 2. Telemetry & Log Sinks

- **Application Log Sink:** Structured JSON output (`ALERT_SINK=log`).
- **Audit Table:** Ingestion events, crawl status, and source health records stored in `audit_logs` and `source_health_snapshots`.
- **Alert Deduplication Window:** 60 minutes (`ALERT_DEDUP_WINDOW_MINUTES=60`).

---

## 3. Safety Guardrails Active During Test

```
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
```

No customer alerts sent. No auto-verification performed. No billing charges incurred.

---

## 4. Gate Result

`STAGING_MONITORING_RUNTIME = PASS`
