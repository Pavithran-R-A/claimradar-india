# AGENTS.md — ClaimRadar India Coding Standards

## Language & Type Safety

- TypeScript strict mode everywhere — no exceptions.
- `any` is forbidden except at explicitly documented integration boundaries (e.g. third-party webhook payloads) where a typed escape-hatch comment is required.
- Shared types live in `packages/shared-types`; import from there, never duplicate.

## Secrets & Credentials

- No secrets, tokens, API keys or credentials in source control — ever.
- Service-role / admin keys are server-only; never expose to client bundles.
- All environment variables are declared in `.env.example` (no real values).

## Validation

- Zod schemas validate every external boundary: API request bodies, webhook payloads, crawler responses, environment variables.
- Never trust data from external sources — including our own crawler output — without validation.

## Code Quality

- Small, single-purpose, testable modules.
- Clear error handling — no silent failures, no swallowed exceptions.
- Prefer explicit returns over implicit; name things descriptively.
- Database schema changes require a migration file — never hand-edit `schema.sql`.

## Data & Security

- Row Level Security (RLS) on all user-owned tables.
- Admin/privileged operations use service-role keys in server contexts only.
- Audit log entries for privileged state changes.

## UI & Accessibility

- Semantic HTML first; ARIA only when HTML semantics are insufficient.
- Mobile-first responsive design.
- Honour `prefers-reduced-motion` — no gratuitous animation.
- WCAG 2.2 AA minimum contrast and focus-visible indicators.

## Content Integrity

- No fake legal, company, payment or user data may be presented as real.
- Demo/seed data must be clearly labelled as such in the UI.
- No claim may be labelled `verified_claimable` without satisfying the full publication rules pipeline.
- Never replace a working implementation with a static mockup.

## Testing Discipline

- Run `format`, `lint`, `typecheck` and `test` before declaring any phase complete.
- Never claim work complete when tests are failing.
- Never disable, skip or comment-out tests to make a build pass.

## External Systems

- Do not bypass CAPTCHAs or protected access systems.
- Obey public-site terms of service, `robots.txt` policies and rate limits.
- Use a transparent user-agent identifying ClaimRadar India when crawling.

## Brand & Configuration

- "ClaimRadar India" is a temporary project name — do not hardcode it.
- All brand text (site name, tagline, legal disclaimers) must reference a centralised config module.
