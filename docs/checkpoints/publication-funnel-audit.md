# ClaimRadar India — Publication Funnel Audit

**Audit Date:** 2026-08-12  
**Target Environment:** Staging (`upvsfqufkywlpibbwrse`)  
**Safety Guards:** `AUTO_VERIFY_CLAIMABLES=false` | `ENABLE_BILLING=false` | `NOTIFY_CUSTOMERS_ENABLED=false`

---

## 1. Funnel Stage Counts (Staging Database)

| Funnel Stage             | Count | Notes                                                                           |
| :----------------------- | :---: | :------------------------------------------------------------------------------ |
| **SOURCE_DOCUMENTS**     |  `3`  | Raw documents fetched and persisted from SEBI RSS feed (`sebi-rss`)             |
| **CANDIDATE_DOCUMENTS**  |  `0`  | Intermediate candidate records produced by deterministic filter / AI extraction |
| **VALIDATED_CANDIDATES** |  `0`  | Candidates passing schema & relevance validation rules                          |
| **EDITORIALLY_APPROVED** |  `0`  | Opportunities manually reviewed and approved for publication                    |
| **PUBLISHED_CLAIMABLES** |  `0`  | Active claimable listings visible on public directory                           |

---

## 2. Pipeline Stage-by-Stage Forensic Audit

### Stage 1: Document Acquisition (`documents_fetched`)

- **Status:** **OPERATIONAL**
- **Evidence:** 3 `source_documents` rows in staging DB from source `sebi-rss`.
- **Crawl status:** `sebi-rss` crawler runs successfully and persists new documents idempotently.

### Stage 2: Deterministic Relevance Filter (`deterministic_relevance_filter`)

- **Status:** **PASS / FILTERED**
- **Behavior:** Sourced SEBI RSS documents are general circulars/notifications (e.g., regulatory framework updates). None contain explicit individual investor refund / compensation claim instructions matching deterministic keyword thresholds (e.g., "refund application", "investor claim portal", "settlement claim period").

### Stage 3: Candidate Extraction & AI Pipeline (`documents_reaching_extraction`)

- **Status:** **DISABLED IN STAGING DEFAULT / UNTRIGGERED**
- **Configuration Audit:**
  - `AI_PROVIDER`: Defaulted to `none` (or disabled when no LLM API key is injected in scheduled CI dry-runs).
  - `AI_EXTRACTION_ENABLED`: Required for LLM-based structured extraction of candidate claimables from unstructured circular text.
  - Because no documents matched deterministic claim criteria and AI extraction is unconfigured in standard cron dry-runs, 0 candidate extraction jobs executed.

### Stage 4: Schema & Policy Validation (`validation_result`)

- **Status:** **UNTRIGGERED** (0 candidates submitted to validator).

### Stage 5: Candidate Persistence & Editorial Queue (`candidate_persistence_result`)

- **Status:** **UNTRIGGERED** (0 candidate records created in `claimable_candidates` table).

### Stage 6: Publication Gate (`AUTO_VERIFY_CLAIMABLES`)

- **Status:** **SAFETY GUARD ACTIVE (`AUTO_VERIFY_CLAIMABLES=false`)**
- **Behavior:** Even if candidates pass verification, auto-publishing is strictly disabled on staging. All publications require explicit human editorial approval (`status = 'published'`).

---

## 3. Bottleneck Summary & Readiness Verdict

- **Root Cause of 0 Published Claimables:**
  1. Monitored feeds (`sebi-rss`) have not published a public refund scheme document during active staging crawl windows.
  2. `AUTO_VERIFY_CLAIMABLES=false` prevents automated publishing without human editorial sign-off.
- **Product Readiness Impact:**
  - `TECHNICAL_BETA_READY`: **YES** (Pipeline executes cleanly, empty states render correctly).
  - `ZERO_DATA_UX_READY`: **YES** (Directory displays honest empty state `No published opportunities found`).
  - `CORE_CONTENT_READY`: **NO** (0 published opportunities available for consumer search).
  - `PUBLIC_MARKETING_READY`: **NO** (Requires verified live refund/compensation opportunities prior to public marketing launching).
