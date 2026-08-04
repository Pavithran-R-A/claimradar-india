# ClaimRadar India — Staging Supabase Setup & Preflight Guide

**Version:** 1.0.0  
**Status:** Specification Ready  
**Last Updated:** August 5, 2026

---

## 1. Environment Variable Template (`.env.staging.example`)

To deploy ClaimRadar India to a Supabase staging instance, configure the following environment variables. **NEVER commit real API keys or service role secrets to Git.**

```ini
# Supabase Staging API & Storage Configuration
SUPABASE_URL="https://<staging-project-ref>.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
DATABASE_URL="postgres://postgres:<password>@db.<staging-project-ref>.supabase.co:6543/postgres"

# Application Environment & Policy Guards
APP_ENV="staging"
AUTO_VERIFY_CLAIMABLES="false"
ENABLE_BILLING="false"

# Crawler Identity & Observability (Mandatory Compliance)
CRAWLER_USER_AGENT="ClaimRadarBot/0.1 (+https://claimradar.in/bot)"
CRAWLER_CONTACT_EMAIL="dev@claimradar.in"

# AI Provider Configuration (Optional)
AI_PROVIDER="noai"
```

---

## 2. Preflight Safety Validation Command

Before attempting any live ingestion against staging or production Supabase, run the preflight validation check:

```powershell
$env:PATH = "C:\Users\Pavithran R A\AppData\Local\pnpm\bin;C:\Users\Pavithran R A\AppData\Local\pnpm;" + $env:PATH
pnpm crawler:preflight -- --environment=staging
```

### Safety Refusal Rules

The preflight command strictly REFUSES execution and exits non-zero if:

1. `AUTO_VERIFY_CLAIMABLES` is set to `true`.
2. `ENABLE_BILLING` is set to `true`.
3. `--dry-run` and `--live-write` flags conflict.
4. `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing or invalid.
5. Crawler User-Agent or Contact Email is absent.
6. Target database is unreachable.
