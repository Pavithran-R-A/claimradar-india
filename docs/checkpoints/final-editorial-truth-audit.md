# ClaimRadar India — Final Editorial Truth & Classifier Audit

**Date:** August 29, 2026  
**Auditor:** ClaimRadar Quality & Editorial Safety Gate  
**Corpus Test Status:** 100% PASS (14/14 test cases verified)  
**Staging Live Candidate Database Status:** 100% TRUE ACTIONABLE (22/22 candidates verified)

---

## 1. Classification Architecture

ClaimRadar India utilizes a deterministic layered classifier architecture to prevent administrative and enforcement noise from entering the customer claim opportunity pipeline:

```
                       [ Source Document ]
                                │
   Layer 1: Administrative Exclusion Filter
   (Conferences, Workshops, Tenders, Vacancies, Speeches)
                                │
   Layer 2 & 3: Deterministic Hard False-Positive Rules
   - RBI Monetary Penalties without Restitution Route ───► NON_ACTIONABLE (Score 0)
   - IBBI Form G (EOI for Resolution Applicants) ─────────► INFORMATIONAL_ONLY (Score 0)
   - SEBI Generic Enforcement/Adjudication Orders ────────► NON_ACTIONABLE (Score 0)
                                │
   Layer 2 & 3: High-Confidence Actionable Matching
   - IBBI CIRP/Liquidation Creditor Claim Notices ────────► TRUE_ACTIONABLE (CreditorClaimInvitation)
   - SEBI Public Investor Refund Schemes (PACL/Citrus) ───► TRUE_ACTIONABLE (InvestorRefundProgram)
   - TRAI/Consumer Commission Restitution Directives ─────► TRUE_ACTIONABLE (ConsumerRefundProgram)
   - Statutory Unclaimed Financial Assets (IEPF/UDGAM) ───► TRUE_ACTIONABLE (PublicClaimNotice)
                                │
   Layer 4: Weighted Keyword Scoring (0–100) with Title Boost
                                │
   Layer 5 & 6: Human Editorial Review Queue
```

---

## 2. Regression Corpus Results

Evaluated via `apps/crawler/tests/scoring/corpus.test.ts` and `classifier.test.ts`:

| Metric                                       | Target | Actual Result             | Status |
| :------------------------------------------- | :----- | :------------------------ | :----- |
| **Total Test Items**                         | >= 10  | 14                        | PASS   |
| **Known-Positive Recall**                    | >= 90% | **100.0%** (6/6 TP, 0 FN) | PASS   |
| **Audited Precision**                        | >= 90% | **100.0%** (6 TP, 0 FP)   | PASS   |
| **RBI Penalty False Positives**              | **0**  | **0**                     | PASS   |
| **IBBI Form G False Positives**              | **0**  | **0**                     | PASS   |
| **SEBI Generic Enforcement False Positives** | **0**  | **0**                     | PASS   |

---

## 3. Staging Database 100% Candidate Re-Audit

All 22 candidate documents currently existing in the Supabase staging database (`qsshiksnyflwsybjyzob`) were audited against the layered classification rules:

- **Total Candidates Audited:** 22
- **True Actionable Candidates:** 22 (100%)
  - **IBBI CIRP Creditor Claim Public Announcements:** 18
  - **SEBI Citrus Check Inns Investor Refund Notices:** 4
- **Non-Actionable Candidates:** 0 (0%)
- **Expired Candidates:** 0 (0%)
- **Informational Only:** 0 (0%)
- **Unproven:** 0 (0%)
- **RBI Monetary Penalties in DB:** 0 (0%)
- **IBBI Form G in DB:** 0 (0%)
