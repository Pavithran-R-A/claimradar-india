# ClaimRadar India Completion Ledger

Updated: 2026-09-06

## Current baseline

- Branch: `main`.
- Runtime freeze: `f7a77ee0349078a0dfbe8649d77683feb89e6470`.
- Main after merge: `f7a77ee0349078a0dfbe8649d77683feb89e6470`.
- Source head: `4a2fa8230b1418e8a109de3d543bbc2562ff158f`.
- Main pre-merge: `fc14de90783587013e692a70281ea88b8c3920f5`.
- Original dirty checkout: preserved and untouched.
- Main: not modified.
- PR: `#2`, merged with merge commit.
- Node: `v24.19.0`.

## Current gate ledger

| Gate                  | Status                 | Evidence or blocker                                                |
| --------------------- | ---------------------- | ------------------------------------------------------------------ |
| Code quality          | `PASS`                 | Format, lint, typecheck, tests, inventory, and build pass locally. |
| CI                    | `PASS`                 | Exact-head run `33968827983` passed.                               |
| Preview deployment    | `PASS`                 | Exact-head deployment reports `READY`.                             |
| Public browser QA     | `PASS_WITH_LIMITATION` | Share-authorized Preview routes and search passed.                 |
| Supabase/database     | `PASS_WITH_LIMITATION` | Read-only connector checks passed; local Docker stack unavailable. |
| Authentication        | `PASS`                 | Auth Admin API created three confirmed disposable users.           |
| Customer workspace    | `PASS`                 | User-scoped onboarding data and isolation passed.                  |
| Admin workspace       | `PASS`                 | Admin sources/crawl surfaces passed; normal users blocked.         |
| API runtime           | `PASS`                 | Credentialed Auth and PostgREST checks passed.                     |
| Crawler adapters      | `PASS`                 | Correct-target run `33840659144` passed all invariants.            |
| Security              | `PASS_WITH_LIMITATION` | CSP is active; static rendering retains `unsafe-inline` scripts.   |
| Accessibility         | `PASS_WITH_LIMITATION` | Preview keyboard and route checks passed; full WCAG audit pending. |
| Notifications         | `PASS`                 | User scope, read state, dedup, and private ledger passed.          |
| Performance           | `PASS_WITH_LIMITATION` | Build and runtime smoke passed; load profile remains pending.      |
| Release integrity     | `PASS`                 | Migration contract, secret scan, and CI release checks pass.       |
| Pre-soak              | `PASS`                 | Run `33840659144`; DB corroborated crawl `b24296a6-...`.           |
| Final soak            | `PENDING_TIME`         | Scheduled clock starts at first genuine cron execution.            |
| Production deployment | `NO-GO`                | Main merged; production deployment remains untouched.              |

## Fresh local evidence

- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 67 files, 539 tests passed.
- `pnpm test:inventory-acceptance`: 47 files, 338 tests passed.
- Remote CI run `33968827983`: exact head passed.
- `pnpm verify:migrations`: 17 ordered migrations passed.
- Client bundle secret audit: zero backend-secret matches.
- `pnpm build`: passed, 44 static pages generated.
- `pnpm test:browser-smoke`: 10 routes, two viewports passed.
- `pnpm preflight:staging`: four policy guards passed; seven credential checks skipped.
- Preview routes: home, directory, sources, methodology, login, register passed.
- Preview search: `PACL` filter produced the expected query state.
- Admin boundary: `/admin` redirected to `/login?next=%2Fadmin`.
- Staging registry: seven enabled source rows verified read-only.
- Staging pre-soak: 7 sources, 126 found, 123 stored, 21 candidates.
- Staging crawl errors: zero; claimables and notifications remain zero.
- Staging security advisor: zero lints.
- Staging performance advisor: expected INFO/WARN findings only.
- Staging soak run `33836845034`: passed against another project; rejected.
- Staging guard run `33837926250`: failed closed on URL mismatch.
- Auth runtime run `33968830120`: all credentialed stages passed.
- Auth cleanup: three users deleted; zero residual rows verified.
- Onboarding completion now uses trusted server-side profile update.
- Merge commit `f7a77ee0349078a0dfbe8649d77683feb89e6470` recorded.
- Baseline GHA run `34038342122` passed from frozen main.
- Baseline crawl `afc0ddfd-e65c-4b03-aaa8-be8537a5fc94` passed.
- Baseline DB corroboration: 7 run sources, 126 found, zero errors.
- Baseline DB source documents: 204 total across 7 sources.
- Baseline publication events: zero in crawl window.
- Runtime freeze is unchanged by these docs.

## Release decision

`NO-GO` for autonomous production release.

Production remains untouched. Runtime gates now pass.
Final readiness remains pending genuine soak time.
