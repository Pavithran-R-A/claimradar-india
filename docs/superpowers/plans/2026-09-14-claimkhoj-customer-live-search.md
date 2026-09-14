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
- Produces: deterministic public-production crawl policy used by `robots()`.

- [ ] **Step 1: Add failing crawl-policy tests**

Test production behavior with `VERCEL_ENV=production` and preview behavior with `VERCEL_ENV=preview`. Assert production allows `/`, blocks private routes, and emits `${brandConfig.url}/sitemap.xml`; assert preview returns `Disallow: /`.

- [ ] **Step 2: Add failing canonical tests**

Read the three dynamic route modules as source contracts and assert they no longer contain `https://claimradar.in`; assert their canonical generation derives from `brandConfig.url`.

- [ ] **Step 3: Implement crawl policy**

Use Vercel's deployment environment as the primary production signal and retain `APP_ENV=production` as a non-Vercel/explicit fallback:

```ts
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  (!process.env.VERCEL_ENV && process.env.APP_ENV === 'production');
```

Preview must never become crawlable because `APP_ENV` was copied incorrectly.

- [ ] **Step 4: Replace hard-coded dynamic canonicals**

Use `${brandConfig.url}/claimables/${claim.slug}`, `${brandConfig.url}/companies/${slug}`, and `${brandConfig.url}/sectors/${slug}`.

- [ ] **Step 5: Run focused tests**
- [ ] **Step 6: Commit as `fix: make ClaimKhoj production crawlable with canonical origin`**

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
- Extends SEO helpers for `CollectionPage`, `ItemList`, and `DefinedTerm` without inventing facts.

- [ ] **Step 1: Write failing JSON-LD safety tests**

Assert the serializer emits valid JSON and escapes `<` so database/user content cannot terminate the script element.

- [ ] **Step 2: Write failing route structured-data tests**

Assert site-level Organization/WebSite markup contains ClaimKhoj and `brandConfig.url`; claim pages include WebPage + BreadcrumbList with official authority/source relationships represented truthfully; directory pages expose CollectionPage/ItemList only from real rows.

- [ ] **Step 3: Implement JSON-LD helpers/component**

Keep the component server-only and dependency-free. Do not add client hydration.

- [ ] **Step 4: Add site-level Organization and WebSite graph**
- [ ] **Step 5: Add route-level graphs to homepage, directories, claim/company/sector details, and glossary details**
- [ ] **Step 6: Improve claim answer-first semantic copy**

Without changing factual DB values, expose visible answer labels for `What this is`, `Who may qualify`, `Authority`, `Deadline`, `What to do`, `Documents/proof`, `Official source`, and `Last verified` using existing `PublishedClaimable` fields.

- [ ] **Step 7: Run structured-data and route tests**
- [ ] **Step 8: Commit as `feat: add truthful structured data and answer-first claim semantics`**

---

### Task 3: Dynamic sitemap correctness and freshness

**Files:**
- Modify: `apps/web/app/sitemap.ts`
- Modify: `apps/web/lib/claimables-repository.ts`
- Modify: `apps/web/tests/seo-sitemap.test.ts`

**Interfaces:**
- Published claimable entries use `lastVerifiedAt` or `publishedAt`, not a shared sitemap-generation timestamp.
- Taxonomy summaries may carry a derived latest-modified timestamp from their published claimables if required.

- [ ] **Step 1: Write failing sitemap tests using five published claimables**

Assert all five `/claimables/<slug>` URLs appear alongside their company and sector URLs.

- [ ] **Step 2: Write failing timestamp test**

Assert dynamic `lastModified` values derive from publication/verification data.

- [ ] **Step 3: Implement truthful timestamps and stable dynamic entries**

Preserve honest omission on repository failure; never fabricate URLs.

- [ ] **Step 4: Run sitemap tests**
- [ ] **Step 5: Commit as `fix: make sitemap complete and freshness-aware`**

---

### Task 4: Safe optional IndexNow integration

