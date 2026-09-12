# ClaimKhoj Production UI/UX Polish Validation

## Status

IMPLEMENTATION COMPLETE / MERGE HELD

The public UI/UX implementation is present on `design/claimkhoj-production-uiux-polish`. Merge remains deliberately held for human rendered-preview sign-off and because GitHub Actions is currently failing before the job receives a runner or executes any workflow steps.

## Scope

Compared with `design/claimkhoj-final-visual-review`, the branch changes are limited to:

- public landing-page presentation;
- shared public header/footer presentation;
- landing search/radar/evidence-flow presentation;
- global public UI tokens/motion CSS;
- UI accessibility/source-contract tests;
- design, plan, and validation documentation.

No crawler, RBI adapter, Supabase/database, authentication/authorization, publication, source-registry semantics, scheduled crawl, or soak/release files are changed by this polish pass.

## Vercel Production-Build Evidence

Exact application head before this documentation-only checkpoint: `00bad7acc7eac21f09e18fde068f6bd9f5af7374`.

Vercel deployment: `dpl_yn8L6qgGcShq15mdpKvfz4prty43`.

State: READY.

Observed build pipeline and results:

- package TypeScript builds executed with `tsc`;
- Next.js 15.5.22 optimized production build compiled successfully;
- Next.js reported `Linting and checking validity of types`;
- page-data collection completed;
- static page generation completed `7/7`;
- page optimization and build traces completed;
- Vercel reported `Build Completed` and `Deployment completed`.

The Next build emitted existing warnings about the Next.js ESLint plugin not being detected and edge-runtime/static-generation behavior; neither warning stopped the build.

## Runtime / Route Evidence

The immediately preceding application commit `6a7c7dd4222f47ce65b23e184d46e2b8cb362bf1` deployed READY on Vercel. Its app code is identical to the `00bad7...` application tree; the later commit only added a source-contract test.

Authenticated preview fetches returned HTTP 200 for:

- `/`
- `/claimables`

The rendered HTML confirmed the shared ClaimKhoj header/footer, one public `<main id="main-content">` landmark supplied by the public layout, the production hero/search/radar/journey structure, and preview `x-robots-tag: noindex` behavior.

Vercel runtime error/fatal-log query for that preview returned no matching entries in the inspected window.

## GitHub Actions

GitHub Actions cannot currently be treated as test evidence.

Latest observed run: `34707804889`.

Initial job: failed before workflow steps were available.

A failed-jobs rerun was requested successfully. The rerun again produced a failed `build` job (`103591431576`) with `steps: null` and no job logs exposed, indicating that the workflow did not reach the repository's format/lint/build/typecheck/unit/inventory/browser commands.

Therefore the following CI-only gates are **not independently verified in GitHub Actions** in this checkpoint:

- `pnpm format:check`;
- full `pnpm lint` outside the Next build's integrated lint phase;
- `pnpm test`;
- `pnpm test:inventory-acceptance`;
- `pnpm test:browser-smoke`;
- `pnpm test:final-browser-qa`.

Do not report those suites as passing until a runner actually executes them and returns successful output.

## Accessibility / Responsive Contract

The implementation includes:

- 44–48px practical target sizing on primary public controls;
- explicit focus-visible treatment;
- skip-link targeting of the single public main landmark;
- mobile navigation with Escape close and focus return;
- responsive search composition;
- dedicated compact/mobile and desktop radar presentations from one source model;
- responsive `Discover → Verify → Understand → Act` journey;
- persistent, truthful source spotlight instead of a decorative/fake-close panel;
- reduced-motion overrides for non-essential motion.

Source-contract tests were added for these requirements, but their execution remains blocked by the GitHub Actions runner issue described above.

## Human Visual Gate

PENDING.

The Vercel preview must still be inspected as a rendered page at desktop and mobile sizes. Human sign-off must specifically check:

- no header/hero-annotation collision;
- search hierarchy and control wrapping;
- radar readability and source spotlight balance;
- no authored horizontal overflow;
- journey readability;
- consistent below-the-fold spacing;
- mobile navigation and footer wrapping.

Do not merge the PR to `main` until this rendered visual gate is approved.
