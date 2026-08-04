# Claim Taxonomy

## Status Lifecycle

| Status                    | Definition                                                       | Auto-publish        |
| ------------------------- | ---------------------------------------------------------------- | ------------------- |
| `detected`                | Raw signal from crawler; not yet validated                       | No                  |
| `official_update`         | Official source confirms an event (penalty, recall, order)       | Yes                 |
| `potential_claimable`     | Rule engine identifies a possible user claim pathway             | Yes                 |
| `verified_claimable`      | ≥ 2 sources + deterministic validation + editor + legal sign-off | **Never initially** |
| `refund_ordered`          | Authority has formally ordered a refund/compensation             | Yes                 |
| `registration_open`       | Claim registration window is currently open                      | Yes                 |
| `proposed_settlement`     | Settlement proposal published for comment/objection              | Yes                 |
| `collective_case_pending` | Class-action or collective proceeding is active                  | Yes                 |
| `identified_users_only`   | Only specifically named individuals are eligible                 | Yes (restricted)    |
| `individual_judgment`     | Court/tribunal judgment in favour of a specific individual       | Yes                 |
| `monitoring`              | Under watch; no actionable claim yet                             | No                  |
| `closed`                  | Deadline passed or case resolved with no further action          | Yes (archived)      |
| `rejected`                | Claim pathway investigated and found not viable                  | No                  |
| `uncertain`               | Insufficient data to determine status                            | No                  |

## Claimability Score (0–100)

Computed by deterministic rules in `packages/claim-schema`:

| Factor                                      | Weight |
| ------------------------------------------- | ------ |
| Number of independent official sources      | 0–25   |
| Explicit monetary figure cited              | 0–15   |
| Registration window open / deadline present | 0–20   |
| Sector-specific risk pattern match          | 0–20   |
| Deterministic validation pass rate          | 0–20   |

- Score ≥ 70 + human review → eligible for `verified_claimable`.
- Score < 30 → auto-downgrade to `monitoring` or `uncertain`.

## Verified Claimable Criteria

A claim may only be published as `verified_claimable` when **all** of the following are satisfied:

1. ≥ 2 independent official source documents reference the same event.
2. Deterministic validation passes on all key fields (company, amount, dates, affected group).
3. At least one editor has signed off (`editorial_reviews` row).
4. At least one legal reviewer has signed off (`editorial_reviews` row with `role = 'legal_reviewer'`).
5. No open correction or dispute flag on the claim.

## State Transitions

- Any status may transition to `rejected` or `closed` when evidence warrants.
- `verified_claimable` → `closed` requires editor sign-off + public correction note.
- Backward transitions (e.g. `verified_claimable` → `potential_claimable`) create a `corrections` row automatically.
