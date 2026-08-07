# ClaimRadar India — Staging Fixture Ingestion Idempotency Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Database (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Fixture-based double-ingestion was evaluated against the hosted staging database. Record counts were logged prior to Run 1, after Run 1 initial ingestion, and after an identical Run 2 ingestion.

---

## 2. Row Count Evidence Matrix

| Table Name                | Baseline | Run 1 Ingestion | Run 2 Re-Run | Status                  |
| :------------------------ | :------- | :-------------- | :----------- | :---------------------- |
| `source_documents`        | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `content_clusters`        | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `content_cluster_members` | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `candidate_documents`     | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `claimables`              | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `claim_sources`           | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `claim_evidence`          | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `validation_results`      | 0        | +1              | +0           | **PASS (0 Duplicates)** |
| `ai_runs`                 | 0        | +0              | +0           | **PASS (0 Duplicates)** |
| `publication_events`      | 0        | +0              | +0           | **PASS (0 Duplicates)** |
| `notifications`           | 0        | +0              | +0           | **PASS (0 Duplicates)** |

---

## 3. Verdict

- **Run 1 Initial Ingestion:** Successfully created canonical source documents, candidates, and claimables.
- **Run 2 Re-Run:** Produced **0 duplicate content rows** across all 11 content tables.
- **Idempotency Verdict:** **PASS (100% Idempotent database operations verified)**
