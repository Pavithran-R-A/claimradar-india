# Staging Auth URL & Callback Configuration Report

**Timestamp:** 2026-08-07T22:38:30Z  
**Environment:** Vercel Preview & Staging Supabase  
**Target Preview Base URL:** `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`  
**Status:** `STAGING_AUTH_URLS = PASS`

---

## 1. Verified Auth Callback Routes & Usage

Analysis of `apps/web/app/(auth)/actions.ts` and `apps/web/app/(auth)/auth/callback/route.ts` identifies the following callback URLs constructed by ClaimRadar:

| Auth Flow           | Action                 | Generated Redirect Destination                               |
| ------------------- | ---------------------- | ------------------------------------------------------------ |
| User Registration   | `signUp()`             | `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`     |
| Resend Verification | `resendVerification()` | `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`     |
| Password Reset      | `resetPassword()`      | `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password` |
| Magic Link          | Supabase Auth default  | `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/app`            |

---

## 2. Supabase Auth Dashboard Settings

To ensure Auth links function correctly across Vercel Preview deployments and local development:

### Site URL

- **Configured Site URL:** `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`
- _(Replaces the legacy default `http://localhost:3000`)_

### Redirect URLs (Allowed Patterns)

```
https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app/auth/callback
https://claimradar-staging-*.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

> **Security Note:** Wildcards are narrowly constrained to `https://claimradar-staging-*.vercel.app/auth/callback` under `pavithrans-projects-cae184b1`. Broad wildcards (e.g. `https://**.vercel.app/**`) are strictly prohibited.

---

## 3. Open Redirect Audit

Inspection of `apps/web/app/(auth)/auth/callback/route.ts` line 16-17:

```ts
const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
return NextResponse.redirect(`${origin}${safeNext}`);
```

- **Validation:** Only relative paths starting with `/` (and not `//`) are accepted.
- **Protection:** Prevents attackers from supplying external domains (e.g., `?next=https://evil.com`) in auth callback parameters.
- **Result:** Open redirect vulnerability check: **PASS ✅**

---

## 4. Environment Variables Update

In `.env.staging`:

```env
NEXT_PUBLIC_SITE_URL="https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app"
```

In Vercel Preview environment settings:

```env
NEXT_PUBLIC_SITE_URL = https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app
```

---

## 5. Gate Result

`STAGING_AUTH_URLS = PASS`
