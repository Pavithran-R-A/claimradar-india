# ClaimRadar India — Operations, Triage & Recovery Runbook

**Version:** 1.0.0 (Production Candidate)  
**Last Updated:** August 29, 2026  
**Topology:** Vercel (`claimradar-staging`) + Supabase (`qsshiksnyflwsybjyzob`) + GitHub Actions (`Pavithran-R-A/claimradar-india`)

---

## 1. Fast Triage Matrix ("What to check when ClaimRadar appears broken")

```
                            [ Incident Detected ]
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
     [ Web UI Errors ]      [ Stale / Missing Data ]   [ Auth / Login Failures ]
              │                       │                       │
     1. Check Vercel Logs    1. Check GH Actions     1. Check Supabase Auth
        `vercel logs`           `gh run list`           Rate limits / SMTP
     2. Check Sentry/APM     2. Check `crawl_runs`   2. Verify JWT / Key sync
     3. Check Edge Config    3. Inspect `sources`    3. Check `profiles` RLS
```

### Component Triage Runbook

| Component             | Symptom                      | Diagnostic Command / Log                             | Remediation                                                                                                          |
| :-------------------- | :--------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Vercel Web App**    | 500 / 502 / 504 on routes    | `npx vercel logs claimradar-staging`                 | Check environment variable mismatches, server crash logs; redeploy previous deployment if regression.                |
| **Supabase Database** | Connection timeout / `57014` | Check Supabase Dashboard project status / metrics    | Ensure pooler connection string is used for high concurrency; inspect active locks via `pg_stat_activity`.           |
| **Crawler Ingestion** | No new candidates discovered | `gh run list --workflow=daily-crawl`                 | Inspect `crawl_runs` and `crawl_errors` tables in Supabase; verify source portals are reachable without IP blocking. |
| **Authentication**    | Login fails / 429 rate limit | Check `/auth/v1/token` responses in browser DevTools | If default Supabase SMTP rate limit is reached, configure Custom SMTP in Supabase Auth settings.                     |

---

## 2. Disaster Recovery & Database Reconstruction from Zero

### A. Rebuilding Local Database

1. Ensure Node 24 is active:
   ```bash
   node -v # Ensure Node.js >= 24
   ```
2. Reset and execute all migrations from empty database:
   ```powershell
   npx supabase db reset
   ```
3. Run schema linter and tests:
   ```powershell
   npx supabase db lint
   pnpm test
   ```

### B. Disaster Recovery for Remote Staging / Production

1. Link to target project:
   ```powershell
   npx supabase link --project-ref <PROJECT_REF>
   ```
2. Apply full migration chain:
   ```powershell
   npx supabase db push
   ```
3. Verify remote RLS security suite:
   ```powershell
   node --env-file=.env.staging scripts/verify-staging-rls-complete.mjs
   ```

---

## 3. Rollback Procedures

### A. Vercel Instant Deployment Rollback

If a regression occurs on the live web deployment:

```powershell
# List prior successful deployments
npx vercel list claimradar-staging

# Instantly alias the prior good deployment
npx vercel alias <PRIOR_DEPLOYMENT_URL> claimradar-staging.vercel.app
```

### B. Git & CI Rollback

```powershell
git revert HEAD -m "revert: rollback due to incident"
git push origin main
```

---

## 4. Credential Rotation Runbook

In the event a secret is exposed or needs scheduled rotation:

1. **Supabase Modern Secret Key (`sb_secret_...`)**:
   - Go to Supabase Dashboard → Project Settings → API Keys.
   - Click **Create modern secret key** (name: `claimradar-backend-rotation`).
   - Update `.env.staging`, Vercel environment variables, and GitHub Actions Secrets with the new key.
   - Delete the old/compromised secret key.
   - Run `node --env-file=.env.staging scripts/verify-staging-rls-complete.mjs` to verify zero disruption.
2. **Never commit secret keys**: All backend keys are strictly isolated from client-side bundles (`.next/static`).
