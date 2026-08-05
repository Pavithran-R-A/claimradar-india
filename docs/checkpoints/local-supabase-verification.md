# ClaimRadar India — Local Supabase & Database Verification Checkpoint

**Audit Date:** August 5, 2026  
**Status:** `PASSED_LOCAL_DATABASE_STACK`  
**Target:** Local Supabase Stack on Docker Desktop WSL 2 (`postgresql://postgres:postgres@127.0.0.1:54322/postgres`)

---

## 1. Summary of Accomplishments

1. **Docker & Supabase Microservices:**
   - Docker Desktop WSL 2 daemon verified active (`docker version`, `docker info`).
   - Local Supabase containers started (`npx supabase start`).
2. **Schema & Security Defect Resolutions:**
   - **RLS Policy Syntax:** Repaired `006_rls_policies.sql` by removing invalid `WITH CHECK` clauses on `FOR SELECT` policies.
   - **Role Escalation Trigger:** Repaired `008_security_fixes.sql` so seed/migration scripts (`auth.uid() IS NULL`) can assign profile roles while PostgREST requests are restricted.
   - **Table Privilege ACLs:** Granted explicit table-level `SELECT, INSERT, UPDATE, DELETE` permissions to `anon`, `authenticated`, and `service_role` roles in `008_security_fixes.sql` and `009_freshness_and_deduplication.sql`.
   - **Seed File FK Order:** Fixed `supabase/seed.sql` to insert `auth.users` mock records before `profiles`.
3. **Database Reproducibility:**
   - Migration reset 1: `npx supabase db reset` -> **PASSED**.
   - Migration reset 2: `npx supabase db reset` -> **PASSED**.
4. **Database Quality & Security Assertions:**
   - Schema Linting: `npx supabase db lint` -> **PASSED (0 errors)**.
   - pgTAP Suite: `npx supabase test db` -> **PASSED (8 files / 39 subtests passed 100%)**.
5. **Controlled Ingestion & Idempotency Proved:**
   - Ingested 2 fixture documents twice via [`apps/crawler/scripts/verify-local-database-ingestion.ts`](file:///C:/Users/Pavithran%20R%20A/Documents/Qoder/2026-07-27/chat-1/apps/crawler/scripts/verify-local-database-ingestion.ts).
   - Run 1 created 2 new documents and 2 new clusters.
   - Run 2 created 0 new documents and 0 new clusters (reused existing documents and clusters).
   - Provenance junction linking and cleanup verified 100%.

---

## 2. Next Steps for Staging Commissioning

When disposable staging Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) become available:

1. Apply migrations `001` through `009` to staging Supabase instance (`npx supabase db push`).
2. Run database preflight against staging (`pnpm crawler:preflight -- --environment=staging`).
3. Execute controlled live source ingestion run against staging database.
4. Verify staging idempotency.
