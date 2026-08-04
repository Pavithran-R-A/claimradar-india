# Testing

## Stack

- **Unit / Integration**: Vitest + React Testing Library
- **E2E**: Playwright (Chromium + Firefox baseline)
- Run all suites with `pnpm test` from the repo root.

## Coverage Targets

| Area                   | Minimum      |
| ---------------------- | ------------ |
| Crawler parsers        | 90 % line    |
| Claim schema / scoring | 95 % branch  |
| Publication rules      | 100 % branch |
| Web API routes         | 80 % line    |
| Payment flows          | 90 % line    |
| SEO helpers            | 85 % line    |
| Security utilities     | 90 % branch  |

## Rules

- **Never disable, skip or comment-out a failing test.** Fix or revert.
- **Never claim a phase complete while any suite is red.**
- Tests live next to the code they exercise (`*.test.ts` / `*.spec.ts`).
- E2E specs live in `apps/web/e2e/`.
- Use `packages/test-utils` for factories, mocks and database seeds — no ad-hoc duplication.

## What to Test

- **Crawler**: every parser with fixture HTML; error paths for malformed input.
- **AI extraction**: deterministic fixtures + snapshot tests for prompt outputs.
- **Publication rules**: state-machine transitions, edge cases (missing fields, contradictory statuses).
- **Web**: route handlers, middleware, auth guards, RLS-adjacent logic.
- **Payments**: subscription lifecycle, webhook verification, idempotency.
- **SEO**: metadata generation, JSON-LD correctness, sitemap completeness.
- **Security**: CSP header presence, SSRF block-list, input validation failures.

## CI

- GitHub Actions runs lint → typecheck → unit → e2e on every PR.
- PR merges blocked until all required checks are green.
