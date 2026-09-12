# ClaimKhoj Production UI/UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the existing ClaimKhoj public visual direction into a production-grade, responsive, accessible consumer experience without changing crawler, RBI, Supabase, auth, publication, or release semantics.

**Architecture:** Keep the current Next.js/App Router structure and ClaimKhoj visual identity. Refine the shared public shell first, then the hero/search/radar/journey composition, then below-the-fold continuity and browser validation. Use existing Tailwind/design-system primitives; only add components where repeated public presentation has a real reuse boundary.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, lucide-react, Vitest, Playwright/axe browser QA, pnpm 11, Node 24.

**Spec:** `docs/superpowers/specs/2026-09-12-claimkhoj-production-uiux-polish-design.md`

## Global Constraints

- Preserve the existing ClaimKhoj identity: trust navy, teal, warm gold, editorial serif display headings, clean sans-serif UI text.
- WCAG 2.2 AA is the accessibility floor for the polished public experience.
- No authored horizontal overflow at representative mobile, tablet, and desktop widths.
- Do not change crawler/adapters, RBI feed behavior, Supabase/database semantics, authentication/authorization rules, publication state, source-registry truthfulness, scheduled crawl logic, or soak/release logic.
- Keep motion restrained and honor `prefers-reduced-motion`.
- Do not merge to `main` until a Vercel preview has been visually reviewed.

---

### Task 1: Lock the production UI/UX contract with failing tests

**Files:**
- Create: `apps/web/tests/production-uiux-contract.test.ts`
- Modify if needed: `apps/web/tests/evidence-radar-accessibility.test.ts`

**Interfaces:**
- Consumes: existing public page, header, footer, search, radar, and global CSS source files.
- Produces: a static source contract that fails until the production-polish structure and accessibility hooks are present.

- [ ] **Step 1: Add failing tests for the target shell and hero contracts**

Create `apps/web/tests/production-uiux-contract.test.ts` with source-level assertions that require:

```ts
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

const page = read('../app/(public)/page.tsx');
const header = read('../components/layout/header.tsx');
const footer = read('../components/layout/footer.tsx');
const search = read('../components/landing/interactive-hero-search.tsx');
const radar = read('../components/landing/evidence-radar-visual.tsx');
const css = read('../app/globals.css');

describe('ClaimKhoj production UI/UX contract', () => {
  it('uses a deliberate hero composition and bounded editorial annotation', () => {
    expect(page).toContain('data-ui="hero-grid"');
    expect(page).toContain('data-ui="hero-annotation"');
    expect(page).not.toContain('absolute -right-2 -top-8');
  });

  it('keeps search as the primary hero action and stacks safely on narrow screens', () => {
    expect(search).toContain('aria-label="Search ClaimKhoj opportunities"');
    expect(search).toContain('data-ui="hero-search"');
    expect(search).toContain('min-h-[48px]');
  });

  it('provides dedicated mobile and desktop radar presentations', () => {
    expect(radar).toContain('data-ui="radar-desktop"');
    expect(radar).toContain('data-ui="radar-mobile"');
  });

  it('uses consistent public shell focus and target treatment', () => {
    expect(header).toContain('min-h-[44px]');
    expect(footer).toContain('focus-visible:');
    expect(css).toContain('--public-radius-card');
    expect(css).toContain('--public-shadow-card');
  });

  it('exposes a responsive journey that is not desktop-only decoration', () => {
    expect(page).toContain('data-ui="claim-journey"');
    expect(page).toContain('sm:grid-cols-2');
    expect(page).toContain('lg:grid-cols-4');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test -- apps/web/tests/production-uiux-contract.test.ts
```

Expected: FAIL because the new `data-ui` hooks/tokens/mobile radar contract do not exist yet.

- [ ] **Step 3: Commit the RED test only**

```bash
git add apps/web/tests/production-uiux-contract.test.ts apps/web/tests/evidence-radar-accessibility.test.ts
git commit -m "test: define ClaimKhoj production UI UX contract"
```

---

