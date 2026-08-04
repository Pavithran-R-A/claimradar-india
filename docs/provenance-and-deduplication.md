# ClaimRadar India — Provenance-Safe Deduplication Specification

**Version:** 1.0.0  
**Status:** Implemented & Verified Offline  
**Last Updated:** August 5, 2026

---

## 1. Core Architecture & Principles

ClaimRadar India tracks legal and regulatory claim opportunities across multiple government agencies (PIB, SEBI, RBI, MCA). A single regulatory matter is often published by multiple official entities:

1. Primary Regulator Circular (e.g. SEBI order)
2. Government Press Release (e.g. PIB release)
3. Corporate Disclosure (e.g. NSE/BSE filing)

### Fundamental Principles

- **No Provenance Loss:** Every distinct official URL is preserved as a distinct `source_documents` row. Provenance is never discarded or merged into a single record.
- **Multi-Source Claim Clusters:** Multiple source documents may be linked to a single `claimables` entity as supporting evidence.
- **Reversible Grouping:** Links between source documents and claimables are stored as explicit association records, allowing clusters to be split or re-grouped whenever new official evidence emerges.
- **Title Safety:** Similar titles alone CANNOT merge distinct legal matters.

---

## 2. Multi-Stage Deduplication Pipeline

The deduplication orchestrator ([`apps/crawler/src/deduplication/index.ts`](file:///C:/Users/Pavithran%20R%20A/Documents/Qoder/2026-07-27/chat-1/apps/crawler/src/deduplication/index.ts)) evaluates four strategies in order:

```
[ New Document ]
       │
       ▼
 1. Canonical URL Match ─────(Same URL & Same Source)──────> [ DUPLICATE: SKIP FETCH ]
       │
       ▼
 2. Source Identifier Match ─(Exact Reference Number)─────> [ CROSS-SOURCE CLUSTER LINK ]
       │
       ▼
 3. Content SHA-256 Hash ───(Exact Payload Match)────────> [ CROSS-SOURCE CLUSTER LINK ]
       │
       ▼
 4. Title + Date Match ────(Normalized High Similarity)──> [ CANDIDATE REVIEW / NO AUTO-MERGE ]
       │
       ▼
[ UNIQUE NEW SOURCE DOCUMENT ]
```

---

## 3. Verified Scenarios

| Scenario                                  | System Behavior                   | Provenance Result                                                        |
| :---------------------------------------- | :-------------------------------- | :----------------------------------------------------------------------- |
| **1. Mirror Document (PIB vs Regulator)** | `crossSourceMatch = true`         | Distinct `source_documents` created; linked to shared claimable cluster. |
| **2. Regulator + Company Notice**         | Linked via reference ID / cluster | Both documents preserved with full source metadata.                      |
| **3. Same Hash from 2 URLs**              | Flagged as duplicate content      | Each URL retained as distinct source evidence.                           |
| **4. Similar Titles, Different Matters**  | Evaluates reference ID and date   | Kept separate; title similarity alone does not auto-merge.               |
| **5. Updated Order / New Deadline**       | SHA-256 hash differs              | Created as new version document; updates claimable deadline.             |
| **6. Canonical URL Normalization**        | Strips tracking params (`utm_*`)  | Prevents duplicate ingestion from parameter noise.                       |

---

## 4. Reversible Cluster Model

```
 ┌─────────────────────────────────────────────────────────┐
 │                   CLAIMABLE CLUSTER                     │
 │          ID: clm_8f93a102-4b72-4d1e-8e50                │
 └────────────────────────────┬────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ SOURCE DOC #1   │  │ SOURCE DOC #2   │  │ SOURCE DOC #3   │
│ SEBI Order      │  │ PIB Release     │  │ RBI Notification│
│ URL: sebi.gov.in│  │ URL: pib.gov.in │  │ URL: rbi.org.in │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

If an administrative error occurs, the cluster link between `SOURCE DOC #2` and `CLAIMABLE CLUSTER` can be removed or reassigned without losing any raw text, HTML, or metadata.
