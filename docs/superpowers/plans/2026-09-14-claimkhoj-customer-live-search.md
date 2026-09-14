# ClaimKhoj Customer-Live Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ClaimKhoj customer-live and search-ready on `https://claimradar-staging.vercel.app` with correct crawlability, canonicals, structured data, AEO/GEO content structure, dynamic sitemap coverage, and safe discovery notifications.

**Architecture:** Treat `brandConfig.url` as the single public-origin source of truth, distinguish Vercel Production from Preview using the platform deployment environment, and keep private routes blocked. Add server-rendered JSON-LD and answer-first claim semantics without creating AI-only filler. Keep IndexNow optional and fail-open for publication, while Search Console/Bing verification remain external-account actions.

**Tech Stack:** Next.js 15 App Router, TypeScript, React Server Components, Supabase, Vercel, Vitest, schema.org JSON-LD, IndexNow.

**Spec:** `docs/superpowers/specs/2026-09-14-claimkhoj-customer-live-search-design.md`

## Global Constraints

- Public brand remains `ClaimKhoj`.
- Canonical public origin for this release is `https://claimradar-staging.vercel.app`.
- Preview/non-production deployments remain non-indexable.
- No public canonical or structured-data URL may hard-code `https://claimradar.in`.
- Billing, automatic verification, and customer notifications remain disabled unless separately approved.
- No fabricated content, fake email inboxes, fake reviews, or fake authority relationships.
- Search/AEO/GEO changes must not weaken CSP, RLS, server-only secret boundaries, accessibility, or source-verification rules.

---

### Task 1: Production crawlability and canonical origin contract

**Files:**
- Modify: `apps/web/app/robots.ts`
- Modify: `apps/web/app/(public)/claimables/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/companies/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/sectors/[slug]/page.tsx`
- Modify: `apps/web/tests/seo-sitemap.test.ts`
- Create: `apps/web/tests/customer-live-search-contract.test.ts`

**Interfaces:**
- Consumes: `brandConfig.url: string` from `@claimradar/config`.
- Produces: `isPublicProductionDeployment(): boolean` local helper or equivalent deterministic crawl policy used by `robots()`.

- [ ] **Step 1: Add failing crawl-policy tests**

Test production behavior with `VERCEL_ENV=production` and preview behavior with `VERCEL_ENV=preview`. Assert production allows `/`, blocks private routes, and emits `${brandConfig.url}/sitemap.xml`; assert preview returns `Disallow: /`.

- [ ] **Step 2: Add failing canonical tests**

Read the three dynamic route modules as source contracts and assert they no longer contain `https://claimradar.in`; assert their canonical generation derives from `brandConfig.url`.

- [ ] **Step 3: Implement crawl policy**

Use Vercel's deployment environment as the primary production signal and retain `APP_ENV=production` as a non-Vercel/explicit fallback. The effective condition should be equivalent to:

```ts
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && process.env.APP_ENV === 'production');
```

Preview must never become crawlable because `APP_ENV` was copied incorrectly.

- [ ] **Step 4: Replace hard-coded dynamic canonicals**

Use `${brandConfig.url}/claimables/${claim.slug}`, `${brandConfig.url}/companies/${slug}`, and `${brandConfig.url}/sectors/${slug}`.

- [ ] **Step 5: Run focused tests**

Run the SEO/crawl contract tests and verify all pass.

- [ ] **Step 6: Commit**

Commit as `fix: make ClaimKhoj production crawlable with canonical origin`.

---

### Task 2: Truthful structured data and answer-engine semantics

