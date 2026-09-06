# ClaimRadar India Completion Design

## Goal

Bring ClaimRadar India to the strongest internally complete release candidate
that this repository can support, while preserving the protected `origin/main`
soak and all unrelated work in the original checkout.

## Scope

The completion branch covers the public product, authenticated customer
experience, admin operations, API and server actions, crawler adapters, data
quality, migrations, authentication and authorization, security, observability,
CI, release evidence, deployment readiness, accessibility, performance, tests,
and documentation.

## Baseline and branch safety

- Base: `origin/main` at `fc14de90783587013e692a70281ea88b8c3920f5`.
- Imported frontend branch: `origin/frontend/claimradar-experience-redesign` at `d3f3e9cb338c1b0d98a2f5e3696b8081c33c07b3`.
- Working branch: `codex/claimradar-completion`.
- Original dirty checkout remains untouched.
- `origin/main` is never modified or merged.
- Runtime-sensitive changes invalidate the current main soak.

## Product architecture

The primary journey is `DISCOVER -> UNDERSTAND -> VERIFY -> ACT OFFICIALLY ->
TRACK / WATCH`. Public surfaces use an editorial public-benefit finance system:
open layouts, human-readable typography, clear source provenance, restrained
deadline emphasis, and an evidence thread from source to official action.
Authenticated surfaces use a dense but calm product shell. Admin surfaces use
scanable operational tables and explicit safe actions. Cards, pills, gradients,
fake metrics, and decorative activity are used only when they clarify a real
workflow.

## Integrity requirements

- Unknown evidence remains unknown.
- Official action always links externally.
- ClaimRadar never implies filing claims.
- Published facts require source evidence.
- Failed sources never appear successful.
- User data remains ownership-scoped.
- Backend secrets never reach clients.
- Staging never publishes, bills, or notifies accidentally.
- Release evidence remains fail-closed.

## Verification gates

Each slice requires focused tests, then formatting, lint, typecheck, and
browser verification where visual or interactive behavior changes. Final checks
include repository tests, inventory acceptance, build, client secret scanning,
crawler regressions, migration checks, accessibility checks, responsive checks,
performance inspection, and actual Preview browser QA. External blockers are
reported separately and never marked as passing.
