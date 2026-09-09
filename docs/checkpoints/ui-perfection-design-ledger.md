# UI Perfection Design Ledger

Branch: `codex/claimradar-ui-perfection`

Baseline runtime freeze: `7f4834f23f48baeeb871afe3c0594fef9612b677`

This ledger records visual changes only. Runtime behavior remains unchanged.

| BEFORE_ISSUE                                                             | CHANGE                                                                         | WHY_BETTER                                                                   | EVIDENCE                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| The homepage began with a large headline without a category cue.         | Added the `Public records, made useful` editorial kicker.                      | Establishes the product promise before the headline.                         | In-app Browser homepage screenshot and DOM snapshot.              |
| Trust signals sat beside navigation links without a clear reading order. | Added a quiet proof rail for official links, human review, and no filing fees. | Makes the service boundary scannable without adding fake metrics.            | In-app Browser homepage screenshot and copy-contract tests.       |
| Empty directory guidance used four nested cards.                         | Recast the empty state as a numbered semantic process list.                    | Reduces card-wall density and clarifies publication stages.                  | In-app Browser directory screenshot and visual-composition tests. |
| Directory filtering had weak visual priority.                            | Added a blue edge cue and restrained shadow to the filter panel.               | Separates controls from truthful empty results without overstating status.   | In-app Browser directory screenshot.                              |
| Auth card lacked a strong entry point.                                   | Added a restrained trust-colored top rule and simpler radius.                  | Gives the form a clear starting edge while preserving focus behavior.        | In-app Browser login screenshot and accessibility contract tests. |
| Customer and admin navigation treated active and hover states alike.     | Added border-led active states and quieter mobile controls.                    | Improves orientation and keyboard-visible affordances without pill-heavy UI. | Shared navigation source review and lint/type tests.              |

## Review notes

- No fabricated records, metrics, or testimonials added.
- No crawler, database, auth, RLS, or API code changed.
- Motion remains bounded by the existing reduced-motion rules.
- Staging content remains the source of truth.
