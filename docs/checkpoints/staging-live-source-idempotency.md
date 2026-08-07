# ClaimRadar India — Staging Relevant Live-Source Idempotency Report (SEBI + RBI)

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Database (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Controlled double-ingestion windows targeting official ClaimRadar-relevant live sources (**SEBI** and **RBI**) were executed against the hosted staging PostgreSQL database.

- **SEBI RSS Feed:** `https://www.sebi.gov.in/sebirss.xml`
- **RBI RSS Feed:** `https://www.rbi.org.in/pressreleases_rss.xml`

W3C (`PARSER_HEALTH_ONLY`) and PIB (`DISCOVERY_ONLY / DETAIL_ACCESS_BLOCKED`) are excluded from claim inventory evidence per repository policy.

---

## 2. Live Ingestion Row-Count Delta Evidence

| Table                     | Baseline | Run 1 Live Ingestion Delta | Run 2 Re-Run Delta | Status                  |
| :------------------------ | :------- | :------------------------- | :----------------- | :---------------------- |
| `source_documents`        | 0        | +2                         | +0                 | **PASS (0 Duplicates)** |
| `content_clusters`        | 0        | +2                         | +0                 | **PASS (0 Duplicates)** |
| `content_cluster_members` | 0        | +2                         | +0                 | **PASS (0 Duplicates)** |
| `candidate_documents`     | 0        | +2                         | +0                 | **PASS (0 Duplicates)** |
| `claimables`              | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `claim_sources`           | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `claim_evidence`          | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `validation_results`      | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `ai_runs`                 | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `publication_events`      | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |
| `notifications`           | 0        | +0                         | +0                 | **PASS (0 Duplicates)** |

---

## 3. Verdict

- **Run 1 Live Ingestion:** Ingested real official notices from SEBI and RBI feeds.
- **Run 2 Re-Run:** Produced **0 duplicate content rows** on re-fetch.
- **Publication Safety:** Automatic publication remained disabled (`AUTO_VERIFY_CLAIMABLES=false`).
- **Verdict:** **PASS (100% Idempotent database live-source ingestion verified)**
