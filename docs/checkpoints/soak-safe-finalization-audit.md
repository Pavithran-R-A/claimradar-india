# Soak-Safe Finalization Audit

Audit date: 2026-09-08

## Decision

The frozen runtime remains unchanged. The final scheduled soak remains active.
Production release is not approved yet.

The exact runtime freeze is:

`6f22c5ef4119000318218f136f5416987a451877`

The documentation branch contains readiness evidence only. Runtime repair is
required before accessibility can pass. That repair must deliberately restart
qualification after this soak.

## Readiness matrix

| Gate                   | Result                                          | Evidence or remaining action                                                                                     |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| PUBLIC_BROWSER_QA      | `PASS_WITH_LIMITATION`                          | Public route and responsive audits passed. Protected auth/customer/admin browser access remains wrapper-limited. |
| ACCESSIBILITY          | `MATERIAL_RUNTIME_FIX_REQUIRED`                 | Contrast, heading order, logo name, and mobile target defects found.                                             |
| PERFORMANCE            | `PASS_WITH_LIMITATION`                          | LCP 1,060 ms, TTFB 64 ms, CLS 0.00. INP and field data were unavailable.                                         |
| SUPABASE_DATABASE      | `PASS_WITH_LIMITATION`                          | 47/47 public tables have RLS. Free-plan recovery limits remain.                                                  |
| SUPABASE_SECURITY      | `PASS_WITH_LIMITATION`                          | Security Advisor has zero lints. Default grants need production hardening review.                                |
| SUPABASE_PERFORMANCE   | `PASS_WITH_ACCEPTED_CAPACITY_LIMIT`             | 62 unused-index INFO findings and 35 expected policy WARN findings.                                              |
| AUTH_SMTP_READINESS    | `EXTERNAL_CONFIGURATION_REQUIRED`               | Configure production SMTP and domain authentication after soak.                                                  |
| CSP_SECURITY           | `ACCEPTED_TRADEOFF_REQUIRES_SECURITY_OWNER_ACK` | Static CSP retains `unsafe-inline`. Nonce/hash work is runtime-sensitive.                                        |
| VERCEL_READINESS       | `PASS_WITH_LIMITATION`                          | Staging deployment is READY. Hobby-plan production controls require owner review.                                |
| BACKUP_RECOVERY        | `EXTERNAL_CONFIGURATION_REQUIRED`               | Free Supabase has no automatic backups or PITR. Establish exports or upgrade.                                    |
| OBSERVABILITY          | `PASS_WITH_LIMITATION`                          | Workflow and application logs exist. External alerting and drain ownership remain.                               |
| INCIDENT_RESPONSE      | `PASS`                                          | Runbooks cover source, platform, auth, database, security, and publication incidents.                            |
| ROLLBACK_READINESS     | `PASS_WITH_LIMITATION`                          | Exact READY deployment and historical freeze deployment are identified. Execute owner-controlled rollback.       |
| PRODUCTION_RUNBOOK     | `PASS`                                          | Deployment, environment, smoke, and first-hour procedures are documented.                                        |
| POST_DEPLOY_SMOKE_PLAN | `PASS`                                          | Smoke sequence and stop conditions are documented.                                                               |

`MATERIAL_RUNTIME_DEFECTS_FOUND = YES`

`SOAK_INVALIDATED = NO`

`RUNTIME_FREEZE_HEAD = 6f22c5ef4119000318218f136f5416987a451877`

`RUNTIME_SENSITIVE_DIFF = EMPTY_AFTER_FREEZE`

## Browser and accessibility evidence

The exact READY staging deployment was audited through the protected share.
Routes covered were `/`, `/claimables`, `/closing-soon`, `/companies`,
`/sectors`, `/how-it-works`, `/methodology`, `/sources`, `/login`,
`/register`, `/app`, and `/admin`.

Responsive overflow checks covered 1536, 1440, 1280, 1024, 768, 430, 390,
and 360 CSS pixels. No horizontal overflow candidates were found.

The public and authentication route checks found no unlabeled controls.
`/app` and `/admin` correctly redirected unauthenticated users. `/dossier`
is intentionally not a standalone route; dossier links use claimable slugs.

The full audit found these material defects:

