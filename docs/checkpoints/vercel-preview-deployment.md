# Vercel Preview Deployment Verification Report

**Timestamp:** 2026-08-07T16:16:31Z  
**Environment:** `staging` (Preview Scope)  
**Vercel Project:** `pavithrans-projects-cae184b1/claimradar-staging`  
**Git Branch:** `qoder/complete-claimradar` (HEAD `304177fafb7e79f5722bc4a47de355ecd219a04a`)  

---

## 1. Deployment Details

| Field | Value |
|---|---|
| **Deployment ID** | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` |
| **Preview URL** | `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app` |
| **Inspector URL** | `https://vercel.com/pavithrans-projects-cae184b1/claimradar-staging/DeoK4Zp1VmNyXyS6nzfTyngbJpwc` |
| **Ready State** | `READY` |
| **Monorepo Root Directory** | `apps/web` |
| **Framework Preset** | Next.js (`nextjs`) |
| **Node.js Engine** | Node 24 (`v24.19.0`) |
| **Package Manager** | `pnpm` (`v11.20.0`) |

---

## 2. Environment Variables Configuration

The following Preview environment variables are configured on the Vercel project scope:

| Variable | Scope | Status | Value / Reference |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | PASS | Staging Project URL (`https://upvsfqufkywlpibbwrse.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preview | PASS | Staging Publishable Key |
| `SUPABASE_URL` | Preview | PASS | Staging Project URL (`https://upvsfqufkywlpibbwrse.supabase.co`) |
| `APP_ENV` | Preview | PASS | `staging` |
| `AUTO_VERIFY_CLAIMABLES` | Preview | PASS | `false` |
| `ENABLE_BILLING` | Preview | PASS | `false` |
| `NEXT_PUBLIC_ENABLE_BILLING` | Preview | PASS | `false` |
| `NOTIFY_CUSTOMERS_ENABLED` | Preview | PASS | `false` |

---

## 3. Deployment Safety Verification

- [x] **Production Deployment:** NOT EXECUTED (`vercel --prod` was NOT run).
- [x] **Staging Database Integrity:** Retained without recreation or destructive reset.
- [x] **Billing Enforcement:** Billing remains completely disabled (`ENABLE_BILLING=false`).
- [x] **Auto-Publish Enforcement:** Auto-publish remains completely disabled (`AUTO_VERIFY_CLAIMABLES=false`).