### Task 2: Normalize public design tokens and the shared shell

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/components/layout/header.tsx`
- Modify: `apps/web/components/layout/footer.tsx`
- Test: `apps/web/tests/production-uiux-contract.test.ts`
- Test: `apps/web/tests/motion-accessibility.test.ts`

**Interfaces:**
- Consumes: existing ClaimKhoj design tokens and design-system button/link primitives.
- Produces: consistent public spacing/radius/shadow/focus primitives used by landing and public pages.

- [ ] **Step 1: Add public surface tokens in `:root`**

Add exact shared tokens:

```css
--public-radius-card: 1rem;
--public-radius-control: 0.75rem;
--public-shadow-card: 0 18px 48px rgba(13, 33, 72, 0.07);
--public-shadow-control: 0 10px 28px rgba(13, 33, 72, 0.06);
--public-section-space: clamp(3.5rem, 7vw, 6rem);
```

Use them in new utility classes `.public-card`, `.public-section`, and `.public-focus` without changing dark/light semantic color tokens.

- [ ] **Step 2: Refine the desktop header hierarchy**

In `header.tsx`:

- Keep the sticky shell but use a slightly taller desktop header (`h-[72px]`) and retain `h-16` on mobile.
- Remove the narrow two-line slogan between search and CTA so the right side is not cramped.
- Give desktop nav links at least 44px effective height with `min-h-[44px]` and visible focus treatment.
- Keep the search icon and primary `Explore Claims` CTA.
- Preserve active navigation semantics.

- [ ] **Step 3: Harden mobile navigation accessibility**

- Ensure menu/close buttons are at least 44×44 CSS px.
- Preserve Escape close behavior and body scroll lock.
- Keep focus return to the trigger.
- Add focus-visible ring classes to drawer links and actions.

- [ ] **Step 4: Recompose the footer into three clear groups**

- Brand/trust statement.
- Primary/help navigation.
- Legal/transparency links.
- Ensure all footer links include `focus-visible:` treatment and comfortable hit areas.
- Keep the truthful “independent public information service” statement.

- [ ] **Step 5: Run focused shell/motion tests and verify GREEN**

```bash
pnpm test -- apps/web/tests/production-uiux-contract.test.ts apps/web/tests/motion-accessibility.test.ts
```

Expected: shell-related assertions PASS; hero/radar/journey assertions may remain RED until their tasks.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/globals.css apps/web/components/layout/header.tsx apps/web/components/layout/footer.tsx
git commit -m "feat: polish ClaimKhoj public shell"
```

---

### Task 3: Make hero search the primary interaction

**Files:**
- Modify: `apps/web/components/landing/interactive-hero-search.tsx`
- Modify: `apps/web/app/(public)/page.tsx`
- Test: `apps/web/tests/production-uiux-contract.test.ts`

**Interfaces:**
- Consumes: `router.push('/claimables?...')` behavior and existing All India selector.
- Produces: responsive primary search control with explicit form label, stable button sizing, and non-cramped suggestions.

- [ ] **Step 1: Refine form semantics and geometry**

Add `aria-label="Search ClaimKhoj opportunities"` and `data-ui="hero-search"` to the form. Use a calm card/control treatment with `min-h-[48px]` targets, `lg:flex-row`, and full-width CTA on narrow viewports.

- [ ] **Step 2: Preserve behavior exactly**

Keep:

```ts
router.push(`/claimables?search=${encodeURIComponent(trimmed)}`);
router.push('/claimables');
```

Do not add new location semantics or backend filtering.

- [ ] **Step 3: Improve suggestions**

Render suggestions as pill-like secondary actions with at least 36px practical height and no dot separators that create visual noise on mobile.

- [ ] **Step 4: Add clear status behavior**

Keep `aria-busy`; disable the submit button while submitting and expose `Searching…` text without changing navigation behavior.

- [ ] **Step 5: Run the focused test**

```bash
pnpm test -- apps/web/tests/production-uiux-contract.test.ts
```

Expected: search assertions PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/landing/interactive-hero-search.tsx apps/web/app/(public)/page.tsx
git commit -m "feat: elevate ClaimKhoj hero search"
```

---

### Task 4: Rebuild the hero composition and discovery journey

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/tests/production-uiux-contract.test.ts`

**Interfaces:**
- Consumes: `InteractiveHeroSearch`, `EvidenceRadarVisual`, existing ClaimKhoj copy, and `JOURNEY` labels.
- Produces: balanced hero, contained editorial annotation, responsive four-step journey, and continuous first-screen hierarchy.

