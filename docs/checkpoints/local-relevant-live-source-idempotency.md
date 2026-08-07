# Local Relevant Live-Source Idempotency Report (SEBI + RBI)

## Status

RELEVANT_LIVE_SOURCE_POSTGRES_IDEMPOTENCY = PASS

## Test Environment

- **Target Supabase URL:** `http://127.0.0.1:54321`
- **Node Version:** `v24.19.0`
- **Tested Sources:**
  - **SEBI RSS Feed:** `https://www.sebi.gov.in/sebirss.xml` (ID: `c0000000-0000-0000-0000-000000000012`)
  - **RBI RSS Feed:** `https://www.rbi.org.in/pressreleases_rss.xml` (ID: `c0000000-0000-0000-0000-000000000013`)
- **Safety Flags:** `AUTO_VERIFY_CLAIMABLES=false`, `ENABLE_BILLING=false`, `NOTIFY_CUSTOMERS_ENABLED=false`

## Database Row-Count Evidence

### Content Tables

| Table                       | Baseline | Run 1 Ingested Delta | Run 2 Re-run Delta | Status              |
| :-------------------------- | :------- | :------------------- | :----------------- | :------------------ |
| `source_documents`          | 0        | +39                  | +0                 | PASS (0 Duplicates) |
| `content_clusters`          | 0        | +0                   | +0                 | PASS (0 Duplicates) |
| `content_cluster_members`   | 0        | +0                   | +0                 | PASS (0 Duplicates) |
| `candidate_documents`       | 0        | +3                   | +0                 | PASS (0 Duplicates) |
| `claimables`                | 5        | +0                   | +0                 | PASS (0 Duplicates) |
| `claim_evidence`            | 0        | +0                   | +0                 | PASS (0 Duplicates) |
| `claim_sources`             | 0        | +0                   | +0                 | PASS (0 Duplicates) |
| `validation_results`        | 0        | +11                  | +0                 | PASS (0 Duplicates) |
| `ai_runs`                   | 0        | +3                   | +0                 | PASS (0 Duplicates) |
| `publication_events`        | 0        | +1                   | +0                 | PASS (0 Duplicates) |
| `notifications`             | 0        | +0                   | +0                 | PASS (0 Duplicates) |
| `notification_delivery_log` | 0        | +0                   | +0                 | PASS (0 Duplicates) |

### Run Bookkeeping Tables (Informational)

| Table               | Baseline | Run 1 Delta | Run 2 Delta |
| :------------------ | :------- | :---------- | :---------- |
| `crawl_runs`        | 2        | +2          | +2          |
| `crawl_run_sources` | 2        | +2          | +2          |
| `crawl_errors`      | 0        | +1          | +1          |

## Idempotency Verdict

- **Initial Run 1 Ingestion:** Ingested **39** real document(s) from SEBI and RBI feeds.
- **Identical Run 2 Ingestion:** Produced **0 duplicate content rows** across all 12 content tables.
- **Result:** PASS (100% Idempotent database operations verified)