**Files:**
- Modify: `packages/seo/src/index.ts`
- Create: `apps/web/components/seo/json-ld.tsx`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/(public)/page.tsx`
- Modify: `apps/web/app/(public)/claimables/page.tsx`
- Modify: `apps/web/app/(public)/claimables/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/companies/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/sectors/[slug]/page.tsx`
- Modify: `apps/web/app/(public)/glossary/[term]/page.tsx`
- Create: `apps/web/tests/structured-data.test.ts`

**Interfaces:**
- Produces `JsonLd` server component accepting `data: object | object[]` and rendering `<script type="application/ld+json">` with `<` escaped as `\u003c`.
- Extends SEO helpers for `CollectionPage`, `ItemList`, and `DefinedTerm` data without introducing claims not visible on-page.

- [ ] **Step 1: Write failing JSON-LD safety tests**

Assert the serializer emits valid JSON and escapes `<` so user/database content cannot terminate the script element.

- [ ] **Step 2: Write failing route structured-data tests**

Assert site-level Organization/WebSite markup contains ClaimKhoj and `brandConfig.url`; claim pages include WebPage + BreadcrumbList with the official authority represented as data, not as ClaimKhoj's organization identity; directory pages expose CollectionPage/ItemList only from real rows.

- [ ] **Step 3: Implement JSON-LD helpers/component**

Keep the component server-only and dependency-free. Do not add client hydration.

- [ ] **Step 4: Add site-level graph**

Render Organization and WebSite JSON-LD from the root layout, using the approved Vercel origin and ClaimKhoj identity.

- [ ] **Step 5: Add route-level graphs**

Add breadcrumbs and truthful route schemas to the homepage, claim directory/detail, company detail, sector detail, and glossary detail pages.

- [ ] **Step 6: Improve claim answer-first semantic copy**

Without changing factual database content, ensure the claim dossier exposes visible labels for `What this is`, `Who may qualify`, `Authority`, `Deadline`, `What to do`, `Documents/proof`, `Official source`, and `Last verified` through headings/summary facts already available in `PublishedClaimable`.

- [ ] **Step 7: Run structured-data and route tests**

Verify the new JSON-LD tests and existing page tests pass.

- [ ] **Step 8: Commit**

Commit as `feat: add truthful structured data and answer-first claim semantics`.

---

### Task 3: Dynamic sitemap correctness and freshness

**Files:**
- Modify: `apps/web/app/sitemap.ts`
- Modify: `apps/web/lib/claimables-repository.ts`
- Modify: `apps/web/tests/seo-sitemap.test.ts`

**Interfaces:**
- Extend `CompanySummary`, `SectorSummary`, and `StateSummary` only if necessary with stable `lastModified` values derived from published claimables.
- Published claimable sitemap entries use `lastVerifiedAt` or `publishedAt`, not the sitemap-generation clock.

- [ ] **Step 1: Write failing sitemap tests for live entities**

Use repository fakes containing five published claimables and assert all five `/claimables/<slug>` URLs appear alongside their company and sector URLs.

- [ ] **Step 2: Write failing timestamp test**

Assert claim detail sitemap `lastModified` comes from claim publication/verification data rather than a single `new Date()` shared by every URL.

- [ ] **Step 3: Implement truthful timestamps and stable dynamic entries**

Preserve honest omission on repository failure; never fabricate URLs.

- [ ] **Step 4: Run sitemap tests**

Verify exact URL coverage and timestamps.

- [ ] **Step 5: Commit**

Commit as `fix: make sitemap complete and freshness-aware`.

---

### Task 4: Optional IndexNow discovery integration

**Files:**
- Create: `apps/web/lib/indexnow.ts`
- Create: `apps/web/app/[indexNowKey]/route.ts` only if a dynamic root-key route can be safely constrained; otherwise use a static route generated from non-secret public key configuration.
- Modify: `apps/web/env.ts`
- Modify: `.env.example`
- Modify: `.env.staging.example`
- Create: `apps/web/tests/indexnow.test.ts`

**Interfaces:**

```ts
export async function submitIndexNowUrls(urls: string[]): Promise<{
  attempted: number;
  submitted: boolean;
  reason?: string;
}>;
```

Rules:
- no-op when `INDEXNOW_KEY` is absent;
- reject URLs whose host differs from `brandConfig.url`;
- submit only added/updated/deleted URLs supplied by the caller;
- network failure logs safely and returns `submitted: false` without throwing into publication paths.

- [ ] **Step 1: Write failing host-validation/no-key tests**
- [ ] **Step 2: Implement environment validation and IndexNow client**
- [ ] **Step 3: Implement key verification endpoint without leaking any other secret**
- [ ] **Step 4: Add unit tests for 200/4xx/network-failure behavior**
- [ ] **Step 5: Commit**

Commit as `feat: add safe optional IndexNow discovery notifications`.

---

### Task 5: Customer-live trust copy and public launch state

**Files:**
- Modify: `apps/web/app/(public)/contact/page.tsx`
- Modify: `packages/config/src/index.ts`
- Modify: `docs/checkpoints/release-status-current.md`
- Create: `docs/checkpoints/customer-live-search-release.md`
- Create: `apps/web/tests/customer-live-copy.test.ts`

**Interfaces:**
- Preserve nullable configured contact emails.
- Fallback copy must be truthful and usable without saying the site is "not launched".

- [ ] **Step 1: Add failing copy contract**

Assert public pages do not contain `before public launch`, `prior to unrestricted public release`, or retired ClaimRadar canonical-domain language.

- [ ] **Step 2: Update fallback contact/governance copy**

When no email is configured, state that direct email support is not currently offered and direct claim-specific questions to the issuing authority; keep the corrections methodology visible. Do not invent an inbox.

- [ ] **Step 3: Update release documentation**

Record that the public read/discovery product is customer-live on the Vercel origin, while outbound production email, billing, auto-verification, and notifications remain separately disabled/unconfigured.

- [ ] **Step 4: Run copy tests**
- [ ] **Step 5: Commit**

Commit as `docs: mark ClaimKhoj public discovery experience customer-live`.

---

### Task 6: Full verification, preview protection, production release

**Files:**
- No new runtime files unless verification exposes a defect.

- [ ] **Step 1: Run full repository verification**

Run formatting, lint, typecheck, web tests, inventory acceptance, and production build using the repository's existing scripts.

- [ ] **Step 2: Open PR and inspect Vercel preview**

Verify preview `robots.txt` remains `Disallow: /`; inspect representative canonicals and JSON-LD.

- [ ] **Step 3: Verify no secrets/client leakage**

Run existing client secret scan/security contracts; ensure IndexNow key is the only root verification token and is intentionally public per protocol.

- [ ] **Step 4: Merge only after preview build passes**

Use squash merge after review.

- [ ] **Step 5: Verify production endpoints after merge**

Against `https://claimradar-staging.vercel.app` confirm:

- `/` → 200
- `/claimables` → 200 and shows the real records
- each current published claim detail → 200
- `/robots.txt` → public allow policy, not `Disallow: /`
- `/sitemap.xml` → all current claim/company/sector URLs
- no canonical contains `claimradar.in`
- JSON-LD scripts parse successfully
- no temporary bootstrap endpoint exists
- Vercel runtime errors remain empty/blocker-free

- [ ] **Step 6: Record external webmaster actions distinctly**

Google Search Console and Bing Webmaster Tools property verification/submission cannot be marked complete until those external accounts are connected. Record them as `EXTERNAL_ACCOUNT_ACTION`, not engineering failures.

- [ ] **Step 7: Final commit/report**

Update `docs/checkpoints/customer-live-search-release.md` with exact main SHA, deployment ID, endpoint checks, and external-account status.
