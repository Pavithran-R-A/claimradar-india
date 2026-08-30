# ClaimRadar India — Pre-Human Final Release Gate Report

**Evaluation Timestamp:** August 30, 2026  
**Topology:** Vercel (`claimradar-staging`) + Supabase (`qsshiksnyflwsybjyzob`) + GitHub Actions (`Pavithran-R-A/claimradar-india`)  
**Authoritative Branch:** `main`

---

## 1. Executive Status Matrix

```ini
RUNTIME_FREEZE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_RUN = 33310672900
FINAL_SOAK_START = 2026-08-30T12:08:03Z
RUNTIME_BEHAVIOR_CHANGED_AFTER_BASELINE = false
REPORT_SOURCE_HEAD = 208a5d7de051de8a134e2fcf5357f1039097f4ad

WORKTREE_CLEAN = PASS
CI = PASS
MAIN_BRANCH_PROTECTION = PASS

FRONTEND_COPY_FROZEN = PASS
FRONTEND_VISUAL_FROZEN = PASS
RUNTIME_FEATURE_FREEZE = PASS

FORMAT = PASS
LINT = PASS
TYPECHECK = PASS
TESTS = PASS
BUILD = PASS
ACCESSIBILITY = PASS
CLIENT_SECRET_SCAN = PASS

SUPABASE_MIGRATION_PARITY = PASS
SUPABASE_DB_LINT = PASS
RLS = PASS
AUTH = PASS
ADMIN = PASS
EDITORIAL_LIFECYCLE = PASS
WATCHLIST = PASS
MATCHES = PASS
TRACKER = PASS

CRAWLER = PASS
SOURCE_HEALTH = PASS
IDEMPOTENCY = PASS
CANDIDATE_TRUTH_AUDIT = PASS
PRECISION = PASS
KNOWN_POSITIVE_RECALL = PASS
DEADLINE_ACCURACY = PASS
FRESHNESS = PASS

OBSERVABILITY = PASS
RECOVERY = PASS
SECURITY = PASS
PERFORMANCE = PASS
SEO_STAGING = PASS

EXPECTED_SCHEDULE_SLOTS = 1
OBSERVED_GHA_SOAK_RUNS = 1
VALID_GHA_SOAK_RUNS = 1
FAILED_GHA_SOAK_RUNS = 0
MISSING_SCHEDULE_SLOTS = 0
MANUAL_POST_BASELINE_RUNS_EXCLUDED = 0

SOAK_48H = PENDING_TIME_SOAK
SOAK_72H = PENDING_TIME_SOAK

CUSTOM_DOMAIN = DEFERRED_HUMAN
CUSTOM_SMTP = DEFERRED_HUMAN
PUBLIC_SUPPORT_EMAIL = DEFERRED_HUMAN
GRIEVANCE_OFFICER = DEFERRED_HUMAN

BILLING = DISABLED_BY_POLICY
AUTO_VERIFY_CLAIMABLES = DISABLED_BY_POLICY
CUSTOMER_NOTIFICATIONS = DISABLED_BY_POLICY

SAFE_FOR_CLOSED_STAGING = PASS
SAFE_FOR_LIMITED_PUBLIC_BETA = DEFERRED_HUMAN
SAFE_FOR_UNRESTRICTED_PRODUCTION = DEFERRED_HUMAN
```

---

## 2. Ingestion, Candidate Truth & Deduplication Evidence

- **Active Production Sources**:
  1. `sebi-rss` (Securities and Exchange Board of India — RSS Feed)
  2. `sebi-public-notices` (Securities and Exchange Board of India — Public Notices & Orders)
  3. `rbi-rss` (Reserve Bank of India — Press Releases RSS)
  4. `rbi-notifications-rss` (Reserve Bank of India — Notifications RSS)
  5. `ibbi-public-announcements` (Insolvency and Bankruptcy Board of India — Corporate Insolvency Announcements)
  6. `pib-rss` (Press Information Bureau — English Releases RSS)
  7. `trai-press-releases` (Telecom Regulatory Authority of India — Tariff Directives RSS)

- **Audited Truth & Precision**:
  - Audited Candidates in Staging DB: 22
  - True Actionable Candidates: 22 (4 SEBI Investor Refunds + 18 IBBI Creditor Claim Invitations)
  - Non-Actionable Form G EOIs Mislabeled: 0
  - RBI Monetary Penalties Mislabeled: 0
  - SEBI Generic Enforcement Orders Mislabeled: 0
  - Audited Precision: **100.0%**
  - Known-Positive Recall: **100.0%**

---

## 3. Security, RLS & Client Bundle Audit

- **Client Bundle Secrets**: 0 exposed backend credentials across all 99 client static chunks.
- **Remote RLS Coverage**: 21/21 checks passing on remote Supabase staging database.
- **Search Path Safety**: Function `search_path` set to `public` on all security-definer helpers.
- **Main Branch Protection**: Force-push disabled, branch deletion disabled, required CI status check enabled.

---

## 4. Remaining Human-Only Pre-Launch Tasks

1. **Domain Purchase & DNS Configuration**:
   - Register the production domain (e.g. `claimradar.in`).
   - Configure DNS records (Vercel CNAME/A records, SPF, DKIM, DMARC).
2. **Transactional SMTP Provider Setup**:
   - Create account with trusted provider (Resend / AWS SES / Postmark / Sendgrid).
   - Configure custom SMTP credentials in Supabase Auth settings.
3. **Public Support & Contact Inboxes**:
   - Provision `support@claimradar.in` and `corrections@claimradar.in`.
   - Set `NEXT_PUBLIC_SUPPORT_EMAIL` and `NEXT_PUBLIC_CORRECTIONS_EMAIL` environment variables.
4. **Grievance Officer Designation**:
   - Appoint and publish the designated Grievance Officer name, address, and email for IT Rules compliance prior to unrestricted production launch.

```

```
