# Live Dry Run #5 Verification Checkpoint

**Date:** August 5, 2026  
**Run ID:** `12ffe382-f40f-4dbf-943a-cfb66e62acf5`  
**Command:** `pnpm crawler:daily -- --live --dry-run`  
**Environment:** Local Node `v24.18.0` | `dryRun = true`

---

## 1. Multi-Source Retrieval Summary

| Source ID     | Source Name                 | Endpoint                                          | Discovered | Fetched | Status / Notes                                              |
| :------------ | :-------------------------- | :------------------------------------------------ | ---------: | ------: | :---------------------------------------------------------- |
| `pib-rss`     | Press Information Bureau    | `https://www.pib.gov.in/RssMain.aspx`             |         20 |       0 | **HTTP 403 Forbidden** (Akamai CDN bot detection)           |
| `sebi-rss`    | Securities & Exchange Board | `https://www.sebi.gov.in/sebirss.xml`             |         30 |      29 | **HTTP 200 OK** (1 PDF attachment returned 404)             |
| `rbi-rss`     | Reserve Bank of India       | `https://www.rbi.gov.in/rssfeed/pressrelease.xml` |         10 |      10 | **HTTP 200 OK** (10 press releases processed)               |
| `generic-rss` | Generic Public RSS          | `https://www.cci.gov.in/rss.xml`                  |          0 |       0 | **SSL Handshake Error** (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) |

---

## 2. Decision & Invariant Audit

```json
{
  "runId": "12ffe382-f40f-4dbf-943a-cfb66e62acf5",
  "startedAt": "2026-08-05T04:34:40.718Z",
  "completedAt": "2026-08-05T04:34:59.810Z",
  "durationMs": 19092,
  "sourcesAttempted": 4,
  "sourcesSucceeded": 4,
  "sourcesFailed": 0,
  "documentsDiscovered": 60,
  "documentsFetched": 39,
  "documentsUnchanged": 0,
  "documentsDuplicate": 0,
  "candidatesCreated": 1,
  "aiCallsUsed": 1,
  "aiCallsFailed": 0,
  "recordsPublished": 0,
  "recordsQueued": 0,
  "recordsRejected": 1,
  "errorCount": 21
}
```

### Safety & Dry-Run Safeguards

- **Database Writes:** `0`
- **Publications Written:** `0`
- **Notifications Triggered:** `0`
- **Candidate Decisions:** 1 candidate created (score 80, decision `reject` per publication policy).
- **Summary Counter Verification:** Reconciled `recordsRejected = 1` matching the publication decision.
