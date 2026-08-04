# Security

## Row Level Security

- Every user-owned table has an RLS policy.
- Anonymous access is denied by default; public read access is granted explicitly where needed.
- Service-role key bypasses RLS — it must never appear in client bundles.

## Authentication & Authorisation

- Supabase Auth (email + magic link; OAuth later).
- Roles: `user`, `researcher`, `editor`, `legal_reviewer`, `admin`.
- Admin accounts require MFA.
- JWT claims drive RLS; never trust client-supplied user IDs.

## Headers & CSP

- Strict `Content-Security-Policy` — inline scripts disallowed, nonce-based where required.
- `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` disables camera, microphone, geolocation.

## SSRF Prevention

- Crawler URL allow-list enforced in `packages/source-registry`.
- Private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, `127.x`) blocked.
- Redirects limited to two hops; final URL re-validated against allow-list.

## Secrets Management

- All secrets in environment variables, never in source.
- `.env.example` committed (keys only, no values).
- Rotate service-role keys quarterly; log rotation in audit log.

## Webhooks & Integrations

- Every inbound webhook is signature-verified before processing.
- Outbound webhooks include HMAC signatures where the receiver supports it.

## Audit Logging

- Privileged operations (role change, claim publish/unpublish, schema migration) write an `audit_log` row.
- Logs are append-only; deletion requires `admin` role + second reviewer.

## Input Validation

- Zod schemas at every API boundary — request bodies, query params, webhook payloads, env vars.
- File uploads: MIME allow-list, size cap, virus scan before storage.