- [ ] **Step 1: Recompose hero grid**

Use a balanced desktop layout with:

```tsx
<div data-ui="hero-grid" className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)] xl:gap-14">
```

Keep left-side hierarchy as headline → supporting copy → search → trust points.

- [ ] **Step 2: Bound the editorial annotation**

Move the “Checking trusted sources for you” note inside the right visual column using `data-ui="hero-annotation"`, a safe inset, and hide it below `xl` so it cannot collide with navigation or viewport edges.

- [ ] **Step 3: Replace the fragile absolute journey rail**

Replace the desktop-only absolute positioned journey with a responsive semantic container:

```tsx
<ol data-ui="claim-journey" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
```

Each step gets a numbered/status marker, label, and description. Keep the exact concepts Discover, Verify, Understand, Act.

- [ ] **Step 4: Remove obsolete journey SVG/absolute positioning**

Delete the long decorative absolute wave and percentage-based `left` positions that make the layout brittle.

- [ ] **Step 5: Run focused tests**

```bash
pnpm test -- apps/web/tests/production-uiux-contract.test.ts
```

Expected: hero and journey assertions PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/(public)/page.tsx apps/web/app/globals.css
git commit -m "feat: complete ClaimKhoj hero composition"
```

---

### Task 5: Simplify the evidence radar and add a real mobile representation

**Files:**
- Modify: `apps/web/components/landing/evidence-radar-visual.tsx`
- Modify: `apps/web/tests/evidence-radar-accessibility.test.ts`
- Test: `apps/web/tests/production-uiux-contract.test.ts`

**Interfaces:**
- Consumes: `MONITORED_NODES`, selected-node state, existing source truth/copy.
- Produces: desktop radar and mobile source selector sharing one truthful selected-source detail panel.

- [ ] **Step 1: Keep one data model and selected state**

Do not duplicate source truth. `MONITORED_NODES` remains the sole source for both desktop and mobile presentations.

- [ ] **Step 2: Mark the desktop instrument explicitly**

Wrap the current radial instrument in:

```tsx
<div data-ui="radar-desktop" className="hidden sm:block">...</div>
```

Reduce non-essential decoration, keep the center ClaimKhoj mark, and preserve keyboard buttons over nodes.

- [ ] **Step 3: Add a mobile source selector**

Add:

```tsx
<div data-ui="radar-mobile" className="sm:hidden">...</div>
```

Render the five monitored sources as a horizontally scrollable/compact button row or two-column grid with `aria-pressed`, at least 44px targets, and the same selected-source detail content below.

- [ ] **Step 4: Remove the close-X dependency from the main reading flow**

The selected spotlight should always show a valid source by default. Keep Escape support if a temporary inspector state remains, but avoid an empty panel as the primary state.

- [ ] **Step 5: Strengthen accessibility test assertions**

Add assertions for both `data-ui="radar-desktop"` and `data-ui="radar-mobile"`, `aria-pressed`, and 44px mobile targets.

- [ ] **Step 6: Run focused tests**

```bash
pnpm test -- apps/web/tests/evidence-radar-accessibility.test.ts apps/web/tests/production-uiux-contract.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/landing/evidence-radar-visual.tsx apps/web/tests/evidence-radar-accessibility.test.ts
git commit -m "feat: simplify ClaimKhoj source radar"
```

---

### Task 6: Unify below-the-fold hierarchy and trust messaging

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`
- Modify: `apps/web/components/landing/evidence-flow-diagram.tsx`
- Modify: `apps/web/components/layout/footer.tsx`
- Test: `apps/web/tests/public-copy-contract.test.ts`
- Test: `apps/web/tests/frontend-truth-integrity.test.ts`

**Interfaces:**
- Consumes: published claimables, public source families, truthful demo/empty states, evidence flow.
- Produces: consistent section rhythm, source cards, opportunity list, process explanation, trust statement, final CTA.

- [ ] **Step 1: Normalize section spacing and heading patterns**

Apply `.public-section` rhythm and consistent heading/subcopy patterns to official sources, latest opportunities, How ClaimKhoj Works, and trust sections.

- [ ] **Step 2: Standardize source cards and opportunity rows**

