# ClaimRadar India — Staging Supabase Setup & Preflight Guide

**Version:** 2.0.0
**Status:** Specification Ready
**Last Updated:** August 6, 2026

---

## 1. Exact credential list

Provisioning staging requires exactly these five values. **NEVER commit real
keys or service-role secrets to Git.** In GitHub Actions they belong in the
`staging` **environment** (Settings → Environments → staging), not at
repository level, so only jobs declaring `environment: staging` can read them.

| Variable                       | Value / Shape                                                            | Where it is used                                                                                                                     |
| :----------------------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `STAGING_SUPABASE_PROJECT_REF` | 20-char project ref, e.g. `abcdefghijklmnopqrst`                         | Derives URL and DATABASE_URL; stored as a GitHub variable; consumed by `scripts/staging-preflight.mjs` migration parity check        |
| `SUPABASE_URL`                 | `https://<STAGING_SUPABASE_PROJECT_REF>.supabase.co`                     | Crawler, web app server env (`apps/web/env.ts`), preflight. Web browser client consumes the same value as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY`     | Publishable key from Project Settings → API                              | Web app browser-side (RLS enforced) — consumed as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                                             |
| `SUPABASE_SECRET_KEY`          | Secret server key from Project Settings → API                            | Crawler admin client + web server-only code — never ships to the browser                                                             |
| `DATABASE_URL`                 | `postgresql://postgres:<db-password>@db.<ref>.supabase.co:5432/postgres` | Supabase CLI migrations (`db push`), psql for backup/restore                                                                         |

GitHub Actions mapping (workflow secret names on the left):

- `SUPABASE_URL` ← staging Supabase project URL
- `SUPABASE_SECRET_KEY` ← staging server secret
- `SUPABASE_PUBLISHABLE_KEY` ← staging publishable key. The crawler workflows do not use it;
  it is required by Vercel Preview deployments of the web app, where it must
  be set as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see
  `docs/deployment-readiness.md` → Vercel Preview deployment).

> Legacy note: `STAGING_SUPABASE_PROJECT_REF` / `STAGING_SUPABASE_URL` /
> `STAGING_SUPABASE_ANON_KEY` / `STAGING_SUPABASE_SERVICE_ROLE_KEY` /
> `STAGING_SUPABASE_DATABASE_URL` are the canonical staging-prefixed names for
> local `.env.staging` files; the workflows consume the unprefixed names above.
> `scripts/staging-preflight.mjs` accepts both naming schemes (prefixed first).

---

## 2. Environment Variable Template (`.env.staging.example`)

```ini
# Supabase Staging API & Storage Configuration
STAGING_SUPABASE_PROJECT_REF="<staging-project-ref>"
SUPABASE_URL="https://<staging-project-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
DATABASE_URL="postgresql://postgres:<db-password>@db.<staging-project-ref>.supabase.co:5432/postgres"

# Application Environment & Policy Guards (staging invariants — never change)
APP_ENV="staging"
AUTO_VERIFY_CLAIMABLES="false"
ENABLE_BILLING="false"
NEXT_PUBLIC_ENABLE_BILLING="false"
NOTIFY_CUSTOMERS_ENABLED="false"

# Web app build requirements (apps/web/env.ts — NEXT_PUBLIC_* values are
# inlined into the browser bundle at build time; browser-safe values only)
NEXT_PUBLIC_SITE_URL="https://<vercel-preview-or-staging-domain>"
NEXT_PUBLIC_SITE_NAME="ClaimRadar India"
NEXT_PUBLIC_SUPABASE_URL="https://<staging-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Email — console provider only; real mail is production-only (see docs/deployment-readiness.md → SMTP)
EMAIL_PROVIDER="console"

# Crawler Identity & Observability (Mandatory Compliance)
CRAWLER_USER_AGENT="ClaimRadar India Bot/1.0 (+https://claimradar.in)"
CRAWLER_CONTACT_EMAIL="dev@claimradar.in"

# AI Provider Configuration (Optional)
AI_PROVIDER="none"

# Operational alerts: structured log lines by default; no credentialed channels
ALERT_SINK="log"
ALERT_DEDUP_WINDOW_MINUTES="60"
```

