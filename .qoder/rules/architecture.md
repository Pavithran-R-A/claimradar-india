# Architecture

## Monorepo Structure

pnpm workspace monorepo. Run all commands from the repo root with `pnpm --filter <workspace>`.

```
apps/
  web/          # Next.js App Router (Node.js runtime)
  crawler/      # Node.js ingestion worker (cron + queue)
packages/
  shared-types/ # Zod schemas, TS interfaces, enums
  claim-schema/ # Claim lifecycle, status state-machine, scoring
  config/       # Brand, environment, feature-flag central config
  source-registry/ # Source definitions (URLs, parsers, rate limits)
  seo/          # Metadata helpers, JSON-LD builders, sitemap utils
  design-system/  # Tailwind config, shadcn/ui wrappers, tokens
  database/     # Drizzle/Kysely schema, migrations, client factory
  test-utils/   # Shared factories, mocks, fixtures
```

## Rendering Strategy

- **Server Components** by default — data fetching at the edge, zero client JS.
- **Client Components** (`'use client'`) only when interactivity, state or browser APIs are required.
- SSG/ISR for public pages (claim listings, company profiles, sector hubs).
- Dynamic rendering for authenticated dashboards and search.

## Data Flow

```
Official sources (PIB, RBI, SEBI …)
        ↓  crawler (cron)
   Validation (Zod)
        ↓
  Supabase Postgres
        ↓
  Next.js App Router (SSR/ISR)
        ↓
     Public / Auth UI
```

## Conventions

- TypeScript strict mode, no `any` without documented justification.
- Every workspace exports a typed public API; consumers import only from the package root.
- Shared logic belongs in `packages/` — never duplicate across apps.
- Database access goes through `packages/database` client; no raw SQL in app code.
