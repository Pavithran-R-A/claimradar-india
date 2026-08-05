# ClaimRadar India

ClaimRadar India is an independent information platform that aggregates refund, compensation and
claim opportunities for consumers and investors in India. It monitors official sources — consumer
authorities, courts and tribunals, financial regulators, company public notices and government
press releases — extracts structured claim data, and publishes only the records that pass a
strict editorial and publication policy.

The product is an information service: it surfaces opportunities and links to the official sources.
It does **not** file claims on users' behalf and does **not** guarantee outcomes.

## Repository layout

This is a pnpm monorepo.

| Path                       | Purpose                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `apps/web`                 | Next.js 15 (App Router) web application: public site, signed-in app, auth and admin. |
| `apps/crawler`             | Source ingestion pipeline: adapters, extraction, deduplication and publication.      |
| `packages/shared-types`    | Shared TypeScript types used across apps and packages.                               |
| `packages/claim-schema`    | Zod schemas for claim data at every external boundary.                               |
| `packages/config`          | Shared runtime configuration.                                                        |
| `packages/database`        | Database schema, migrations and typed access helpers.                                |
| `packages/design-system`   | Design tokens and shared UI primitives.                                              |
| `packages/seo`             | SEO helpers and metadata conventions.                                                |
| `packages/source-registry` | Registry of monitored official sources.                                              |
| `packages/test-utils`      | Shared test helpers.                                                                 |
| `scripts/`                 | Operational and acceptance scripts (see Key scripts).                                |
| `docs/`                    | Architecture, policy and operations documentation.                                   |

## Prerequisites

- **Node.js 24** — the repository targets `node >=24 <25`. If you use [fnm](https://github.com/Schniz/fnm):
  ```powershell
  fnm install 24
  fnm use 24
  # or, to auto-load from .nvmrc in this directory:
  fnm env --use-on-cd --shell power-shell | Out-String | Invoke-Expression
  ```
- **pnpm 11.18.0** (the package manager version used for development; `engines` allows `>=9`):
  ```powershell
  corepack enable
  corepack prepare pnpm@11.18.0 --activate
  ```
- **Docker** — required to run the local Supabase stack (`supabase start`) for database-backed
  verification. See `docs/environment-setup-windows.md` and `docs/database.md`.

## Getting started

```powershell
# 1. Install dependencies
pnpm install

# 2. Configure environment
# Copy .env.example to .env (per app as needed) and fill in local values.
# No real secrets are committed.

# 3. (Optional) Start local Supabase for database-backed flows
supabase start

# 4. Run the web app in development
pnpm dev
```

## Key scripts

Run from the repository root:

| Script                                                                           | What it does                                                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm dev`                                                                       | Start the web app in development (`apps/web`).                                                 |
| `pnpm build`                                                                     | Build every workspace package and app.                                                         |
| `pnpm lint`                                                                      | Run ESLint across the repository.                                                              |
| `pnpm typecheck`                                                                 | Run `tsc --noEmit` in every workspace.                                                         |
| `pnpm test`                                                                      | Run the Vitest workspace (`apps/*/vitest.config.ts`, `packages/*/vitest.config.ts`).           |
| `pnpm format`                                                                    | Check formatting with Prettier.                                                                |
| `pnpm format:fix`                                                                | Fix formatting with Prettier.                                                                  |
| `pnpm test:phase-4b-offline`                                                     | Full offline gate: format + lint + typecheck + test + build.                                   |
| `pnpm test:phase-4b-acceptance`                                                  | Run the Phase 4B evidence-driven acceptance runner (`scripts/phase-4b-acceptance-runner.mjs`). |
| `pnpm test:inventory-acceptance`                                                 | Run the crawler acceptance suite.                                                              |
| `pnpm verify:local-ingestion`                                                    | Verify local database ingestion (`scripts/verify-local-database-ingestion.mjs`).               |
| `pnpm crawler:daily` / `crawler:source` / `crawler:health` / `crawler:preflight` | Run crawler modes.                                                                             |

## Policies

- **Auto-verification is disabled by policy.** The master gate `AUTO_VERIFY_CLAIMABLES` defaults to
  `false`; records require human editorial review before publication. See
  `docs/publication-policy.md`.
- **Billing is disabled by policy.** `ENABLE_BILLING` is set to `false` in the reference setup; paid
  features are gated off. See `docs/staging-supabase-setup.md`.
- **No fake data is presented as real.** Demo data is only served behind an explicit
  `ENABLE_DEMO_DATA` flag outside production and is always visibly labelled. Public directories show
  honest empty/error states when no published records exist.

## Documentation

Deeper detail lives in `docs/`:

- `docs/architecture.md` and `docs/crawler-architecture.md` — system design.
- `docs/publication-policy.md` and `docs/editorial-policy.md` — what gets published and how.
- `docs/claim-taxonomy.md` — status and claim classification.
- `docs/database.md` and `docs/staging-supabase-setup.md` — schema and local/staging Supabase.
- `docs/operations-runbook.md` and `docs/environment-setup-windows.md` — setup and operations.
- `docs/security-model.md` and `docs/legal-risk-register.md` — security and legal posture.

## Development standards

Coding standards are defined in `AGENTS.md`. Highlights: TypeScript strict mode everywhere, no
secrets in source control, Zod validation at every external boundary, Server Components by default,
design tokens from `packages/design-system`, WCAG 2.2 AA accessibility, and honest content handling
(no fabricated data).
