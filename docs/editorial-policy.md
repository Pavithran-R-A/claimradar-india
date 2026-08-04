# Editorial Policy

## Auto-Publish Rules

| Source Status         | Auto-publish?       | Rationale                                                     |
| --------------------- | ------------------- | ------------------------------------------------------------- |
| `official_update`     | Yes                 | Directly sourced from official documents; low defamation risk |
| `potential_claimable` | Yes                 | Clearly framed as "potential"; disclaimer always present      |
| `refund_ordered`      | Yes                 | Factual report of an official order                           |
| `registration_open`   | Yes                 | Time-sensitive; delay harms users                             |
| `verified_claimable`  | **Never initially** | Requires editor + legal sign-off before first publication     |

## Never Auto-Publish

- `verified_claimable` — must always pass through human review.
- Any claim where deterministic validation has flagged inconsistencies.
- Claims referencing individuals (not entities) by name.

## Publication Workflow

1. **Ingestion** → claim enters as `detected`.
2. **Rule engine** assigns status and Claimability Score.
3. Auto-publishable statuses go live immediately with standard disclaimers.
4. Non-auto-publishable claims enter `publication_queue` for review.
5. Editor reviews, may adjust status / score, adds editorial notes.
6. Legal reviewer signs off for `verified_claimable`.
7. Claim goes live; `editorial_reviews` rows record both sign-offs.

## Correction Workflow

- Any published claim can receive a correction (factual error, status change, retraction).
- Corrections create a new `corrections` row linking to the original claim revision.
- Public claim page displays "Correction: <summary>" with link to full correction log.
- Original content is never deleted — only appended to.

## Spot-Check Policy

- Auto-published claims are sampled weekly (≥ 10 %) by an editor.
- Spot-check failures trigger immediate review + potential unpublish + correction.
- Results logged in `editorial_reviews` with `type = 'spot_check'`.

## Editorial Standards

- Language must be factual, neutral and sourced.
- Never use speculative or emotive framing ("scam", "cheated").
- Always link to the original official source document.
- Clearly distinguish between confirmed facts and platform analysis.
