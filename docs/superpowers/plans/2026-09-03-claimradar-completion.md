# ClaimRadar Completion Blockers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-verify the completion branch under Node 24, repair any actionable repository gates, and document only evidence-backed external blockers.

**Architecture:** Keep all work in the existing clean `codex/claimradar-completion` worktree. Use repository scripts for local gates, GitHub/Vercel metadata for remote gates, and staging credentials only when already authorized and present. Preserve production, main, and unrelated checkouts.

**Tech Stack:** Node 24.19.0, pnpm 11.20.0, TypeScript, Vitest, Next.js, GitHub Actions, Vercel, Supabase.

**Spec:** User-provided request in `C:\Users\Pavithran R A\.codex\attachments\5122dd73-480e-488b-88ed-a56d5c795c19\pasted-text.txt`

## Global Constraints

- Use the existing clean worktree and branch `codex/claimradar-completion`.
- Do not touch the original dirty checkout.
- Do not merge, deploy production, alter production data, or configure DNS.
- Use Node `>=24 <25`; authoritative verification must report Node 24.x.
- Never expose secrets or commit credentials.
- Keep runtime-sensitive candidates subject to a new final soak.

---

### Task 1: Establish the supported verification runtime

**Files:**

- Inspect: `.node-version`, `.nvmrc`, `package.json`
- Modify only if required: repository runtime metadata

**Interfaces:**

- Produces: reproducible Node 24 command prefix for every local gate.

- [ ] **Step 1: Confirm the existing Node 24 installation and package manager.**

Run the pinned Node executable and bundled pnpm. Record versions without exposing environment values.

- [ ] **Step 2: Check worktree, branch, identity, and remote alignment.**

Confirm the branch is clean, owner-attributed, and based on the intended remote head.

- [ ] **Step 3: Make the smallest runtime metadata correction if needed.**

Only change `.node-version`, `.nvmrc`, or package policy when evidence shows drift.

- [ ] **Step 4: Recheck the runtime metadata.**

Confirm `node --version` is `24.x` and package policy remains `>=24 <25`.

### Task 2: Repair repository-wide local gates

**Files:**

- Inspect: all files reported by `pnpm format:check`
- Modify: only non-conforming files after diff review
- Test: repository lint, typecheck, tests, build, inventory, migration, and secret checks

**Interfaces:**

- Consumes: Node 24 runtime from Task 1.
- Produces: fresh local evidence for every required gate.

- [ ] **Step 1: Run the full format check and capture exact failures.**
- [ ] **Step 2: Inspect each failing file and classify baseline versus completion work.**
- [ ] **Step 3: Format only the listed files.**
- [ ] **Step 4: Review the resulting diff for semantic changes.**
- [ ] **Step 5: Run format, lint, typecheck, tests, inventory acceptance, build, migration contract, and client secret scan.**
- [ ] **Step 6: Fix only reproducible repository defects with a failing regression test first.**
- [ ] **Step 7: Repeat the affected gate and then the complete local gate set.**

### Task 3: Audit CI and release coverage

**Files:**

- Inspect: `.github/workflows/ci.yml`, `.github/workflows/daily-crawl.yml`, `.github/workflows/source-health.yml`, `.github/workflows/staging-soak.yml`
- Modify: workflow files only where a useful required check is absent
- Test: local workflow syntax and repository checks

**Interfaces:**

- Produces: CI coverage for format, lint, typecheck, tests, inventory, build, secret scan, migrations, browser smoke, and release integrity.

- [ ] **Step 1: Map every required gate to its workflow job.**
- [ ] **Step 2: Add focused coverage for any missing material gate.**
- [ ] **Step 3: Validate workflow changes locally without using production credentials.**
- [ ] **Step 4: Review the workflow diff and rerun affected local checks.**

### Task 4: Verify remote branch, draft PR, exact-head CI, and Preview

**Files:**

- Modify: `docs/checkpoints/completion-final-report.md`

**Interfaces:**

- Consumes: pushed owner-attributed branch and local evidence.
- Produces: exact PR, CI run, Vercel deployment, Preview URL, and browser-QA evidence.

- [ ] **Step 1: Push only the reviewed completion branch changes.**
- [ ] **Step 2: Create or inspect the draft PR from completion to main.**
- [ ] **Step 3: Wait for CI on the exact branch head.**
- [ ] **Step 4: Inspect the exact-head Vercel deployment state and URL.**
- [ ] **Step 5: Use the browser skill to test the deployed pages and required viewports.**
- [ ] **Step 6: Record PASS only when the actual deployed surface was inspected.**

### Task 5: Verify staging runtime surfaces when authorized

**Files:**

- Inspect: `.env.staging.example`, `scripts/staging-preflight.mjs`, `scripts/verify-staging-rls-complete.mjs`, runtime routes, and migrations
- Modify: runtime code only for a reproduced defect, with a failing test first

**Interfaces:**

- Produces: evidence for Supabase, customer, admin, API, and crawler pre-soak gates.

- [ ] **Step 1: Check staging credential names and presence only.**
- [ ] **Step 2: Run the approved staging preflight when credentials exist.**
- [ ] **Step 3: Verify schema, constraints, indexes, RLS, auth, read paths, safe disposable writes, and cleanup.**
- [ ] **Step 4: Verify customer, admin, API, and supported crawler source families.**
- [ ] **Step 5: Classify absent credentials or SSO as exact external blockers.**

### Task 6: Publish a truthful release report

**Files:**

- Modify: `docs/checkpoints/completion-final-report.md`

**Interfaces:**

- Consumes: fresh local, remote, Preview, and staging evidence.
- Produces: explicit `LOCAL_PASS`, `REMOTE_CI_PASS`, `PREVIEW_PASS`, `STAGING_RUNTIME_PASS`, `PENDING_TIME_SOAK`, and `EXTERNAL_BLOCKER` states.

- [ ] **Step 1: Update the report to the final verified head.**
- [ ] **Step 2: Separate proven gates from unavailable external surfaces.**
- [ ] **Step 3: Record runtime-sensitive changes and new final soak requirement.**
- [ ] **Step 4: Confirm main and production remain unmodified.**
- [ ] **Step 5: Run final status and evidence checks before reporting.**
