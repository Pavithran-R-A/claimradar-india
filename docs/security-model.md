# Security Model

## Roles

| Role             | Scope                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `user`           | Own watchlist, alert preferences, profile. Public read access.                                            |
| `researcher`     | All `user` permissions + read/write on `claims`, `source_traces`, `raw_documents`.                        |
| `editor`         | All `researcher` permissions + publish/unpublish claims, manage `publication_queue`, write `corrections`. |
| `legal_reviewer` | All `editor` permissions + sign-off on `verified_claimable` claims.                                       |
| `admin`          | Full access including `audit_logs`, subscriptions, and schema operations. MFA required.                   |

## RLS Policies

- **`profiles`, `watchlists`, `alert_preferences`**: `SELECT/INSERT/UPDATE/DELETE WHERE auth.uid() = user_id`.
- **`claims` (public read)**: `SELECT WHERE status IN ('official_update', 'potential_claimable', 'refund_ordered', ...)` for anonymous. Authenticated users get the same plus their own watchlist annotations.
- **`claims` (write)**: `researcher` and above via `user_roles` check.
- **`editorial_reviews`**: write only for `editor` / `legal_reviewer` / `admin`.
- **`audit_logs`**: append-only for `admin`; read for staff; no anonymous access.
- **`ingestion_*` tables**: service-role only (crawler); no RLS — bypassed by service-role key which never reaches the client.

## Content Security Policy

- `default-src 'self'`; `script-src 'self' 'nonce-<random>'`; `style-src 'self' 'unsafe-inline'` (Tailwind requirement).
- `img-src 'self' data: https:`; `font-src 'self'`.
- `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`.
- Strict `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.

## SSRF Prevention

- URL allow-list in `packages/source-registry`; only official domains permitted.
- DNS resolver blocks private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, `127.x`).
- Redirect chain limited to 2 hops; final URL re-validated against allow-list.
- No user-supplied URLs processed without validation.

## Audit Logging

Every privileged operation writes to `audit_logs`:

- Role changes, claim publish/unpublish, status transitions for `verified_claimable`.
- Schema migrations, environment variable changes, webhook configuration changes.
- Log entries are immutable; deletion requires `admin` + second reviewer sign-off.

## Key Management

- Service-role keys rotated quarterly; rotation logged in `audit_logs`.
- Webhook signing keys per integration; inbound webhooks signature-verified before processing.
- No secrets in source control; `.env.example` committed with keys only.
