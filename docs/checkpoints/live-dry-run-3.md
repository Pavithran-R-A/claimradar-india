# Live Dry-Run #3 Execution Checkpoint

**Date:** August 5, 2026  
**Environment:** Local Windows PowerShell | Node `v24.18.0`  
**Command Executed:** `pnpm crawler:daily -- --live --dry-run`  
**Run ID:** `4960a8a5-4299-4409-b7bc-49bf8d861367`

---

## 1. Execution Summary

| Parameter                | Recorded Value                                      |
| :----------------------- | :-------------------------------------------------- |
| **Duration**             | 10.58s                                              |
| **Sources Attempted**    | 3 (`sebi-rss`, `rbi-rss`, `pib-rss`)                |
| **Sources Succeeded**    | 3                                                   |
| **Documents Discovered** | 50 (30 SEBI, 20 PIB)                                |
| **Documents Fetched**    | 29 (29 SEBI)                                        |
| **Candidates Created**   | 1 (Score: 80, Decision: `reject` per policy)        |
| **AI Calls Used**        | 1 (Budget check verified)                           |
| **Publications Created** | 0 (`dryRun` isolated)                               |
| **Live DB Writes**       | 0 (`InMemoryDryRunWriter` in-memory isolated)       |
| **Error Count**          | 21 (20 PIB Akamai HTTP 403 + 1 SEBI attachment 404) |

---

## 2. Per-Source Detailed Results

### SEBI RSS (`sebi-rss`)

- **Status:** HTTP 200 OK
- **Discovered:** 30 notices
- **Fetched:** 29 notices (1 nested PDF attachment returned HTTP 404)
- **Candidates Created:** 1 candidate (`settlement-order-in-the-matter-of-violation-of-pro-rata...`, score 80, decision `reject` under policy)

### RBI Press Releases (`rbi-rss`)

- **Status:** HTTP 406 (header negotiation rejection by RSS parser)
- **Discovered:** 0

### PIB India (`pib-rss`)

- **Status:** HTTP 403 Forbidden across all 20 detail document links (Akamai CDN bot detection blocks declared bot User-Agent `ClaimRadarBot/0.1`).
- **Policy Compliance:** ClaimRadar India strictly complies with host terms; User-Agent header spoofing is prohibited.

---

## 3. Storage & Publication Safeguard Verification

- **Dry-Run Storage:** `InMemoryDryRunWriter` handled all crawl run logs, candidate evaluations, and deduplication checks in-memory without making network connections to Supabase.
- **Publications & Notifications:** 0 published, 0 queued, 0 notifications triggered.
