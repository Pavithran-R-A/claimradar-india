# ClaimKhoj custom domain + transactional email activation

> Configuration checkpoint — not approval to send customer emails. All
> application flags for external sends, billing and auto-publication remain off.

## Domain and DNS
- Canonical domain: `https://claimkhoj.app`; Vercel domains are already verified.
- Resend sending domain `claimkhoj.app` verified (DKIM, SPF, custom return-path).
- Keep `www.claimkhoj.app` redirecting to the apex.
- Set Vercel `NEXT_PUBLIC_SITE_URL=https://claimkhoj.app` for the **production**
  target. Preview should retain staging configuration until auth redirects allow it.
- Preserve staging URLs on the Supabase allowlist while users migrate.

## Supabase Auth (hosted dashboard action still required)

Auth → URL Configuration:
- Site URL: `https://claimkhoj.app`
- Exact allowed callback: `https://claimkhoj.app/auth/callback`
- The application also uses `next=/onboarding` and `next=/reset-password` query parameters.
- Keep `https://claimradar-staging.vercel.app/auth/callback` temporarily for existing confirmations and recovery emails.
- Do not allow wildcards for unrelated external hosts.

Auth → SMTP Settings:
- Enable custom SMTP.
- SMTP Host: `smtp.resend.com`; Port: `465` (SSL/TLS).
- Username: `resend`; Password: domain-limited Resend sending-only API key
  **entered directly in Supabase**, never committed or pasted into chat.
- Sender name: `ClaimKhoj`; Sender address: `noreply@claimkhoj.app`.
- Maintain email verification required, secure email change enabled.
- Resend auto-tracking is disabled for authentication link safety.
- Auth → Email Templates: paste the checked-in HTML templates from
  `supabase/email-templates`; subject: "ClaimKhoj — confirm your email",
  "ClaimKhoj — reset your password", etc.
- Test actual signup, confirmation, sign-in, password reset and email change,
  including expiry and already-used links, before approving launch.

## Claim notifications
- Resend templates: `claimkhoj_verified_opportunity`,
  `claimkhoj_deadline_reminder`, `claimkhoj_weekly_digest`.
- The application supports dispatching published new matches after an
  authenticated user refreshes matching. This is not yet an automatic schedule.
- Required production-only secrets: `RESEND_API_KEY` (sending-only key scoped
  to ClaimKhoj), `UNSUBSCRIBE_SECRET` (random unshared HMAC secret).
- Required variables: `EMAIL_PROVIDER=resend`,
  `EMAIL_FROM=ClaimKhoj <alerts@claimkhoj.app>`,
  `APP_ENV=production`, `NOTIFY_CUSTOMERS_ENABLED=true`.
- **Do not enable these flags yet.** First complete authenticated acceptance,
  ensure at least one vetted published record, delivery ledger correctness,
  unsubscribe/quiet-hours/dedup integration and Resend delivery-webhook tests.
- Billing and automatic publication remain disabled.

## Security & product readiness
- Supabase Security Advisor warnings: authenticated SECURITY DEFINER onboarding
  function and leaked-password protection. Review compensating controls,
  permissions and plan limits, do not silently dismiss the findings.
- The public directory must show all published claimables irrespective of
  onboarding preferences; personalization may change ordering only.
- Never publish a draft or AI-extracted candidate without official source
  evidence, legal review and editorial approval.
- Additional verified manual browser tests are required for authenticated
  dashboard flows at mobile, tablet, 1366×768, 1536×864, 1920×1080.
- Confirm source crawler recent runs and operational AI cost caps.
