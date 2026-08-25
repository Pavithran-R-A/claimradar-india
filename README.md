# ClaimRadar India

ClaimRadar India is an information platform for finding refund, compensation and claim opportunities published by official Indian sources.

The project monitors sources such as regulators, courts, tribunals, government notices and company publications, turns relevant notices into structured records, and keeps a human review step before anything is treated as publishable. It links users back to the original source; it does not file claims or promise that a claim will succeed.

## Repository overview

This is a pnpm monorepo with the public web application and ingestion pipeline in one codebase.

```text
apps/web/                  Next.js web app and admin surfaces
apps/crawler/              source adapters and ingestion pipeline
packages/claim-schema/     shared Zod schemas
packages/database/         schema, migrations and data access
packages/design-system/    shared UI primitives and tokens
packages/source-registry/  monitored-source definitions
packages/shared-types/     shared TypeScript types
docs/                      architecture, policy and operations notes
scripts/                   local verification and acceptance helpers
```

## Development setup

The current repository targets Node.js 24 and uses pnpm. Docker is needed for the local Supabase-backed verification flows.

```bash
pnpm install
pnpm dev
```

For database-backed work, start/configure the local Supabase environment as described in [`docs/database.md`](docs/database.md) and [`docs/environment-setup-windows.md`](docs/environment-setup-windows.md).

Do not commit real credentials. Use the provided environment examples and local values.

## Useful commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format
```

The repository also has focused ingestion and acceptance commands for deeper verification. `package.json` is the source of truth for the current command names.

## Publication approach

The crawler is intentionally conservative. A fetched notice is not automatically the same thing as a verified claim opportunity, so the system keeps source provenance and review state throughout the pipeline.

A few principles guide the implementation:

- official/source evidence stays attached to a record
- external input is validated at boundaries
- demo data is not presented as real claim data
- publication requires the configured review path
- billing is not required for the core information flow

The detailed rules live in [`docs/publication-policy.md`](docs/publication-policy.md) and [`docs/editorial-policy.md`](docs/editorial-policy.md).

## Documentation

If you are reviewing the codebase, these are the best places to continue:

- [`docs/architecture.md`](docs/architecture.md) — application architecture
- [`docs/crawler-architecture.md`](docs/crawler-architecture.md) — ingestion pipeline
- [`docs/database.md`](docs/database.md) — schema and local database workflow
- [`docs/security-model.md`](docs/security-model.md) — trust boundaries and security decisions
- [`docs/operations-runbook.md`](docs/operations-runbook.md) — operational workflow

Development conventions are documented in `AGENTS.md`.

## Status

ClaimRadar is still under active development. The repository contains substantial local verification, but deployment state and live-source behaviour should be checked against the current project documentation before treating a branch as production-ready.
