# ClaimRadar India Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a verified ClaimRadar India release candidate across product, data, security, operations, and delivery surfaces.

**Architecture:** Start from clean `origin/main`, integrate only the frontend branch changes that survive deliberate review, then repair independent subsystems in small commits. Public pages use the existing Next.js App Router and design system; crawler, database, auth, and release code remain separately testable.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, PostgreSQL migrations, Vitest, Playwright, pnpm 11.20.0, Node 24.

**Spec:** `docs/superpowers/specs/2026-09-02-claimradar-completion-design.md`

## Global Constraints

- Work only in `codex/claimradar-completion`.
- Never modify `origin/main`.
- Preserve unrelated edits in the original checkout.
- Do not change crawler/runtime code without recording soak invalidation.
- Keep release evidence fail-closed.
- Do not fabricate claim facts, deadlines, eligibility, or amounts.
- Do not expose secrets or private user data.
- Use existing dependencies unless a concrete verified need exists.
- Run focused tests after each repair slice.

---

### Task 1: Establish baseline and completion ledger

**Files:**
- Create: `docs/checkpoints/completion-ledger.md`
- Modify: `docs/superpowers/specs/2026-09-02-claimradar-completion-design.md`

**Interfaces:**
- Consumes: integrated branch tree, package scripts, routes, migrations, workflows, tests.
- Produces: evidence-backed subsystem status ledger and baseline hashes.

- [ ] **Step 1: Record every subsystem and status.**
  Include routes, server handlers, adapters, tables, migrations, auth boundaries,
  gates, workflows, tests, deployment configuration, and known external blockers.
- [ ] **Step 2: Check the ledger against repository paths.**
  Use `rg --files`, route exports, migration DDL, workflow files, and package scripts.
- [ ] **Step 3: Commit the baseline ledger.**
  Run `git diff --name-only`, then commit only ledger and approved design documents.

### Task 2: Preserve strict release evidence

**Files:**
- Modify: `apps/web/tests/soak-readiness-accounting.test.ts`
- Test: `apps/web/tests/soak-readiness-accounting.test.ts`

**Interfaces:**
- Consumes: `scripts/summarize-soak-readiness.mjs` provenance functions.
- Produces: strict assertions for valid Git provenance and fail-closed qualification.

- [ ] **Step 1: Keep the regression test strict.**
  Require full SHA values and retain tests proving `UNKNOWN` cannot qualify.
- [ ] **Step 2: Run the focused soak test.**
  Run `pnpm vitest run apps/web/tests/soak-readiness-accounting.test.ts`.
- [ ] **Step 3: Commit the reviewed decision.**
  Use `test(release): preserve strict provenance qualification`.

