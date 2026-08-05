# ClaimRadar India — Local Database Ingestion & Idempotency Verification

**Timestamp:** 2026-08-05T05:40:00Z  
**Environment:** Local Supabase Stack (PostgreSQL 17.6.1 in Docker Desktop WSL 2)  
**Status:** `PASSED_LOCAL_DATABASE_STACK`

---

## 1. Overview

This checkpoint documents the live controlled ingestion and second-run database idempotency verification performed directly against the local Supabase PostgreSQL stack (`postgresql://postgres:postgres@127.0.0.1:54322/postgres`).

All 9 migrations (`001_initial_schema.sql` through `009_freshness_and_deduplication.sql`) were applied twice from zero state, verified by `npx supabase db lint` (0 errors), and validated by the full 8-file pgTAP test suite (39 subtests passed).

---

## 2. Verification Execution Log

- **Script:** [`apps/crawler/scripts/verify-local-database-ingestion.ts`](file:///C:/Users/Pavithran%20R%20A/Documents/Qoder/2026-07-27/chat-1/apps/crawler/scripts/verify-local-database-ingestion.ts)
- **Target URL:** `http://127.0.0.1:54321` (Local Supabase PostgREST)
- **Source Used:** `PIB RSS Demo` (`c0000000-0000-0000-0000-000000000001`)

### Run 1: Initial Batch Ingestion

- **Batch Size:** 2 documents (`[LOCAL_TEST] SEBI Order 101` and `[LOCAL_TEST] RBI Notice 202`)
- **New `source_documents` Created:** `2`
- **Reused `source_documents`:** `0`
- **New `content_clusters` Created:** `2`
- **Reused `content_clusters`:** `0`

### Run 2: Duplicate Batch Ingestion

- **Batch Size:** 2 identical documents
- **New `source_documents` Created:** `0`
- **Reused `source_documents`:** `2`
- **New `content_clusters` Created:** `0`
- **Reused `content_clusters`:** `2`

---

## 3. Audit Matrix

| Verification Metric         | Expected Outcome                 | Actual Result                 | Status  |
| :-------------------------- | :------------------------------- | :---------------------------- | :------ |
| **Run 1 Document Creation** | 2 New `source_documents`         | 2 New `source_documents`      | ✅ PASS |
| **Run 1 Cluster Creation**  | 2 New `content_clusters`         | 2 New `content_clusters`      | ✅ PASS |
| **Run 2 Document Creation** | 0 New `source_documents`         | 0 New `source_documents`      | ✅ PASS |
| **Run 2 Document Reuse**    | 2 Existing `source_documents`    | 2 Existing `source_documents` | ✅ PASS |
| **Run 2 Cluster Creation**  | 0 New `content_clusters`         | 0 New `content_clusters`      | ✅ PASS |
| **Run 2 Cluster Reuse**     | 2 Existing `content_clusters`    | 2 Existing `content_clusters` | ✅ PASS |
| **Junction Linking**        | `content_cluster_members` upsert | Exact provenance preserved    | ✅ PASS |
| **Database Cleanup**        | Test fixture rows removed        | PostgreSQL state pristine     | ✅ PASS |

---

## 4. Next Phase Gate

The local database stack is fully verified, schema linted, pgTAP tested, and proven idempotent under database ingestion.

Staging Supabase ingestion remains pending availability of disposable staging credentials.
