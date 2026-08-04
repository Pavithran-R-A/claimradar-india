# Publication Policy

## Overview

The publication policy engine (`publication/policy.ts`) makes deterministic decisions about whether an extracted claim should be auto-published, sent for human review, or rejected. The policy is designed with a safety-first bias — most outputs go to human review by default.

## Default Gate: AUTO_VERIFY_CLAIMABLES=false

The `AUTO_VERIFY_CLAIMABLES` feature flag is the master control:

- **`false` (default)**: No candidate can be auto-published. The best possible outcome is `human_review`. This is the safe default for the current phase.
- **`true`**: Auto-publish becomes possible when all other criteria are met.

The flag is hardcoded to `false` in the pipeline:

```typescript
featureFlags: {
  AUTO_VERIFY_CLAIMABLES: false;
}
```

## Decision Flow

```
1. Individual judgment guard failed? ──► REJECT
2. Any blocking validator failed?    ──► REJECT
3. AUTO_VERIFY = false?              ──► HUMAN REVIEW
4. All criteria met?                 ──► AUTO PUBLISH
5. Otherwise                         ──► HUMAN REVIEW
```

### 1. Rejection

A candidate is rejected (not published, not queued for review) when:

- **Individual judgment guard**: The extraction describes an individual judgment that cannot be published as a group claim. This is a hard block — individual judgments require separate editorial handling.
- **Blocking validator failures**: Any validator with `severity: 'block'` that did not pass. Currently only `individualJudgmentGuard` has block severity.

Rejected candidates are stored with `publication_decision: 'reject'` and the specific reasons.

### 2. Auto-Publish

Auto-publish requires **all** of the following simultaneously:

| Criterion                | Requirement              |
| ------------------------ | ------------------------ |
| `AUTO_VERIFY_CLAIMABLES` | `true`                   |
| Claimability score       | `>= 70`                  |
| Trust level              | `official`               |
| Validators               | All 11 validators passed |

When auto-publish criteria are met:

- If `procedural_status === 'final'` → status is `OfficialUpdate`, published immediately
- Otherwise → status is `PotentialClaimable`, published immediately

### 3. Human Review

Most candidates end up here. Reasons include:

- `AUTO_VERIFY_CLAIMABLES` is disabled (the current default)
- Score is below 70
- Trust level is not `official`
- Some validators did not pass (warnings, not blocks)

Human-review candidates are stored with `publication_decision: 'human_review'` and status `Detected`.

## Claimability Score

The composite score (0–100) is computed by `computeClaimabilityScore()`:

```
score = confidence_points + validation_points + trust_points + evidence_points
```

| Component  | Formula                                              | Max |
| ---------- | ---------------------------------------------------- | --- |
| Confidence | `aiConfidence × 40`                                  | 40  |
| Validation | `(passed / total) × 30`                              | 30  |
| Trust      | official=20, reputable=15, community=5, unverified=0 | 20  |
| Evidence   | `verified_count × 2` (only when `allVerified=true`)  | 10  |

The final score is rounded and clamped to [0, 100].

## No Path to verified_claimable

The automated pipeline **cannot** produce a `verified_claimable` status. The highest automated outcome is:

- `OfficialUpdate` (when auto-publish + final procedural status)
- `PotentialClaimable` (when auto-publish + non-final status)
- `Detected` (when human review)

Moving from `Detected` or `PotentialClaimable` to `verified_claimable` requires human editorial review through the admin dashboard.

## Publication Events

Every publication decision creates a `publication_events` record:

```typescript
{
  candidate_document_id: candidateId,
  action: 'auto_publish' | 'human_review' | 'reject',
  previous_status: null,
  new_status: ClaimableStatus,
  actor_type: 'pipeline',
  reason: reasons.join('; '),
}
```

This provides a full audit trail of why each decision was made.
