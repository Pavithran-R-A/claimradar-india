# ClaimRadar India — Publication Funnel Audit

## 1. Funnel Overview & Database Verification

This document records the exact data pipeline status and publication funnel counts retrieved directly from the live Supabase staging database (`upvsfqufkywlpibbwrse`).

```text
=== CLAIMRADAR PUBLICATION FUNNEL AUDIT ===

1. Discovered/Fetched Source Documents: 3
2. Candidate Documents Extracted:      0
3. Validated Candidate Claimables:    0
4. Total Claimables Records:          0
5. Published Claimables:              0
```

---

## 2. Funnel Breakdown & Pipeline Analysis

| Stage                            | Record Count | Description                                                                                                                       |
| :------------------------------- | :----------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **1. Source Documents**          | **3**        | Documents discovered and fetched from official RSS feeds (SEBI press releases / notices).                                         |
| **2. Candidate Documents**       | **0**        | Extracted candidate documents passing document-level heuristics.                                                                  |
| **3. Candidate Claimables**      | **0**        | Structured candidate records ready for editorial review.                                                                          |
| **4. Claimables Database Total** | **0**        | Total records in the `claimables` domain table.                                                                                   |
| **5. Published Claimables**      | **0**        | Records with `publication_status = 'published'` and `status IN ('verified_claimable', 'official_update', 'potential_claimable')`. |

---

## 3. Root Cause Analysis: Why the Public Directory Is Empty

1. **Safety Controls Active (`AUTO_VERIFY_CLAIMABLES = false`)**:
   - ClaimRadar strictly enforces `AUTO_VERIFY_CLAIMABLES=false`.
   - The crawler backend never auto-publishes extracted candidates directly to the public directory.
2. **Controlled Pipeline Execution**:
   - Previous live ingestion runs executed controlled source fetches (`--source=sebi-rss`) in verification mode without manual editorial promotion in the admin console (`/admin/reviews`).
3. **Publication Policy Compliance**:
   - Only records that undergo human editorial verification and are explicitly marked `publication_status = 'published'` appear in public views (`/claimables`, `/companies`, `/sectors`, `/deadlines`).
4. **Zero Fabricated Claims**:
   - Staging contains **0** fake, demo, or placeholder records. Fictional claims are never injected into the production-facing database to make screenshots look populated.

---

## 4. Remediation & Publication Workflow

To populate the public directory safely with legitimate claim opportunities:

1. Editorial staff log into the Admin Console at `/admin/candidates`.
2. Review candidate documents extracted from official SEBI/RBI/PIB sources.
3. Complete evidence verification, set official claim portal URLs, and assign appropriate public status (`verified_claimable`, `official_update`, or `potential_claimable`).
4. Set `publication_status = 'published'`.

The frontend design ensures that when zero published records exist, the UI renders compact, intentional, informative empty states rather than empty containers or broken zero-count grids.
