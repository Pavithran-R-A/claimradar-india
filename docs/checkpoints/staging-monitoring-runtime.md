# Staging Operational Monitoring Telemetry & Code Audit Report

**Timestamp:** 2026-08-07T22:48:00Z  
**Target:** Staging Supabase Project (`upvsfqufkywlpibbwrse`)  
**Status:** `STAGING_MONITORING_CODE = PASS`, `STAGING_MONITORING_RUNTIME = PARTIAL`

---

## 1. Monitoring Code Verification

- **Log Sink & Formatting:** Structured JSON logger active with `ALERT_SINK=log` and `ALERT_DEDUP_WINDOW_MINUTES=60`.
- **Deduplication Engine:** Provenance deduplication and hash tracking implemented in `@claimradar/crawler`.
- **Database Telemetry Schema:** `crawl_runs`, `sources`, `audit_logs` tables configured with proper columns.
- **Safety Policy:** All safety environment variables enforced (`APP_ENV=staging`, `AUTO_VERIFY_CLAIMABLES=false`, `ENABLE_BILLING=false`, `NOTIFY_CUSTOMERS_ENABLED=false`).
- **Code Audit Result:** `STAGING_MONITORING_CODE = PASS`

---

## 2. Remote Hosted Staging Monitoring Verification

- Query of live staging database `crawl_runs` table: **0 rows** (Pending remote GitHub Actions workflow execution).
- Remote GitHub Actions crawler workflows (`daily-crawl.yml`, `source-health.yml`) require GitHub remote repository attachment prior to scheduled/manual execution on GitHub runners.
- **Runtime Monitoring Result:** `STAGING_MONITORING_RUNTIME = PARTIAL`