### Task 3: Repair public product UX

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`
- Modify: `apps/web/app/(public)/claimables/page.tsx`
- Modify: `apps/web/app/(public)/claimables/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/closing-soon/page.tsx`
- Modify: `apps/web/components/landing/*`
- Modify: `apps/web/components/directory/*`
- Modify: `apps/web/components/layout/*`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/tests/visual-composition-integrity.test.ts`
- Test: `apps/web/tests/evidence-radar-accessibility.test.ts`

**Interfaces:**
- Consumes: claim repository outputs, design-system tokens, source provenance fields.
- Produces: clear discover, understand, verify, and official-action flows.

- [ ] **Step 1: Add failing contract tests for provenance hierarchy.**
  Assert visible authority, source, date, deadline, status, and official-action
  affordances without requiring repeated trust labels.
- [ ] **Step 2: Refine the homepage and directory.**
  Make search dominant, reduce technical copy, preserve truthful empty states,
  and make result rows communicate what, who, source, deadline, and next action.
- [ ] **Step 3: Refine the dossier.**
  Put what, who, status, authority, deadline, source, and official action first.
  Keep provenance and history readable without nested card clutter.
- [ ] **Step 4: Verify responsive interaction states.**
  Exercise search, filters, drawers, pagination, source links, and reduced motion.
- [ ] **Step 5: Run focused tests and commit.**
  Use `feat(web): complete public claim discovery experience`.

### Task 4: Complete customer and admin workflows

**Files:**
- Modify: `apps/web/app/app/**`
- Modify: `apps/web/app/admin/**`
- Modify: `apps/web/components/app/**`
- Modify: `packages/design-system/src/index.tsx`
- Test: `apps/web/tests/unit/*`

**Interfaces:**
- Consumes: auth session, user-data repository, admin guards, database types.
- Produces: coherent customer tracking and operational review workflows.

- [ ] **Step 1: Add failing tests for empty, loading, error, and success states.**
  Cover matches, watchlist, tracker, alerts, notifications, profile, and admin actions.
- [ ] **Step 2: Repair customer navigation and state copy.**
  Make every empty state explain why it is empty and what action follows.
- [ ] **Step 3: Repair admin density and action safety.**
  Keep tables scanable, add explicit destructive confirmations, and preserve audit context.
- [ ] **Step 4: Run focused app tests.**
  Use `pnpm test -- apps/web/tests/unit` and the relevant web tests.
- [ ] **Step 5: Commit the completed workflow slice.**
  Use `feat(web): complete customer and operations workflows`.

### Task 5: Harden API, auth, authorization, and security

**Files:**
- Modify: `apps/web/app/(auth)/**`
- Modify: `apps/web/app/app/actions.ts`
- Modify: `apps/web/app/admin/actions.ts`
- Modify: `apps/web/lib/auth.ts`
- Modify: `apps/web/lib/app-auth.ts`
- Modify: `apps/web/lib/admin-db.ts`
- Modify: `apps/web/lib/schemas.ts`
- Modify: `apps/web/middleware.ts`
- Test: `apps/web/tests/unit/auth-guards.test.ts`
- Test: `apps/web/tests/unit/privileged-clients-fail-closed.test.ts`

**Interfaces:**
- Consumes: Supabase SSR clients, zod schemas, role helpers, server actions.
- Produces: validated inputs, ownership isolation, safe errors, and secret-safe clients.

- [ ] **Step 1: Add failing regressions for each material boundary.**
  Cover invalid inputs, unauthorized users, cross-user IDs, open redirects, and
  privileged-client failure behavior.
- [ ] **Step 2: Implement minimal boundary fixes.**
  Validate at entry, scope queries by authenticated user, and fail closed.
- [ ] **Step 3: Scan client bundles and logs.**
  Confirm service keys, tokens, passwords, and sensitive fields stay server-side.
- [ ] **Step 4: Run focused security tests.**
  Use `pnpm test -- apps/web/tests/unit/auth-guards.test.ts apps/web/tests/unit/privileged-clients-fail-closed.test.ts`.
- [ ] **Step 5: Commit the security slice.**
  Use `fix(security): harden application boundaries`.

### Task 6: Harden crawler, source reliability, and data quality

**Files:**
- Modify: `apps/crawler/src/adapters/**`
- Modify: `apps/crawler/src/pipeline/**`
- Modify: `apps/crawler/src/observability/**`
- Modify: `apps/crawler/src/validation/**`
- Modify: `packages/source-registry/src/index.ts`
- Test: `apps/crawler/tests/**`

**Interfaces:**
- Consumes: source definitions, fetch policy, claim schema, database storage interfaces.
- Produces: source-specific parsing, explicit failure classification, deduplication,
  provenance, and no silent truncation.

- [ ] **Step 1: Add realistic adapter fixtures and failure tests.**
  Cover pagination, malformed documents, HTTP errors, timeout, retry, and source-specific HTML.
- [ ] **Step 2: Repair adapter and pipeline defects.**
  Preserve complete evidence, propagate failures, respect rate limits, and retain source URLs.
- [ ] **Step 3: Verify publication and data invariants.**
  Unknown eligibility, amounts, and deadlines remain unknown without source support.
- [ ] **Step 4: Run crawler tests and safe source checks.**
  Use `pnpm --filter @claimradar/crawler test` and only non-destructive live checks.
- [ ] **Step 5: Record soak impact and commit.**
  If runtime behavior changed, record `CURRENT_SOAK_NO_LONGER_COVERS_FUTURE_COMPLETION_CANDIDATE = YES`.

### Task 7: Verify migrations, RLS, billing, and notifications

**Files:**
- Modify: `supabase/migrations/*` only for verified defects
- Modify: `apps/web/lib/notifications/**`
- Modify: `apps/web/lib/billing/**`
- Test: `apps/web/tests/unit/notifications-*.test.ts`
- Test: database migration tests

**Interfaces:**
- Consumes: ordered migrations 001-015, database package types, safety gates.
- Produces: upgrade-safe schema, ownership RLS, explicit staging behavior, idempotent notifications.

- [ ] **Step 1: Run offline migration and policy checks.**
  Verify order, indexes, constraints, foreign keys, RLS, and helper search paths.
- [ ] **Step 2: Add failing safety tests.**
  Assert staging cannot auto-publish, bill, or notify customers by default.
- [ ] **Step 3: Fix only verified schema or gate defects.**
  Avoid destructive migrations and record any required rollout strategy.
- [ ] **Step 4: Run migration and notification tests.**
  Use the repository’s local database verification scripts when available.
- [ ] **Step 5: Commit the data-safety slice.**
  Use `fix(data): harden migration and notification safety`.

### Task 8: Improve observability, CI, deployment, and documentation

**Files:**
- Modify: `.github/workflows/*`
- Modify: `scripts/*`
- Modify: `apps/web/robots.ts`
- Modify: `README.md`
- Modify: `docs/checkpoints/*`
- Create or modify: `.vercel/project.json` only if repository configuration proves it is required

**Interfaces:**
- Consumes: build scripts, release evidence, environment gates, Vercel metadata.
- Produces: diagnosable failures, meaningful CI, accurate deployment instructions, and safe Preview readiness.

- [ ] **Step 1: Add failing checks for workflow and evidence gaps.**
  Cover detached Git, secret scanning, environment gates, and required commands.
- [ ] **Step 2: Repair structured diagnostics.**
  Include source, run, route, and operation context without secrets or private data.
- [ ] **Step 3: Repair CI and Preview configuration.**
  Preserve strict provenance and use completion branch deployment only.
- [ ] **Step 4: Update documentation from verified behavior.**
  Remove stale setup, runtime, release, and deployment claims.
- [ ] **Step 5: Commit the delivery slice.**
  Use `chore(release): align CI observability and deployment readiness`.

### Task 9: Final verification and release-candidate review

**Files:**
- Modify: only files required by failed verification
- Create: `docs/checkpoints/completion-final-report.md`

**Interfaces:**
- Consumes: all verified slices, Preview deployment, browser evidence, test outputs.
- Produces: honest release report with no hidden known internal blockers.

- [ ] **Step 1: Run bounded repository checks independently.**
  Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
  `pnpm test:inventory-acceptance`, `pnpm build`, and
  `node scripts/verify-client-bundle-secrets.mjs`.
- [ ] **Step 2: Run browser QA in small batches.**
  Check all required desktop, tablet, mobile, zoom, keyboard, motion, and focus states.
- [ ] **Step 3: Inspect Preview deployment.**
  Record URL, console errors, failed requests, performance signals, and critical flows.
- [ ] **Step 4: Review changed paths against `origin/main`.**
  Classify frontend, backend, crawler, database, CI, docs, and test changes.
- [ ] **Step 5: Write final report and commit.**
  Include exact statuses, scores, blockers, soak impact, and `MAIN_MODIFIED = NO`.
