# ClaimRadar India — Candidate Pipeline Audit

**Audit Date:** August 12, 2026  
**Pipeline Commit:** `c53b329a18828c38bff04d0bd64dd1da0d3e876b`  
**Environment:** Staging (`https://upvsfqufkywlpibbwrse.supabase.co`)

---

## 1. Pipeline Execution Trace for Existing Source Documents

The staging database contains **3 source documents** ingested from the `sebi-rss` adapter (`https://www.sebi.gov.in/sebirss.xml`). The table below traces each document through all 9 pipeline stages:

| SOURCE_DOCUMENT | FETCHED | FILTER_RESULT | FILTER_REASON | AI_CALLED | AI_RESULT | CANDIDATE_CREATED | VALIDATION_RESULT | PUBLICATION_RESULT |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEBI Circular — ESG Disclosure Framework** | YES (HTTP 200) | FAILS (Score: 5/100) | Regulatory disclosure guidelines; missing investor refund/compensation keywords | NO (`AI_PROVIDER=none`) | NOT_EXECUTED | NO | N/A | N/A |
| **SEBI Press Release — Advisory on Unregistered Entities** | YES (HTTP 200) | FAILS (Score: 10/100) | General investor awareness advisory; no specific claim scheme or deadline | NO (`AI_PROVIDER=none`) | NOT_EXECUTED | NO | N/A | N/A |
| **SEBI Board Meeting Summary Circular** | YES (HTTP 200) | FAILS (Score: 5/100) | Policy and governance decisions; no investor monetary restitution mechanism | NO (`AI_PROVIDER=none`) | NOT_EXECUTED | NO | N/A | N/A |

---

## 2. Root Cause Analysis

1. **Source Selection Mismatch:** The default `sebi-rss` feed (`https://www.sebi.gov.in/sebirss.xml`) aggregates general press releases and regulatory circulars. During the previous crawl run, the 3 most recent items published on SEBI's main RSS feed were general policy advisories rather than specific Investor Protection Fund (IPEF) refund notices or disgorgement distribution schemes.
2. **Deterministic Filter Sensitivity:** The keyword scoring model required a minimum score threshold of **15 points**. Documents with only 1 positive keyword match (score 5–10) were discarded before reaching AI extraction or candidate generation.
3. **AI Pipeline Configuration:** In standard dry-run and default staging cron environments, `AI_PROVIDER` defaults to `none` (or `skipAI: true`). Because the deterministic filter discarded the 3 documents prior to candidate creation, no `candidate_documents` records were written.

---

## 3. Corrective Engineering Strategy

1. **Expand Source Registry:** Add targeted feeds and section endpoints for SEBI disgorgement/recovery orders, RBI unclaimed deposits portal (UDGAM), IEPF refund notices, IRDAI insurance unclaimed funds, NCLT/IBBI corporate insolvency claim invitations, and NCDRC consumer compensation orders.
2. **Refine Keyword Classifier:** Add specific Indian regulatory refund terms (`disgorgement`, `unclaimed deposit`, `IEPF refund`, `passenger refund`, `interest compensation`, `consumer redressal`) and calibrate scoring weights to ensure genuine notices pass to the candidate queue.
3. **Candidate Creation Rules:** Ensure that high-value documents meeting deterministic criteria create structured `candidate_documents` queued for human review (`NEEDS_EDITORIAL_REVIEW`), even when AI extraction is unconfigured.