---

## 3. Applying migrations to staging

The schema lives in `supabase/migrations` and MUST be applied in order. The
current migration list (apply all; Supabase tracks already-applied ones in
`supabase_migrations.schema_migrations`):

```
001_initial_schema.sql
002_ingestion_tables.sql
003_user_tables.sql
004_billing_tables.sql
005_editorial_tables.sql
006_rls_policies.sql
007_profile_trigger.sql
008_security_fixes.sql
009_freshness_and_deduplication.sql
010_user_product.sql
011_notifications.sql
```

Commands (PowerShell; use `;` separators, never `&&`):

```powershell
# One-time: link the local project folder to the staging project ref
supabase link --project-ref <staging-project-ref>

# Apply all pending migrations (idempotent; safe to re-run)
supabase db push

# Verify applied versions
psql "$env:DATABASE_URL" -c "select version, name from supabase_migrations.schema_migrations order by version;"
```

**NEVER run `supabase db reset --linked` against staging (or production).**
It drops and recreates the remote database and destroys data. `db reset` is
only ever valid for the local stack (`supabase db reset` without `--linked`).
Schema rollbacks are handled as new forward migrations — see
`docs/operations-runbook.md` → Rollback Procedures.

---

## 4. Preflight Safety Validation Commands

Before attempting any live ingestion against staging, run BOTH preflights:

```powershell
# Infrastructure preflight (connectivity, migration parity, RLS spot checks).
# Credential-free safe: prints SKIP_CREDENTIALS and exits 0 without creds.
pnpm preflight:staging

# Crawler policy gate (refuses unsafe guard values)
pnpm crawler:preflight -- --environment=staging
```

### Preflight behavior (as implemented)

The preflight command:

1. **REFUSES and exits non-zero** if `AUTO_VERIFY_CLAIMABLES` is `true`.
2. **REFUSES and exits non-zero** if `ENABLE_BILLING` is `true`.
3. Prints the crawler identity (User-Agent) for compliance review.
4. Reports `SKIP_CREDENTIALS (Not set)` and exits `0` when `SUPABASE_URL` or
   `SUPABASE_SECRET_KEY` is absent — local runs without staging
   credentials skip live ingestion honestly instead of failing.
5. Reports `PASS` for each credential present when they are set.

The Daily Crawl workflow runs this as a hard gate before any live write.

### Infrastructure preflight (`scripts/staging-preflight.mjs`)

Read-only checks against the staging project, using the standard status
vocabulary `PASS` / `FAIL` / `SKIP_CREDENTIALS` / `NOT_EXECUTED`:

1. **Policy guards** (`APP_ENV`, `AUTO_VERIFY_CLAIMABLES`, `ENABLE_BILLING`,
   `NOTIFY_CUSTOMERS_ENABLED`) — run always, FAIL hard on unsafe values.
2. **Connectivity** — REST endpoint reachable with the service-role key.
3. **Migration list parity** — local `supabase/migrations` (001–011) vs
   applied versions on the linked project (via Supabase CLI; requires
   `STAGING_SUPABASE_PROJECT_REF` + `SUPABASE_ACCESS_TOKEN`).
4. **RLS spot checks** — anon key must be denied on admin tables
   (`audit_logs`, `ai_runs`, `crawl_errors`); server secret must read
   `crawl_runs`.

Without credentials every remote check reports `SKIP_CREDENTIALS` and the
script exits 0 — it never fabricates results.

---

## 5. Staging safety invariants

These hold for staging at all times and are enforced in CI/workflows:

- `AUTO_VERIFY_CLAIMABLES=false` — every claimable passes human review.
- `ENABLE_BILLING=false` and `NEXT_PUBLIC_ENABLE_BILLING=false` — no billing
  side effects server-side or in the browser bundle.
- `NOTIFY_CUSTOMERS_ENABLED=false` — staging must never notify real customers.
- Secrets live only in the GitHub `staging` environment; production
  credentials are never added there.
- TLS is never weakened to work around source certificate problems (CCI
  precedent: the source was disabled instead).
