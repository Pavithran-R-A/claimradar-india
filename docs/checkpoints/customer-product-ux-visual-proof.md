# ClaimRadar India — Customer Product UX Visual Proof

**Evidence Session:** 2026-08-12  
**Target Environment:** Deployed Staging (`DEPLOYED_STAGING`)  
**Deployment URL:** `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`  
**Deployment SHA:** `ca3a010846e3dcba8059897d6155f5145668bafc` (equals `REPOSITORY_HEAD`)  
**Bypass Protocol:** Vercel Automation Bypass via `BrowserContext.extraHTTPHeaders` (`x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie: true`)  
**Safety Controls:** `AUTO_VERIFY_CLAIMABLES=false` | `ENABLE_BILLING=false` | `NOTIFY_CUSTOMERS_ENABLED=false`

---

## 1. Evidence Collection Method

- **Bypass Verification:** Playwright context configured with official Vercel automation bypass headers from initial navigation. Confirmed `200 OK` on ClaimRadar application routes; `Log in to Vercel` auth wall absent.
- **Evidence Origin:** All `stg-*.png` screenshots captured directly against live Vercel staging deployment.

---

## 2. Deployed Viewport Matrix (Live Staging)

| Viewport | Dimensions | Title Verified | H1 Verified | Floating Right Controls | Mobile Drawer Operable |
|:---|:---|:---:|:---:|:---:|:---:|
| **XL Desktop** | 1536×960 | ✅ | ✅ | `0` | N/A |
| **Standard Desktop** | 1440×900 | ✅ | ✅ | `0` | N/A |
| **Medium Desktop** | 1280×800 | ✅ | ✅ | `0` | N/A |
| **Tablet Landscape** | 1024×768 | ✅ | ✅ | `0` | N/A |
| **Tablet Portrait** | 768×1024 | ✅ | ✅ | `0` | ✅ |
| **Mobile Large** | 430×932 | ✅ | ✅ | `0` | ✅ |
| **Mobile Standard** | 390×844 | ✅ | ✅ | `0` | ✅ |
| **Mobile Compact** | 360×800 | ✅ | ✅ | `0` | ✅ |

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

## 4. Screenshot Evidence Artifacts (`docs/checkpoints/browser-evidence/`)

- `stg-home-desktop-1536-top.png`, `stg-home-desktop-1536-mid.png`, `stg-home-desktop-1536-footer.png`
- `stg-home-desktop-1440-top.png`, `stg-home-desktop-1440-mid.png`, `stg-home-desktop-1440-footer.png`
- `stg-home-desktop-1280-top.png`, `stg-home-desktop-1280-mid.png`, `stg-home-desktop-1280-footer.png`
- `stg-home-tablet-1024-top.png`, `stg-home-tablet-1024-mid.png`, `stg-home-tablet-1024-footer.png`
- `stg-home-tablet-768-top.png`, `stg-home-tablet-768-mid.png`, `stg-home-tablet-768-footer.png`
- `stg-home-mobile-430-top.png`, `stg-home-mobile-430-mid.png`, `stg-home-mobile-430-footer.png`
- `stg-home-mobile-390-top.png`, `stg-home-mobile-390-mid.png`, `stg-home-mobile-390-footer.png`
- `stg-home-mobile-360-top.png`, `stg-home-mobile-360-mid.png`, `stg-home-mobile-360-footer.png`
- `stg-mobile-drawer-open.png`, `stg-mobile-drawer-closed.png`
- `stg-claimables-1440-top.png`, `stg-claimables-390-top.png`, `stg-login-1440-top.png`, `stg-register-1440-top.png`
