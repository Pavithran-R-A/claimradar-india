# Staging SMTP Configuration — Provider Evaluation & Recommendation

**Timestamp:** 2026-08-07  
**Status:** `STAGING_SMTP = PROVIDER_SELECTED — AWAITING_USER_ACCOUNT_CREATION`

---

## 1. Why SMTP Is Required for Beta

ClaimRadar India's Supabase Auth requires a custom SMTP provider to send:

| Email Type                | Trigger                        |
| ------------------------- | ------------------------------ |
| Signup confirmation       | User registers at `/register`  |
| Magic link / OTP          | Passwordless login             |
| Password reset            | Forgot password flow           |
| Email change confirmation | User changes email in settings |

**Supabase's built-in SMTP** (the default dev relay) has a hard rate limit of ~2–3 emails/hour and is not suitable for any user-facing beta. It will silently drop emails for real users.

---

## 2. Provider Evaluation Matrix

| Criterion                       | Resend                 | Postmark                | AWS SES                              | Brevo                | ZeptoMail                    |
| ------------------------------- | ---------------------- | ----------------------- | ------------------------------------ | -------------------- | ---------------------------- |
| **Free / Test Tier**            | 3,000/mo (free tier)   | 100 emails (trial only) | ~62k/mo on free tier (with AWS acct) | 300/day free forever | Credits-based (~6k free)     |
| **Paid pricing**                | $20/mo → 50k emails    | $15/mo → 10k emails     | $0.10/1000 emails                    | $25/mo → 20k         | ~$5/mo → 50k credits         |
| **India availability**          | ✅ Global              | ✅ Global               | ✅ (Mumbai region)                   | ✅                   | ✅ (Zoho India data centres) |
| **Transactional-only**          | ✅                     | ✅ (strict streams)     | ✅                                   | ❌ (also marketing)  | ✅ (designed for it)         |
| **DKIM/SPF/DMARC**              | ✅                     | ✅                      | ✅                                   | ✅                   | ✅                           |
| **Supabase native integration** | ✅ (1-click)           | ❌ (manual SMTP)        | ❌ (manual SMTP)                     | ❌ (manual SMTP)     | ❌ (manual SMTP)             |
| **Developer experience**        | ⭐⭐⭐⭐⭐             | ⭐⭐⭐⭐                | ⭐⭐⭐                               | ⭐⭐⭐               | ⭐⭐⭐⭐                     |
| **Deliverability**              | ⭐⭐⭐⭐               | ⭐⭐⭐⭐⭐              | ⭐⭐⭐⭐⭐                           | ⭐⭐⭐               | ⭐⭐⭐⭐                     |
| **Account required**            | Yes                    | Yes                     | Yes (AWS account)                    | Yes                  | Yes                          |
| **Domain ownership required**   | Yes (DNS verification) | Yes                     | Yes                                  | Yes                  | Yes                          |

---

## 3. Recommendation for ClaimRadar Limited Beta

> [!IMPORTANT]
> **Recommended Provider: Resend**
>
> Reason: Resend offers the **fastest setup path with Supabase** (native 1-click integration via Supabase Dashboard), a generous **3,000 emails/month free tier** that comfortably covers a limited beta (< 500 users), excellent developer experience, and full DKIM/SPF/DMARC support. For a limited beta of ClaimRadar India, Resend is the optimal cost-risk-effort choice.

### Alternative if domain is already on Zoho

If `claimradar.in` is already managed by Zoho Workspace, use **ZeptoMail** — it avoids additional vendor DNS configuration and is extremely cost-effective for transactional-only use.

---

## 4. Resend Setup Steps (User Action Required)

> [!CAUTION]
> The following steps require **user action** — account creation and domain DNS access are required.
> Do NOT provide API keys to this agent. Configure them directly in Supabase Dashboard → Auth → SMTP settings.

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com) → Sign up (free tier, no credit card required)
2. Verify your email address

### Step 2: Add and Verify Domain

1. In Resend Dashboard → **Domains** → **Add Domain**
2. Enter `claimradar.in` (or your verified domain)
3. Add the provided **SPF**, **DKIM**, and **DMARC** DNS records to your domain registrar
4. Click **Verify Domain** — wait for DNS propagation (usually 5–30 minutes)

### Step 3: Create API Key

1. In Resend Dashboard → **API Keys** → **Create API Key**
2. Name: `claimradar-staging`
3. Permission: **Sending access only**
4. Save the key — it will not be shown again

### Step 4: Configure Supabase Auth SMTP

1. Go to Supabase Dashboard → **`upvsfqufkywlpibbwrse`** project
2. Navigate to **Auth** → **Email Templates** (verify templates look correct)
3. Navigate to **Auth** → **SMTP Settings** (or **Auth** → **Providers** → **Email**)
4. Toggle **Enable Custom SMTP**
5. Fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend`
   - **Password:** `<your Resend API key>` (this is your SMTP password for Resend)
   - **Sender Email:** `auth@claimradar.in` (must match verified domain)
   - **Sender Name:** `ClaimRadar India`
6. Click **Save**

### Step 5: Update Auth URL settings

1. In Supabase → Auth → **URL Configuration**:
   - **Site URL:** `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`
   - **Additional Redirect URLs:** Add the staging Preview URL pattern

---

## 5. Security Requirements

| Requirement                                | Status                                          |
| ------------------------------------------ | ----------------------------------------------- |
| SMTP password/API key NOT committed to git | ✅ Configured only in Supabase Dashboard        |
| SMTP password NOT in Vercel env            | ✅ Auth email sent by Supabase, not the web app |
| Sender domain verified (DKIM/SPF/DMARC)    | Required before going live                      |
| No government domain impersonation         | ✅ Using `claimradar.in` only                   |
| Sender name                                | `ClaimRadar India` (no government wording)      |

---

## 6. Email Templates to Verify Before Beta

After configuring SMTP, verify these templates in Supabase Auth → Email Templates:

| Template       | Subject                           | Key Content                       |
| -------------- | --------------------------------- | --------------------------------- |
| Confirm signup | "Confirm your ClaimRadar account" | Confirmation link + expiry notice |
| Magic link     | "Your ClaimRadar login link"      | One-time link + expiry            |
| Reset password | "Reset your ClaimRadar password"  | Password reset link + expiry      |
| Change email   | "Confirm your new email address"  | Confirmation link                 |

Ensure callback URLs reference the **staging Preview URL**, not `localhost` or production.

---

## 7. Current Status

| Item                        | Status                                              |
| --------------------------- | --------------------------------------------------- |
| Provider selected           | **Resend** (recommended)                            |
| Account creation            | ❗ USER ACTION REQUIRED                             |
| Domain DNS verification     | ❗ USER ACTION REQUIRED (after account)             |
| Supabase SMTP configuration | ❗ USER ACTION REQUIRED (after domain verification) |
| Auth email testing          | Pending SMTP configuration                          |
| `STAGING_SMTP` gate         | `NOT_READY — USER_ACTION_REQUIRED`                  |