**Files:**
- Create: `apps/web/lib/indexnow.ts`
- Create: `apps/web/app/indexnow-key.txt/route.ts`
- Modify: `apps/web/app/admin/editorial-actions.ts`
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
- `INDEXNOW_KEY` is an environment-configured public protocol verification key, not a privileged database/API secret;
- no-op when the key is absent;
- reject URLs whose host differs from `brandConfig.url`;
- POST to `https://api.indexnow.org/indexnow` with `host`, `key`, `keyLocation`, and `urlList`;
- key verification is served at `${brandConfig.url}/indexnow-key.txt` and returns only the key as UTF-8 text;
- network/4xx failures are logged and return `submitted: false`; they never roll back an editorial publication/archive;
- submit only the specific URLs changed by the publication action.

- [ ] **Step 1: Write failing no-key, wrong-host, success, 4xx, and network-failure tests**
- [ ] **Step 2: Implement env validation and `submitIndexNowUrls`**
- [ ] **Step 3: Implement `/indexnow-key.txt` verification route**
- [ ] **Step 4: After `approvePublication`, query the published claim slug/company/sector and submit the changed public URLs after DB/audit success**
- [ ] **Step 5: After `archiveClaimable`, submit the archived claim URL after DB/audit success so participating engines can refresh/remove stale results**
- [ ] **Step 6: Run IndexNow/editorial action tests**
- [ ] **Step 7: Commit as `feat: add safe IndexNow discovery notifications`**

---

### Task 5: Customer-live trust copy and release state

**Files:**
- Modify: `apps/web/app/(public)/contact/page.tsx`
- Modify: `packages/config/src/index.ts`
- Modify: `docs/checkpoints/release-status-current.md`
- Create: `docs/checkpoints/customer-live-search-release.md`
- Create: `apps/web/tests/customer-live-copy.test.ts`

**Interfaces:**
- Preserve nullable configured contact emails.
- Fallback copy must remain truthful when no outbound/support inbox is configured.

- [ ] **Step 1: Add failing copy contract**

Assert public customer pages no longer say `before public launch`, `prior to unrestricted public release`, or equivalent launch-placeholder text.

- [ ] **Step 2: Update fallback contact/governance copy**

When email is absent, state that direct email support is not currently offered, tell users to use the official authority for claim-specific questions, and preserve the public corrections methodology. Do not invent an address.

- [ ] **Step 3: Update release documentation**

Record that the public read/discovery product is customer-live on the Vercel origin while outbound production email, billing, auto-verification, and customer notifications remain independently disabled/unconfigured.

- [ ] **Step 4: Run copy tests**
- [ ] **Step 5: Commit as `docs: mark ClaimKhoj public discovery experience customer-live`**

---

### Task 6: Full verification, preview protection, production release

**Files:**
- No new runtime files unless verification exposes a defect.

- [ ] **Step 1: Run full repository verification**

Run the repository's format, lint, typecheck, tests, inventory acceptance, security/client-secret contracts, and production build.

- [ ] **Step 2: Open PR and inspect Vercel preview**

Verify preview `/robots.txt` remains `Disallow: /`; inspect representative canonicals and JSON-LD.

- [ ] **Step 3: Merge only after the preview production build passes**
- [ ] **Step 4: Verify production endpoints after merge**

Against `https://claimradar-staging.vercel.app` confirm:

- `/` → 200;
- `/claimables` → 200 and shows real published records;
- every current claim detail → 200;
- `/robots.txt` exposes the public production policy, not `Disallow: /`;
- `/sitemap.xml` includes all current claim/company/sector URLs;
- no canonical or JSON-LD URL contains `claimradar.in`;
- JSON-LD scripts parse successfully;
- no temporary bootstrap endpoint exists;
- Vercel runtime errors remain blocker-free.

- [ ] **Step 5: Record external webmaster actions distinctly**

Google Search Console and Bing Webmaster Tools property verification/submission cannot be marked complete until those external accounts are connected. Record them as `EXTERNAL_ACCOUNT_ACTION`, not engineering failures.

- [ ] **Step 6: Final report**

Update `docs/checkpoints/customer-live-search-release.md` with exact main SHA, deployment ID, endpoint checks, and external-account status.
