# Customer Product UX Audit & Design Decision Record

## 1. Executive Summary

This document records the UX audit, design decisions, and structural component changes implemented to transform the **ClaimRadar India** customer product experience into a high-trust, responsive, consumer-ready information platform.

---

## 2. Confirmed UI Defects & Remediation Strategy

| Observed UX Defect                  | Technical & Layout Root Cause                                                                                                                        | Remediation Applied                                                                                                                                                                          |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Inverted Homepage Hierarchy**  | Homepage rendered evidence flow diagrams and lengthy methodology text before surfacing claim opportunities.                                          | Re-ordered homepage: Primary Hero with prominent search → Latest Verified Opportunities → Closing Soon → How It Works → FAQ → Footer.                                                        |
| **B. Broken Empty Product Areas**   | When 0 opportunities were published, giant empty containers and 2-column empty grids for companies/sectors rendered, making the site look abandoned. | Replaced zero-data containers with a compact, intentional `EmptyDirectoryNotice` explaining verification and offering next actions. Omitted zero-count sector/company grids when counts = 0. |
| **C. Stretched Desktop Rhythm**     | Excessive vertical padding (120px+) and wide empty white areas between sections on 1440px+ viewports.                                                | Normalized section vertical padding (48px–64px desktop), added balanced container max-widths (`max-w-content`), and improved typography leading.                                             |
| **D. Broken Desktop Footer**        | Fragile tailwind grid layout collapsed into a single left column on desktop with vast dark empty space.                                              | Rebuilt footer into a responsive 5-column grid layout (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`) across Discover, Learn, Trust, and Legal columns.                         |
| **E. Incomplete Navigation**        | Header exposed raw directory links without clear call-to-actions for account or alert creation.                                                      | Streamlined header navigation to `Find claims`, `Closing soon`, `Companies`, `Sectors`, `How it works`, and added prominent `Get alerts` CTA button.                                         |
| **F. Oversized Hero Search**        | Hero search bar lacked distinct focus rings and clear affordance for mobile/desktop viewports.                                                       | Added subtle glassmorphism backdrop (`backdrop-blur-md`), sharp teal focus glow, explicit placeholder text, and high-contrast action button.                                                 |
| **G. Misleading Suggestion Labels** | Category buttons underneath hero search were labeled `"Popular searches"`, implying fake user analytics.                                             | Renamed label to `"Explore sectors:"` to remain 100% honest and evidence-backed.                                                                                                             |
| **H. Dominant Methodology**         | 4 giant cards explaining extraction/internal crawler steps dominated the lower hero fold.                                                            | Streamlined into a 3-step overview card grid with a direct link to `/methodology`.                                                                                                           |
| **I. Over-emphasized Status Cards** | 4 large cards explaining statuses took up excessive vertical space.                                                                                  | Removed standalone status section from landing page in favor of contextual card badges and clear status tooltips.                                                                            |
| **J. Documentation-like FAQ**       | FAQ accordion occupied full-page length without clear collapse defaults or semantic controls.                                                        | Converted to compact native `<details>/<summary>` accordion, collapsed by default, with keyboard accessibility and `View all FAQs →` link.                                                   |

---

## 3. Design System & Token Standardization

- **Palette Roles**:
  - `bg-ink-950` / `bg-ink-900`: Deep ink canvas for Hero and Footer header anchors.
  - `bg-background` (`var(--c-background)`): Off-white paper background for content canvas.
  - `bg-surface` (`var(--c-surface)`): White card surfaces with subtle borders (`border-border`).
  - `text-trust-primary` (`#0F766E` / teal-700): Primary action and trust color (4.9:1 WCAG contrast on white).
  - `text-deadline` (`#9E4A08` / saffron): Reserved strictly for deadlines and urgent status indicators.
- **Typography & Scale**:
  - Headings: `font-extrabold` and `font-bold` using `Geist` font family with tight tracking (`tracking-tight`).
  - Body: `text-xs` / `text-sm` / `text-base` with generous line-height (`leading-relaxed`) to prevent dense text blocks.

---

## 4. Responsive Viewport Standards

All layouts verified across standard viewports:

- **Desktop Extra Wide** (`1536 × 960`): 5-column footer grid, 3-column opportunity grid, sticky header with backdrop blur.
- **Desktop Standard** (`1440 × 900`): Compact hero height, zero horizontal scroll, balanced grid margins.
- **Tablet Landscape** (`1024 × 768`): 2-column opportunity grid, 3-column footer grid.
- **Tablet Portrait** (`768 × 1024`): 2-column footer grid, touch-friendly tap targets (minimum 44×44px).
- **Mobile Large** (`430 × 932` / `390 × 844`): Single-column stacked cards, full-screen accessible mobile navigation drawer.
