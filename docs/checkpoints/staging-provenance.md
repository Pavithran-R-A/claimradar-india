# ClaimRadar India — Staging Provenance & Clustering Verification Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Database (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Provenance-safe deduplication, content hash tracking, and cluster management rules (`007_deduplication_constraints.test.sql` & `tests/deduplication/provenance-dedup.test.ts`) were verified against the hosted staging database.

---

## 2. Tested Provenance Invariants

- **Multi-Source URL Preservation:** Same content across multiple official URLs retains all source URLs in `claim_sources`.
- **Cross-Domain Hash Deduplication:** Same content hash across different domains generates a unified cluster without dropping original source links.
- **Regulator + Company Notice:** Linked under a single `content_clusters` record with distinct `source_document_id` mappings.
- **Reversibility Rule:** Cluster splitting (`splitCluster`) does not destroy document-level provenance or original URL metadata.
- **Canonical URL Variant Normalization:** Trailing slashes, HTTPS scheme variations, and query parameters normalize cleanly.

---

## 3. Test Results

- Unit Provenance Rules: `tests/deduplication/provenance-dedup.test.ts` → **PASS**
- Schema Constraints: `supabase/tests/007_deduplication_constraints.test.sql` → **PASS**
- Staging Database Execution: **PASS**
