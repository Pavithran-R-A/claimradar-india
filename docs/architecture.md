# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│  Official Sources (PIB, RBI, SEBI, IRDAI, CCI, NCLT)│
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (cron, daily)
                       ▼
              ┌─────────────────┐
              │  apps/crawler   │  Node.js worker
              │  Parser + Zod   │  Queue per source
              └────────┬────────┘
                       │ validated rows
                       ▼
              ┌─────────────────┐
              │   Supabase      │  Postgres + Auth
              │   (RLS)         │  Storage (PDFs)
              └────────┬────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   ┌────────────────┐    ┌────────────────┐
   │  apps/web      │    │  apps/web      │
   │  Public (ISR)  │    │  Auth/Dashboard│
   │  SSG pages     │    │  SSR dynamic   │
   └────────────────┘    └────────────────┘
```

## Monorepo Layout

```
apps/web         — Next.js App Router (public + auth UI)
apps/crawler     — Node.js ingestion worker (cron + queue)
packages/
  shared-types   — Zod schemas, TS interfaces, enums
  claim-schema   — Claim lifecycle state-machine, scoring
  config         — Brand, env, feature-flag central config
  source-registry— Source URLs, parsers, rate-limit rules
  seo            — Metadata, JSON-LD, sitemap helpers
  design-system  — Tailwind config, shadcn/ui wrappers
  database       — Drizzle/Kysely schema, migrations, client
  test-utils     — Factories, mocks, fixtures
```

## Data Flow

1. **Crawler** fetches official source (transparent user-agent, rate-limited).
2. **Parser** extracts raw fields → Zod validation.
3. **AI extraction** enriches unstructured content → Zod validation.
4. **Deterministic validator** cross-checks fields (CIN patterns, dates, amounts).
5. Valid rows written to Postgres with `source_trace` link.
6. **Rule engine** scores claims (Claimability Score 0–100).
7. **Publication rules** decide auto-publish vs. human review.
8. **Next.js** serves ISR-cached public pages; revalidates on DB change.

## Auth Flow

- Supabase Auth: email + magic link (OAuth later).
- JWT stored in httpOnly cookie; RLS policies reference `auth.uid()`.
- Admin/researcher roles assigned via `user_roles` table (service-role write only).

## Deployment

- **Web**: Vercel (automatic ISR, edge middleware).
- **Crawler**: Railway / Fly.io (cron-triggered container).
- **DB**: Supabase Free tier (Postgres + Auth + Storage).
