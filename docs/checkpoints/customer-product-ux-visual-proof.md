# ClaimRadar India — Customer Product UX Visual Proof

**Evidence Session:** 2026-08-12  
**Target Environment:** Deployed Staging (`DEPLOYED_STAGING`)  
**Deployment Status:** `AWAITING_FINAL_DEPLOYMENT`  
**Legacy Deployment URL Inspected:** `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`  
**Verified Vercel Git SHA for Old Deployment:** `ca3a010846e3dcba8059897d6155f5145668bafc`  
**Provenance Note:** Legacy screenshots move to `docs/checkpoints/browser-evidence/legacy-ca3a010/`. Final post-release QA evidence for the final immutable preview deployment will be stored externally outside Git at `C:\Users\Pavithran R A\Downloads\ClaimRadar-Final-QA\<short-final-sha>\` to prevent Git SHA invalidation.  
**Safety Controls:** `AUTO_VERIFY_CLAIMABLES=false` | `ENABLE_BILLING=false` | `NOTIFY_CUSTOMERS_ENABLED=false`

---

## 1. Evidence Collection Method

- **Bypass Verification:** Playwright context configured with official Vercel automation bypass headers from initial navigation (`x-vercel-protection-bypass`). Confirmed `200 OK` on ClaimRadar application routes; `Log in to Vercel` auth wall absent.
- **Evidence Origin:** Captured against live Vercel staging preview deployment.

---

## 2. Deployed Viewport Matrix (Live Staging)

| Viewport             | Dimensions | Title Verified | H1 Verified | Floating Right Controls | Mobile Drawer Operable |
| :------------------- | :--------- | :------------: | :---------: | :---------------------: | :--------------------: |
| **XL Desktop**       | 1536×960   |       ✅       |     ✅      |           `0`           |          N/A           |
| **Standard Desktop** | 1440×900   |       ✅       |     ✅      |           `0`           |          N/A           |
| **Medium Desktop**   | 1280×800   |       ✅       |     ✅      |           `0`           |          N/A           |
| **Tablet Landscape** | 1024×768   |       ✅       |     ✅      |           `0`           |          N/A           |
| **Tablet Portrait**  | 768×1024   |       ✅       |     ✅      |           `0`           |           ✅           |
| **Mobile Large**     | 430×932    |       ✅       |     ✅      |           `0`           |           ✅           |
| **Mobile Standard**  | 390×844    |       ✅       |     ✅      |           `0`           |           ✅           |
| **Mobile Compact**   | 360×800    |       ✅       |     ✅      |           `0`           |           ✅           |

---

## 3. Key UX & Accessibility Assertions (Deployed Staging)

### Header Navigation & Actions

- **Desktop (1536 / 1440):** Brand logo + text, primary nav links (`Find claims`, `Companies`, `Sectors`, `Deadlines`, `How it works`). Action buttons (`Sign in`, `Get alerts`) rendered in header.
- **Mobile (390×844 Drawer Audit):**
  - `MOBILE_DRAWER_VISIBLE`: **YES** (Dialog opens on hamburger click).
  - `MOBILE_DRAWER_ESCAPE`: **YES** (Escape key closes drawer).
  - `MOBILE_DRAWER_NAVIGATION`: **YES** (Clicking `/claimables` link navigates page).
  - `MOBILE_DRAWER_FOCUS`: **YES** (Focus trapped inside drawer when open).

### Accessibility & Semantics

- **Skip Link:** Operable as first keyboard focus (`A "Skip to content"`).
- **H1 Hierarchy:** 1 H1 per page across all routes.
- **Alt Text:** 0 images missing `alt` attributes.
- **FAQ Accordion (`FAQ_IMPLEMENTATION = NATIVE_DETAILS_SUMMARY`):**
  - Native `<details>`/`<summary>` implementation (5 items).
  - Starts 100% collapsed on load.
  - Keyboard `Enter` key toggle verified operational.

### Claimables Directory Data State

- **Route:** `/claimables`
- **Deployed State:** `CLAIMABLE_DIRECTORY_DATA_STATE = VALID_ZERO_RESULTS`
- **Notice:** Displays `EmptyDirectoryNotice` ("No published claimables yet").
- **Verification:** 0 database errors returned. Query succeeds cleanly with 0 published items.

---

## 4. Screenshot Evidence Artifacts (`docs/checkpoints/browser-evidence/legacy-ca3a010/`)

- Historical visual captures preserved under `docs/checkpoints/browser-evidence/legacy-ca3a010/`.
- Final release evidence for `FINAL_SHA` generated externally outside Git.
