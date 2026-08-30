# ClaimRadar India — Evidence Radar Design System & Frontend Transformation Checkpoint

**Date:** August 30, 2026  
**Environment:** Staging / Production Readied  
**Branch:** `main`  
**Commit Hash:** `57f2833` (or newer)  
**Deployed Staging URL:** [https://claimradar-staging.vercel.app](https://claimradar-staging.vercel.app)  
**GitHub Actions CI Run:** `33292157762` (Passed / Green)  
**Baseline Staging Soak Run:** `33262610772` (Passed / 106 documents / 0 errors / all policy guards `false`)

---

## 1. Executive Summary

ClaimRadar India has completed a total frontend transformation from a generic prototype into a distinctive, authoritative consumer utility and evidence radar system. The complete web application has been rebuilt with custom vector iconography, a high-trust editorial visual hierarchy, a 7-stage verifiable evidence pipeline, responsive mobile drawer navigation with strict WCAG 2.2 AA accessibility, zero-inventory confidence handling ("Evidence Desk"), and verified zero client-side secret exposure.

---

## 2. Core Design System & Aesthetic Archetype

The design system implements the **Evidence Radar** visual language:

- **Scalable Vector BrandMark:** Concentric radar range rings (radii 3px, 7px, 11px), coordinate axes (X/Y), radar sweep detection path ("C"/"R" curve geometry), and signal beacon blip.
- **Deep-Ink & Warm Light Semantic Tokens:** High contrast `--c-background`, `--c-surface`, `--c-trust-primary` (4.9:1 on white), `--c-success`, `--c-deadline` (saffron), and `--c-danger`.
- **Restrained Material Physics:** Ambient soft shadows (`shadow-card`, `shadow-lift`), 12px card border radii, and active feedback states.
- **Anti-AI-Slop Governance:** Zero purple-blue gradients, zero floating spheres, zero fake testimonials, zero stock photos, zero artificial counters, and zero fabricated deadlines.
- **Motion & Accessibility:** Continuous CSS radar sweep (8s) and beacon pulses that completely collapse under `@media (prefers-reduced-motion: reduce)`.

---

## 3. Product Architecture & Page Transformations

### 3.1 Homepage (`/`)

- **Asymmetric Hero:**
  - _Left:_ Civic service badge, plain-language customer headline (_"Money you may be owed shouldn't stay hidden."_), interactive hero search with quick query chips (_PACL, Sahara, SEBI, NCLT_), and direct navigation links.
  - _Right:_ `EvidenceRadarVisual` instrument displaying real-time monitoring of SEBI, RBI, IBBI, NCLT, and PIB feeds with a rotating beam sweep, interactive beacon nodes, and a 4-stage progression rail.
- **Editorial Trust Band:** Unmissable trust indicator stating ClaimRadar's strict independence, direct official portal links, and no-intermediary guarantee.
- **Opportunity Ingestion Feed & Zero-Inventory Integrity:**
  - If opportunities exist: Prioritized opportunity cards featuring plain-language titles, affected groups, deadlines, and official source badges.
  - If 0 records exist: An _"Evidence Desk Status"_ view explaining the 4-stage verification filter (Official Notices → Document Ingest → Editorial Review → Public Listing) making zero inventory feel like integrity rather than failure.
- **Continuous Evidence Pipeline Rail:** 7-stage visual flow (_Official Notice → Signal Detected → Document Checked → Evidence Structured → Human Review → Published with Source → User Acts Directly_).
- **Monitored Source Network:** Structured grid covering Securities & Market Regulators, Banking & Depository, Insolvency Authorities, and Government Press Releases.
- **Editorial Principles:** _"Why ClaimRadar publishes less, not more"_ explaining our official-source mandate, zero automated publishing, and correction policy.
- **Watchlist & Alert CTA:** Personal watchlist creation for instant notifications.
- **2-Column FAQ Layout:** Context and editorial explanation on the left; accessible expandable accordion on the right.

### 3.2 Directory & Detail Pages

- **Directory (`/claimables`):** Responsive filters (Search, Status, Sector, Sort), active filter chips, paginated grid with structured `ClaimableCard` components, and zero-inventory fallback.
- **Evidence Dossier (`/claimables/[slug]`):**
  - Left column: Plain-language summary, _"Who may qualify"_, _"Relief stated"_, _"Proof you may need"_, _"Official action route"_, _"How we verified this"_, _"Official sources"_, and record timeline.
  - Right rail: Status badge, deadline countdown, regulator details, last verified timestamp, and prominent _"Open official source"_ / _"Continue on official portal"_ CTA.
- **Time-Sensitive Feeds:** `/closing-soon` and `/deadlines` featuring semantic deadline countdowns and urgent warning badges.
- **Educational Pages:** `/how-it-works` and `/methodology` outlining deterministic document hashing, source extraction, and human editorial controls.
- **Regulatory Coverage:** `/sources` detailing monitored domains across India.

### 3.3 Authentication & Workspace Shells

- **Auth Shell (`/(auth)`):** Privacy-first authentication shell featuring `ClaimRadarBrand`, accessible 44px input fields, clear error alerts, and explicit privacy notices.
- **Customer Workspace (`/app`):** Personal matching, watchlist, claim tracker, and notification center with unified Evidence Radar branding.
- **Operations Console (`/admin`):** Admin operations desk for candidate reviews, crawl run audits, and editorial management.

---

## 4. Verification Evidence & Quality Gates

### 4.1 Automated CI & Unit Tests

- **GitHub Actions CI Run:** `33292157762` (Passed / Green in 1m 55s)
- **Unit & Integration Test Suites:** 47 test files, 443 tests passing (100% pass rate)
- **Typecheck:** Zero TypeScript errors across all 11 workspace packages and Next.js app
- **ESLint:** Zero warnings or errors
- **Static & Dynamic Routes:** 44/44 Next.js routes generated and compiled cleanly

### 4.2 Client Bundle Secret Audit

Executed `scripts/verify-client-bundle-secrets.mjs` against `apps/web/.next/static`:

- Scanned 101 client JavaScript bundles
- `sb_secret_*`: 0 matches
- Service role key: 0 matches
- `postgresql://`: 0 matches
- `SUPABASE_DB_PASSWORD`: 0 matches
- `DATABASE_URL`: 0 matches
- `SUPABASE_ACCESS_TOKEN`: 0 matches
- **Result:** 100% Clean — 0 backend secrets exposed.

### 4.3 Live Deployed Staging Browser QA

Executed `scripts/capture-deployed-qa.mjs` against `https://claimradar-staging.vercel.app`:

- **Viewports Verified (8/8):**
  - Desktop 1536x960: 200 OK
  - Desktop 1440x900: 200 OK
  - Desktop 1280x800: 200 OK
  - Tablet 1024x768: 200 OK
  - Tablet 768x1024: 200 OK
  - Mobile 430x932: 200 OK
  - Mobile 390x844: 200 OK
  - Mobile 360x800: 200 OK
- **Accessibility Checks:**
  - Skip link operable (`Skip to main content`): PASSED
  - Single H1 per page: PASSED
  - Zero missing image alt tags: PASSED
  - Mobile drawer ARIA dialog & focus management: PASSED
  - Mobile drawer closes on Escape key: PASSED
  - FAQ accordion keyboard navigation: PASSED

---

## 5. Non-Negotiable Safety & Policy Guards Verification

The strict staging safety invariants remain intact and actively enforced across the application and crawler runtime:

- `ENABLE_BILLING=false`
- `AUTO_VERIFY_CLAIMABLES=false`
- `NOTIFY_CUSTOMERS_ENABLED=false`
- `APP_ENV=staging`

All deferred human tasks remain clearly documented:

1. Production Custom Domain (DNS cutover)
2. Production SMTP credentials