- Muted text contrast measured 4.17:1 and 4.28:1.
- Footer disclosure contrast measured 1.45:1 and 1.77:1.
- A content heading uses H4 directly after H2.
- The logo accessible name omits visible text.
- Two mobile source chips measured below 24 by 24 pixels.

These defects require frontend changes. No such changes are made here.

The protected Vercel wrapper also emitted third-party Google One Tap/FedCM
warnings. Those warnings are provider noise, not an application failure.

## Performance evidence

The exact protected deployment trace used one reload, one-times CPU, and an
unthrottled network. Results were:

- LCP: 1,060 ms.
- LCP TTFB: 64 ms.
- LCP render delay: 996 ms.
- CLS: 0.00.
- CrUX field data: unavailable.
- INP: unavailable from the trace.
- Legacy JavaScript estimate: 14.4 kB.

A safe wrapper-level probe sent 24 read-only GET requests at concurrency 3.
All requests completed without errors. The wrapper returned 307 responses.
Latency was p50 73 ms, p95 230 ms, p99 280 ms, maximum 280 ms. This is not
application 200-response proof because deployment protection intervened.

No runtime optimization is authorized during this soak.

## Supabase evidence

Target: `claimradar-staging`, ref `upvsfqufkywlpibbwrse`, region
`ap-northeast-1`, status `ACTIVE_HEALTHY`, Postgres `17.6.1.155`.

The live migration inventory contains 17 ordered migrations. All 47 public
tables have RLS enabled. Policy samples enforce owner or staff/admin access.
Role escalation is guarded by `prevent_role_escalation`; onboarding defaults
profiles to role `user`.

Security Advisor returned zero lints. Performance Advisor returned 62 unused
index INFO findings and 35 multiple-permissive-policy WARN findings. The
unused indexes are low-traffic staging evidence. The policy warnings reflect
separate ownership, staff, and admin policies. Both are accepted with reason,
not silently reclassified as passes.

Default `anon` and `authenticated` privilege rows remain visible in the
information schema. RLS is effective in tested policy paths. Production must
review whether those default grants are narrower than necessary.

## External readiness

Supabase organization and project are Free tier. Default SMTP is unsuitable
for launch volume. Production requires custom SMTP, a sending domain, and
DKIM, DMARC, and SPF verification. Email confirmation and password recovery
must be tested after configuration.

Free-tier backup and PITR coverage does not meet a production recovery claim.
Choose an approved paid plan or establish verified scheduled logical exports.
Do not describe either as complete until evidence exists.

Vercel project `claimradar-staging` is on Hobby. The latest exact branch
deployment is READY and is rollback-candidate metadata. Production still
needs approved domain, DNS, deployment-protection, WAF, alerting, logging,
and spend-control decisions.

The source CSP uses `default-src 'self'`, `frame-ancestors 'none'`,
`object-src 'none'`, restricted connections, and standard security headers.
It retains `unsafe-inline` for static rendering. This reduces XSS defense and
requires security-owner acceptance. The protected wrapper has a broader CSP;
that wrapper is not app-header proof.

## Soak accounting

Only schedule-triggered runs count. Manual `workflow_dispatch` runs remain
baseline-only. The baseline is GHA `34138764303`, crawl
`0fe7626a-3332-403d-b3d4-d66db3ddefb9`.

The first qualifying slot is `2026-09-07T18:17:00Z`. Recorded qualifying runs
are `34163605422`, `34188114057`, `34220598983`, and `34252651891`. Each
passed seven-source, zero-error, zero-publication invariants. Run
`34252651891` was delayed until 16:42 UTC and belongs to the 12:17 UTC slot.
It used main SHA `32fb580e86c9d490cb0428f291c667f7d5538061`, which differs from
the freeze only through documentation commits. The earlier failed run
`34123292686` and prior runs `34058094014`, `34084538536` remain excluded.

No documentation-only commit changes runtime qualification. A frontend,
dependency, migration, workflow, or material configuration repair requires a
new freeze, new baseline, and new soak clock.

## Human actions after soak

1. Approve and implement the accessibility repair.
2. Upgrade or export Supabase backups with evidence.
3. Configure production SMTP and DNS authentication.
4. Approve CSP risk or nonce/hash architecture.
5. Configure Vercel production controls and alerts.
6. Run the release package and smoke plan.
