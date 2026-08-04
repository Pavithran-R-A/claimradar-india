# ClaimRadar India — Source Freshness & Health Specification

**Version:** 1.0.0  
**Status:** Implemented & Verified Offline  
**Last Updated:** August 5, 2026

---

## 1. Executive Summary

ClaimRadar India relies on authoritative primary government and regulatory sources (PIB, SEBI, RBI). Maintaining real-time source freshness, detecting silent upstream downtime, and ensuring evidence integrity are essential for accurate claim tracking.

---

## 2. Schema & Tracking Fields

Source health and freshness are tracked across the database schema (`sources`, `source_documents`, `claimables`, `source_health_events`):

| Entity             | Field Name              | Data Type     | Description                                                                 |
| :----------------- | :---------------------- | :------------ | :-------------------------------------------------------------------------- |
| `sources`          | `last_run_at`           | `timestamptz` | Timestamp of the most recent crawl execution attempt.                       |
| `sources`          | `last_success_at`       | `timestamptz` | Timestamp of the most recent successful crawl without critical fetch error. |
| `sources`          | `failure_count`         | `integer`     | Consecutive failed crawl attempts count. Reset to 0 on successful crawl.    |
| `sources`          | `fetch_frequency_hours` | `integer`     | Expected crawl interval (default: 24 hours).                                |
| `sources`          | `robots_checked_at`     | `timestamptz` | Timestamp of last `robots.txt` compliance verification.                     |
| `source_documents` | `published_at`          | `timestamptz` | Date of official publication declared by source authority.                  |
| `source_documents` | `retrieved_at`          | `timestamptz` | Exact UTC timestamp when document content was retrieved by crawler.         |
| `source_documents` | `last_modified`         | `timestamptz` | HTTP `Last-Modified` header returned by origin server.                      |
| `source_documents` | `content_hash`          | `text`        | SHA-256 hash of raw document content for change detection.                  |
| `claimables`       | `last_verified_at`      | `timestamptz` | Timestamp when claimable status and evidence were last validated.           |
| `claimables`       | `deadline_at`           | `timestamptz` | Official cutoff deadline for filing claims.                                 |

---

## 3. Source Health State Machine

Every monitored source transitions through five explicit operational states:

```
           [ Normal Crawl ]
              ┌─────────┐
              ▼         │
        ┌───────────┐   │ (Within 1.5x frequency)
 ┌─────>│  HEALTHY  ├───┘
 │      └─────┬─────┘
 │            │ (Crawl overdue > 1.5x frequency)
 │            ▼
 │      ┌───────────┐
 │      │  DELAYED  │
 │      └─────┬─────┘
 │            │ (Crawl overdue > 3x frequency or failure_count >= 3)
 │            ▼
 │      ┌───────────┐
 │      │   STALE   │
 │      └─────┬─────┘
 │            │ (failure_count >= 5)
 │            ▼
 │      ┌───────────┐
 │      │  FAILING  │
 │      └─────┬─────┘
 │            │ (Admin or compliance toggle)
 │            ▼
 └──────┌───────────┐
 (Fix)  │ DISABLED  │
        └───────────┘
```

### Transition Rules Table

| Current State | Condition / Event                                                                    | New State  | System Action                                                                    |
| :------------ | :----------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------- |
| Any State     | Successful crawl execution                                                           | `HEALTHY`  | Reset `failure_count = 0`, update `last_success_at = now()`.                     |
| `HEALTHY`     | Time since `last_success_at` > `1.5 * fetch_frequency_hours`                         | `DELAYED`  | Log observability warning; increase retry priority.                              |
| `DELAYED`     | Time since `last_success_at` > `3.0 * fetch_frequency_hours` OR `failure_count >= 3` | `STALE`    | Flag source in admin dashboard; display freshness warning badge on public pages. |
| `STALE`       | `failure_count >= 5`                                                                 | `FAILING`  | Emit Sentry / PagerAlert to engineering team; mark source degraded.              |
| Any State     | `enabled = false` in admin control                                                   | `DISABLED` | Exclude source from scheduled daily crawl pipeline.                              |

---

## 4. Safety Guarantees & Policy Rules

1. **Source Failure Isolation:** A source failure or downtime event NEVER automatically closes an active claim, marks a claim expired, or alters its procedural claimability status.
2. **Withholding Stale Data:** Records linked to `STALE` or `FAILING` sources display explicit "Source Verification Delayed" notices on the public UI to prevent misleading users.
3. **No Automatic Verification:** `AUTO_VERIFY_CLAIMABLES=false` remains strictly enforced regardless of source health status.