Use one radius/shadow/border hierarchy, comfortable 44px+ click targets, and visible focus states.

- [ ] **Step 3: Align process language**

Ensure `EvidenceFlowDiagram` uses the same Discover → Verify → Understand → Act language as the hero journey, avoiding a second competing mental model.

- [ ] **Step 4: Preserve public-truth boundaries**

Keep copy that ClaimKhoj checks official sources, does not file claims, does not collect official filing fees, and sends users to official portals. Do not introduce entitlement guarantees.

- [ ] **Step 5: Add one final CTA before the footer**

Use a single action to explore/search claims rather than multiple competing marketing buttons.

- [ ] **Step 6: Run truth/copy tests**

```bash
pnpm test -- apps/web/tests/public-copy-contract.test.ts apps/web/tests/frontend-truth-integrity.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/(public)/page.tsx apps/web/components/landing/evidence-flow-diagram.tsx apps/web/components/layout/footer.tsx
git commit -m "feat: unify ClaimKhoj public page hierarchy"
```

---

### Task 7: Browser, responsive, accessibility, and runtime-integrity validation

**Files:**
- Modify only if required by truthful new layout: `scripts/final-route-browser-qa.mjs`
- Modify only if required: `scripts/ci-browser-smoke.mjs`
- Modify only if required: relevant visual/accessibility tests under `apps/web/tests/`
- Add: `docs/checkpoints/claimkhoj-production-uiux-polish-validation.md`

**Interfaces:**
- Consumes: completed public UI implementation.
- Produces: release-grade evidence without altering operational/runtime semantics.

- [ ] **Step 1: Run static quality gates**

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all PASS.

- [ ] **Step 2: Run browser gates**

```bash
pnpm test:browser-smoke
pnpm test:final-browser-qa
```

Expected: all configured public route/viewports PASS.

- [ ] **Step 3: Manually inspect representative widths**

Verify at minimum 320, 390, 768, 1024, 1440 CSS px:

- no authored horizontal overflow;
- header/mobile navigation does not obscure focus;
- hero annotation does not overlap content;
- search controls never clip;
- radar switches to the mobile representation cleanly;
- journey remains readable;
- footer wraps intentionally.

- [ ] **Step 4: Verify keyboard-only flow**

Tab through header → hero search → search suggestions → radar/source buttons → primary content links → final CTA → footer. Confirm visible focus and logical order.

- [ ] **Step 5: Verify reduced motion**

Run browser QA with `prefers-reduced-motion: reduce` and confirm radar sweep/entrance/drawer transitions reduce to near-instant/non-animated behavior.

- [ ] **Step 6: Review runtime-sensitive diff**

Confirm changed files are limited to public UI, UI tests, QA fixtures, and docs. No crawler/RBI/Supabase/auth/publication/runtime release files may change.

- [ ] **Step 7: Record validation evidence**

Create `docs/checkpoints/claimkhoj-production-uiux-polish-validation.md` with exact commands, pass/fail totals, tested viewport widths, preview URL, and remaining human visual-review status.

- [ ] **Step 8: Commit validation checkpoint**

```bash
git add docs/checkpoints/claimkhoj-production-uiux-polish-validation.md
git commit -m "docs: record ClaimKhoj UI UX validation"
```

---

### Task 8: Preview and pull request gate

**Files:**
- No production files unless preview review reveals a concrete defect.

**Interfaces:**
- Consumes: fully validated branch.
- Produces: reviewable Vercel preview and PR; no merge without visual approval.

- [ ] **Step 1: Push branch and wait for Vercel preview**

Use the branch `design/claimkhoj-production-uiux-polish`.

- [ ] **Step 2: Review Vercel preview against the acceptance criteria**

Inspect the actual rendered homepage at desktop and mobile. If any overlap, clipping, hierarchy, or spacing defect remains, fix it on the branch and repeat validation.

- [ ] **Step 3: Open/update a PR to `main`**

PR summary must state:

- visual/UX-only public-surface scope;
- accessibility/responsive changes;
- exact validation commands and totals;
- runtime-sensitive diff boundary;
- visual review status;
- that the release soak must be restarted after any merged UI/runtime candidate according to the existing release process.

- [ ] **Step 4: Do not merge until human visual sign-off**

Keep production merge held until the rendered preview is approved.
